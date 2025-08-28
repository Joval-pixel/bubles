// api/footy.js — Jogos do dia + logos + odds (1x2 e Over/Under 2.5) — CommonJS
const RAPID_KEY = process.env.RAPIDAPI_KEY;
const HOST = "api-football-v1.p.rapidapi.com";
const BASE = `https://${HOST}/v3`;
const H = { "x-rapidapi-key": RAPID_KEY || "", "x-rapidapi-host": HOST };
const MAX_CONCURRENCY = 8;

module.exports = async (req, res) => {
  try {
    const date = (req.query?.date && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date))
      ? req.query.date
      : new Date().toISOString().slice(0, 10);

    if (!RAPID_KEY) {
      return res.status(200).json({
        source: "demo",
        date,
        matches: [
          demo("Flamengo", 33, "/flamengo.png", "Palmeiras", 34, "/palmeiras.png", "Brasil", "Série A", `${date}T19:00:00Z`),
          demo("Santos", 44, "/santos.png", "Corinthians", 59, "/corinthians.png", "Brasil", "Série A", `${date}T21:00:00Z`)
        ]
      });
    }

    // 1) Fixtures do dia
    const fx = await j(`${BASE}/fixtures?date=${date}`);
    const fixtures = (fx?.response || []).map(f => ({
      fixtureId: f.fixture?.id,
      kickoff: f.fixture?.date,
      status: f.fixture?.status?.short,
      league: f.league?.name || "",
      country: f.league?.country || "",
      home: { id: f.teams?.home?.id, name: f.teams?.home?.name, logo: f.teams?.home?.logo },
      away: { id: f.teams?.away?.id, name: f.teams?.away?.name, logo: f.teams?.away?.logo },
      goals: { home: f.goals?.home ?? 0, away: f.goals?.away ?? 0 },
      odds: { "1x2": null, "over_under_2_5": null }
    })).filter(m => m.home.id && m.away.id && m.fixtureId);

    // 2) Odds (concorrência limitada)
    const tasks = fixtures.map(m => async () => addOdds(m));
    const matches = await runLimited(tasks, MAX_CONCURRENCY);

    return res.status(200).json({ source: "api", provider: "api-football", date, matches });
  } catch (err) {
    return res.status(200).json({
      source: "error",
      error: String(err?.message || err),
      date: new Date().toISOString().slice(0,10),
      matches: []
    });
  }
};

/* helpers */
async function j(url) {
  const r = await fetch(url, { headers: H, next: { revalidate: 0 } });
  if (!r.ok) {
    let txt = ""; try { txt = await r.text(); } catch {}
    throw new Error(`HTTP ${r.status} – ${txt.slice(0,180)}`);
  }
  return r.json();
}
async function addOdds(m) {
  try {
    const odds = await j(`${BASE}/odds?fixture=${m.fixtureId}`);
    const books = odds?.response?.[0]?.bookmakers || [];
    const book = books.find(b => /bet\s*365/i.test(b?.name || "")) || books[0];
    const markets = book?.bets || [];

    const mw = markets?.find(b => /match\s*winn|1x2|full.*result/i.test(b?.name || ""));
    if (mw?.values?.length) {
      const home = pickOdd(mw.values, /home|^1$|^1x2:1$/i);
      const draw = pickOdd(mw.values, /draw|^x$|^1x2:x$/i);
      const away = pickOdd(mw.values, /away|^2$|^1x2:2$/i);
      if (home || draw || away) {
        m.odds["1x2"] = toNum({ home, draw, away, bookmaker: book?.name || "", updated: book?.update || null });
      }
    }

    const ou = markets?.find(b => /over\/?under|goals/i.test(b?.name || ""));
    if (ou?.values?.length) {
      const over = pickOdd(ou.values, /over\s*2\.?5/i) ?? pickOdd(ou.values, /^over$/i);
      const under = pickOdd(ou.values, /under\s*2\.?5/i) ?? pickOdd(ou.values, /^under$/i);
      if (over || under) {
        m.odds["over_under_2_5"] = toNum({ over, under, bookmaker: book?.name || "", updated: book?.update || null });
      }
    }
  } catch (_) {}
  return m;
}
function pickOdd(values, rx) { const v = (values || []).find(x => rx.test(String(x.value || x.label || ""))); return v?.odd ?? null; }
function toNum(obj) { const o={}; for (const [k,v] of Object.entries(obj)){ if(v==null){o[k]=null;continue;} const n=Number(String(v).replace(",", ".")); o[k]=Number.isFinite(n)?n:v; } return o; }
async function runLimited(fns, limit){ const out=new Array(fns.length); let i=0; const workers=new Array(Math.min(limit,fns.length)).fill(0).map(async()=>{ while(i<fns.length){ const idx=i++; try{ out[idx]=await fns[idx](); }catch{ out[idx]=null; } } }); await Promise.all(workers); return out.filter(Boolean); }
function demo(hName,hId,hLogo,aName,aId,aLogo,country,league,kickoff){ return { fixtureId:Math.floor(Math.random()*1e8), kickoff, status:"NS", league, country, home:{id:hId,name:hName,logo:hLogo}, away:{id:aId,name:aName,logo:aLogo}, goals:{home:0,away:0}, odds:{ "1x2":{home:2.05,draw:3.25,away:3.60,bookmaker:"DEMO",updated:null}, "over_under_2_5":{over:2.0,under:1.85,bookmaker:"DEMO",updated:null} } }; }
