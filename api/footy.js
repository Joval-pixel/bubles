// api/footy.js — TODOS os jogos do dia + odds + logos/ids dos times (CommonJS)
const RAPID_KEY = process.env.RAPIDAPI_KEY;
const HOST = "api-football-v1.p.rapidapi.com";
const BASE = `https://${HOST}/v3`;
const MAX_CONCURRENCY = 8;
const headers = { "x-rapidapi-key": RAPID_KEY || "", "x-rapidapi-host": HOST };

module.exports = async (req, res) => {
  try {
    const { date } = req.query || {};
    const iso = (date && /^\d{4}-\d{2}-\d{2}$/.test(date))
      ? date
      : new Date().toISOString().slice(0, 10);

    if (!RAPID_KEY) {
      return res.status(200).json(demoPayload(iso, "Sem RAPIDAPI_KEY"));
    }

    const fixtures = await fetchFixtures(iso);
    if (!fixtures.length) {
      return res.status(200).json(demoPayload(iso, "Sem fixtures"));
    }

    const tasks = fixtures.map((fx) => async () => enrichWithOdds(fx));
    const matches = await runWithConcurrency(tasks, MAX_CONCURRENCY);

    return res.status(200).json({ source: "api", provider: "api-football-v1", date: iso, matches });
  } catch (err) {
    return res
      .status(200)
      .json(demoPayload(new Date().toISOString().slice(0, 10), "Erro: " + String(err?.message || err)));
  }
};

/* ----------------- helpers ----------------- */

async function fetchFixtures(iso) {
  const r = await fetch(`${BASE}/fixtures?date=${iso}`, { headers, next: { revalidate: 0 } });
  if (!r.ok) throw new Error(`Fixtures HTTP ${r.status}`);
  const j = await r.json();
  return j?.response || [];
}

async function enrichWithOdds(fx) {
  const f = {
    fixtureId: fx.fixture?.id,
    kickoff: fx.fixture?.date,
    league: [fx.league?.name, fx.league?.country].filter(Boolean).join(" — "),
    leagueName: fx.league?.name || "",
    leagueCountry: fx.league?.country || "",
    home: fx.teams?.home?.name,
    homeId: fx.teams?.home?.id,
    homeLogo: fx.teams?.home?.logo,
    away: fx.teams?.away?.name,
    awayId: fx.teams?.away?.id,
    awayLogo: fx.teams?.away?.logo,
    label: `${fx.teams?.home?.name} vs ${fx.teams?.away?.name}`,
    odds: { "1x2": null, "over_under_2_5": null }
  };

  try {
    const r = await fetch(`${BASE}/odds?fixture=${f.fixtureId}`, { headers, next: { revalidate: 0 } });
    if (!r.ok) throw new Error(`Odds HTTP ${r.status}`);
    const oddsResp = await r.json();
    const books = oddsResp?.response?.[0]?.bookmakers || [];
    if (books.length) {
      const bet365 = books.find((b) => /bet\s*365/i.test(b.name)) || books[0];
      const markets = bet365?.bets || [];

      const mw = markets.find((m) => /match\s*winn|1x2|winner/i.test(m.name || ""));
      if (mw?.values?.length >= 3) {
        const home = pickOdd(mw.values, /home|1\b/i);
        const draw = pickOdd(mw.values, /draw|x\b/i);
        const away = pickOdd(mw.values, /away|2\b/i);
        f.odds["1x2"] = toNumberObj({ home, draw, away, bookmaker: bet365.name, updated: bet365?.update });
      }

      const ou = markets.find((m) => /over\/?under|goals/i.test(m.name || ""));
      if (ou?.values?.length) {
        const over = pickOdd(ou.values, /over\s*2\.?5/i) ?? pickOdd(ou.values, /^over$/i);
        const under = pickOdd(ou.values, /under\s*2\.?5/i) ?? pickOdd(ou.values, /^under$/i);
        if (over || under) {
          f.odds["over_under_2_5"] = toNumberObj({ over, under, bookmaker: bet365.name, updated: bet365?.update });
        }
      }
    }
  } catch (_) {
    // segue sem odds
  }
  return f;
}

function pickOdd(arr, rx) {
  const v = (arr || []).find((x) => rx.test(String(x.value || x.label || "")));
  return v?.odd ?? null;
}
function toNumberObj(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v == null) { out[k] = null; continue; }
    const n = Number(String(v).replace(",", "."));
    out[k] = Number.isFinite(n) ? n : v;
  }
  return out;
}

async function runWithConcurrency(tasks, limit) {
  const out = [];
  let i = 0;
  const workers = new Array(Math.min(limit, tasks.length)).fill(0).map(async () => {
    while (i < tasks.length) {
      const idx = i++;
      out[idx] = await tasks[idx]();
    }
  });
  await Promise.all(workers);
  return out;
}

function demoPayload(date, note) {
  return {
    source: "demo",
    note,
    date,
    matches: [
      {
        fixtureId: 1,
        kickoff: `${date}T18:00:00Z`,
        league: "Brasil — Série A",
        leagueName: "Serie A",
        leagueCountry: "Brazil",
        home: "Flamengo",
        away: "Palmeiras",
        homeId: 33,
        awayId: 34,
        homeLogo: "/flamengo.png",
        awayLogo: "/palmeiras.png",
        label: "Flamengo vs Palmeiras",
        odds: {
          "1x2": { home: 2.05, draw: 3.10, away: 3.60, bookmaker: "DEMO", updated: null },
          "over_under_2_5": { over: 2.02, under: 1.84, bookmaker: "DEMO", updated: null }
        }
      }
    ]
  };
}
