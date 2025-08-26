// api/history.js — últimos 10 jogos + H2H (CommonJS, à prova de falhas)
const RAPID_KEY = process.env.RAPIDAPI_KEY;
const HOST = "api-football-v1.p.rapidapi.com";
const BASE = `https://${HOST}/v3`;
const headers = { "x-rapidapi-key": RAPID_KEY || "", "x-rapidapi-host": HOST };

module.exports = async (req, res) => {
  try {
    const homeId = Number(req.query.home);
    const awayId = Number(req.query.away);

    if (!homeId || !awayId) {
      return res.status(200).json({ source: "error", error: "Use ?home=<id>&away=<id>" });
    }
    if (!RAPID_KEY) {
      return res.status(200).json({ source: "demo", note: "Sem RAPIDAPI_KEY" });
    }

    const [homeJ, awayJ, h2h] = await Promise.allSettled([
      fetchJson(`${BASE}/fixtures?team=${homeId}&last=10`),
      fetchJson(`${BASE}/fixtures?team=${awayId}&last=10`),
      fetchJson(`${BASE}/fixtures/headtohead?h2h=${homeId}-${awayId}&last=10`)
    ]);

    const homeList = homeJ.status === "fulfilled" ? (homeJ.value?.response || []) : [];
    const awayList = awayJ.status === "fulfilled" ? (awayJ.value?.response || []) : [];
    const h2hList  = h2h.status  === "fulfilled" ? (h2h.value?.response  || []) : [];

    const homeStats = summarizeMatches(homeList, homeId);
    const awayStats = summarizeMatches(awayList, awayId);
    const h2hStats  = summarizeH2H(h2hList, homeId, awayId);

    return res.status(200).json({
      source: "api",
      degraded: (homeJ.status !== "fulfilled" || awayJ.status !== "fulfilled" || h2h.status !== "fulfilled"),
      home: homeStats,
      away: awayStats,
      h2h:  h2hStats
    });
  } catch (err) {
    return res.status(200).json({ source: "error", error: String(err?.message || err) });
  }
};

/* ----------------- helpers ----------------- */

async function fetchJson(url) {
  const r = await fetch(url, { headers, next: { revalidate: 0 } });
  if (!r.ok) {
    let txt = "";
    try { txt = await r.text(); } catch {}
    throw new Error(`HTTP ${r.status} – ${txt.slice(0, 200)}`);
  }
  return r.json();
}

function summarizeMatches(list, teamId) {
  let W = 0, D = 0, L = 0, gf = 0, ga = 0;
  for (const fx of list) {
    const homeId = fx?.teams?.home?.id;
    const isHome = homeId === teamId;
    const gh = Number(fx?.goals?.home ?? 0);
    const gaA = Number(fx?.goals?.away ?? 0);
    const goalsFor  = isHome ? gh  : gaA;
    const goalsAgst = isHome ? gaA : gh;
    gf += goalsFor; ga += goalsAgst;
    if (goalsFor > goalsAgst) W++; else if (goalsFor === goalsAgst) D++; else L++;
  }
  const n = list.length || 1;
  return {
    games: list.length,
    W, D, L,
    winRate: +(W / n).toFixed(2),
    goalsForAvg: +((gf / n)).toFixed(2),
    goalsAgstAvg: +((ga / n)).toFixed(2)
  };
}

function summarizeH2H(list, homeId, awayId) {
  let homeW = 0, draws = 0, awayW = 0;
  for (const fx of list) {
    const h = fx?.teams?.home?.id, a = fx?.teams?.away?.id;
    const gh = Number(fx?.goals?.home ?? 0), ga = Number(fx?.goals?.away ?? 0);
    if (gh === ga) { draws++; continue; }
    const winner = gh > ga ? h : a;
    if (winner === homeId) homeW++; else if (winner === awayId) awayW++;
  }
  const n = list.length || 1;
  return { games: list.length, homeW, draws, awayW, homeEdge: +((homeW / n)).toFixed(2) };
}
