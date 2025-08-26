// api/footy.js  — TODOS os jogos do dia + odds, com limitação de concorrência
const RAPID_KEY = process.env.RAPIDAPI_KEY;
const HOST = "api-football-v1.p.rapidapi.com";
const BASE = `https://${HOST}/v3`;

// Concorre no máximo N requisições simultâneas (evita estourar o plano grátis)
const MAX_CONCURRENCY = 8;

export default async function handler(req, res) {
  try {
    const { date } = req.query || {};
    const iso = (date && /^\d{4}-\d{2}-\d{2}$/.test(date))
      ? date
      : new Date().toISOString().slice(0, 10);

    // Sem chave -> DEMO
    if (!RAPID_KEY) return res.status(200).json(demoPayload(iso, "Sem RAPIDAPI_KEY"));

    // 1) Buscar TODOS os jogos do dia (a API já pagina por data se necessário)
    const fixtures = await fetchAllFixtures(iso);
    if (!fixtures.length) return res.status(200).json(demoPayload(iso, "Sem fixtures na API"));

    // 2) Enriquecer com odds (1x2 e OU 2.5) com concorrência controlada
    const tasks = fixtures.map(fx => async () => enrichWithOdds(fx));
    const enriched = await runWithConcurrency(tasks, MAX_CONCURRENCY);

    return res.status(200).json({
      source: "api",
      provider: "api-football-v1 (RapidAPI)",
      date: iso,
      matches: enriched
    });

  } catch (err) {
    return res.status(200).json(demoPayload(
      new Date().toISOString().slice(0,10),
      "Erro: " + String(err?.message || err)
    ));
  }
}

/* ----------------- helpers ----------------- */

async function fetchAllFixtures(iso) {
  const url = `${BASE}/fixtures?date=${iso}`;
  const r = await fetch(url, {
    headers: { "x-rapidapi-key": RAPID_KEY, "x-rapidapi-host": HOST },
    next: { revalidate: 0 }
  });
  if (!r.ok) throw new Error(`Fixtures HTTP ${r.status}`);
  const json = await r.json();
  return json?.response || [];
}

async function enrichWithOdds(fx) {
  const f = {
    fixtureId: fx.fixture?.id,
    kickoff: fx.fixture?.date,
    league: joinNonEmpty([fx.league?.name, fx.league?.country]),
    leagueName: fx.league?.name || "",
    leagueCountry: fx.league?.country || "",
    home: fx.teams?.home?.name,
    away: fx.teams?.away?.name,
    label: `${fx.teams?.home?.name} vs ${fx.teams?.away?.name}`,
    odds: { "1x2": null, "over_under_2_5": null }
  };

  try {
    const url = `${BASE}/odds?fixture=${f.fixtureId}`;
    const r = await fetch(url, {
      headers: { "x-rapidapi-key": RAPID_KEY, "x-rapidapi-host": HOST },
      next: { revalidate: 0 }
    });
    if (!r.ok) throw new Error(`Odds HTTP ${r.status}`);
    const oddsResp = await r.json();
    const books = oddsResp?.response?.[0]?.bookmakers || [];
    if (books.length) {
      const bet365 = books.find(b => /bet\s*365/i.test(b.name)) || books[0];
      const markets = bet365?.bets || [];

      const mw = markets.find(m => /match\s*winn|1x2|winner/i.test(m.name || ""));
      if (mw?.values?.length >= 3) {
        const home = findOdd(mw.values, /home|1\b/i)?.odd;
        const draw = findOdd(mw.values, /draw|x\b/i)?.odd;
        const away = findOdd(mw.values, /away|2\b/i)?.odd;
        f.odds["1x2"] = numObj({ home, draw, away, bookmaker: bet365.name, updated: bet365?.update });
      }

      const ou = markets.find(m => /over\/?under|goals/i.test(m.name || ""));
      if (ou?.values?.length) {
        const over = findOdd(ou.values, /over\s*2\.?5/i)?.odd || findOdd(ou.values, /^over$/i)?.odd;
        const under = findOdd(ou.values, /under\s*2\.?5/i)?.odd || findOdd(ou.values, /^under$/i)?.odd;
        if (over || under) f.odds["over_under_2_5"] = numObj({ over, under, bookmaker: bet365.name, updated: bet365?.update });
      }
    }
  } catch (_) {
    // segue sem odds
  }
  return f;
}

function findOdd(arr, rx){ return (arr||[]).find(v => rx.test(String(v.value||v.label||""))); }
function numObj(obj){
  const out={}; for (const [k,v] of Object.entries(obj)) {
    if (v==null) { out[k]=null; continue; }
    const n = Number(String(v).replace(",", "."));
    out[k] = Number.isFinite(n) ? n : v;
  } return out;
}
function joinNonEmpty(a){ return (a||[]).filter(Boolean).join(" — "); }

async function runWithConcurrency(tasks, limit){
  const out = []; let i=0;
  const runners = new Array(Math.min(limit, tasks.length)).fill(0).map(async () => {
    while (i < tasks.length) {
      const idx = i++; const result = await tasks[idx]();
      out[idx] = result;
    }
  });
  await Promise.all(runners);
  return out;
}

function demoPayload(date, note){
  return {
    source: "demo",
    note, date,
    matches: [
      { fixtureId: 1, kickoff: `${date}T18:00:00Z`, league: "Brasil — Série A", leagueName:"Serie A", leagueCountry:"Brazil", home:"Flamengo", away:"Palmeiras",
        label:"Flamengo vs Palmeiras",
        odds:{ "1x2":{home:2.05,draw:3.10,away:3.60,bookmaker:"DEMO",updated:null}, "over_under_2_5":{over:2.02,under:1.84,bookmaker:"DEMO",updated:null} } },
      { fixtureId: 2, kickoff: `${date}T20:00:00Z`, league: "Brasil — Série A", leagueName:"Serie A", leagueCountry:"Brazil", home:"Santos", away:"Corinthians",
        label:"Santos vs Corinthians",
        odds:{ "1x2":{home:2.60,draw:3.10,away:2.70,bookmaker:"DEMO",updated:null}, "over_under_2_5":{over:2.35,under:1.65,bookmaker:"DEMO",updated:null} } }
    ]
  };
}