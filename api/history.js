// /api/history.js
const RAPID_KEY = process.env.RAPIDAPI_KEY || '';
const HOST = 'api-football-v1.p.rapidapi.com';
const BASE = `https://${HOST}/v3`;

const headers = RAPID_KEY ? {
  'X-RapidAPI-Key': RAPID_KEY,
  'X-RapidAPI-Host': HOST
} : {};

async function fetchJson(url) {
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

function summarize(list) {
  let W=0, D=0, L=0, gf=0, ga=0;
  for (const fx of list) {
    const s = fx.goals || {};
    const home = fx.teams?.home?.id === fx.teamIdRef;
    const gfThis = home ? s.home : s.away;
    const gaThis = home ? s.away : s.home;
    gf += +gfThis || 0; ga += +gaThis || 0;
    if (+gfThis > +gaThis) W++;
    else if (+gfThis === +gaThis) D++;
    else L++;
  }
  const n = list.length || 1;
  return {
    games: list.length,
    W, D, L,
    winRate: +(W/n).toFixed(2),
    goalsForAvg: +(gf/n).toFixed(2),
    goalsAgstAvg: +(ga/n).toFixed(2)
  };
}

function summarizeH2H(list, homeId, awayId) {
  let homeW=0, draws=0, awayW=0;
  for (const fx of list) {
    const h = fx.teams?.home?.id;
    const a = fx.teams?.away?.id;
    const gh = fx.goals?.home ?? 0;
    const ga = fx.goals?.away ?? 0;
    if (gh === ga) { draws++; continue; }
    const winnerIsHome = gh > ga;
    if (winnerIsHome && h === homeId) homeW++;
    if (!winnerIsHome && a === awayId) awayW++;
  }
  return { games: list.length, homeW, draws, awayW };
}

module.exports = async (req, res) => {
  try {
    const homeId = Number(req.query?.home);
    const awayId = Number(req.query?.away);
    if (!homeId || !awayId) {
      return res.status(200).json({ source:'error', error:'Use ?home=<id>&away=<id>' });
    }

    if (!RAPID_KEY) {
      return res.status(200).json({
        source: 'demo',
        home: { games:0, W:0, D:0, L:0, winRate:0, goalsForAvg:0, goalsAgstAvg:0 },
        away: { games:0, W:0, D:0, L:0, winRate:0, goalsForAvg:0, goalsAgstAvg:0 },
        h2h:  { games:0, homeW:0, draws:0, awayW:0 }
      });
    }

    const last = 10;

    const [homeFx, awayFx, h2hFx] = await Promise.all([
      fetchJson(`${BASE}/fixtures?team=${homeId}&last=${last}`),
      fetchJson(`${BASE}/fixtures?team=${awayId}&last=${last}`),
      fetchJson(`${BASE}/fixtures/headtohead?h2h=${homeId}-${awayId}&last=${last}`)
    ]);

    const homeList = (homeFx?.response || []).map(x => ({...x, teamIdRef: homeId}));
    const awayList = (awayFx?.response || []).map(x => ({...x, teamIdRef: awayId}));
    const h2hList  = (h2hFx?.response || []);

    return res.status(200).json({
      source: 'api',
      home: summarize(homeList),
      away: summarize(awayList),
      h2h : summarizeH2H(h2hList, homeId, awayId)
    });
  } catch (err) {
    return res.status(200).json({ source:'error', error: String(err?.message || err) });
  }
};