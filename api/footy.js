// /api/footy.js
const RAPID_KEY = process.env.RAPIDAPI_KEY || '';
const HOST = 'api-football-v1.p.rapidapi.com';
const BASE = `https://${HOST}/v3`;
const MAX_CONCURRENCY = 6;

// Helpers
const headers = RAPID_KEY ? {
  'X-RapidAPI-Key': RAPID_KEY,
  'X-RapidAPI-Host': HOST
} : {};

const sleep = (ms)=> new Promise(r=>setTimeout(r,ms));

function impliedProb(odd) {
  const o = Number(odd);
  return (o > 1) ? (1 / o) : 0;
}
function bestPickFromOdds(odds) {
  // odds: {home, draw, away, over25, under25}
  const entries = [];
  if (odds.home) entries.push(['Casa', impliedProb(odds.home)]);
  if (odds.draw) entries.push(['Empate', impliedProb(odds.draw)]);
  if (odds.away) entries.push(['Fora', impliedProb(odds.away)]);
  if (odds.over25) entries.push(['Over 2.5', impliedProb(odds.over25)]);
  if (odds.under25) entries.push(['Under 2.5', impliedProb(odds.under25)]);
  if (!entries.length) return { bestPick:null, bestProb:0 };
  entries.sort((a,b)=> b[1]-a[1]);
  return { bestPick: entries[0][0], bestProb: entries[0][1] };
}

async function fetchJson(url) {
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function fixturesByDate(iso) {
  const url = `${BASE}/fixtures?date=${iso}`;
  const j = await fetchJson(url);
  return Array.isArray(j?.response) ? j.response : [];
}

async function oddsForFixture(fixtureId) {
  // Odds: /odds?fixture=<id> (retorna lista por bookmaker/market)
  const url = `${BASE}/odds?fixture=${fixtureId}`;
  const j = await fetchJson(url);

  const data = j?.response?.[0];
  if (!data) return {};

  // Varre mercados comuns para buscar uma casa (qualquer)
  const markets = data.bookmakers?.[0]?.bets || [];
  let out = {};
  for (const m of markets) {
    if (m.name === 'Match Winner' || m.name === '1X2') {
      for (const v of m.values || []) {
        if (v.value === 'Home') out.home = v.odd;
        if (v.value === 'Draw') out.draw = v.odd;
        if (v.value === 'Away') out.away = v.odd;
      }
    }
    if (m.name?.startsWith('Over/Under')) {
      for (const v of m.values || []) {
        if (v.value === 'Over 2.5') out.over25 = v.odd;
        if (v.value === 'Under 2.5') out.under25 = v.odd;
      }
    }
  }
  return out;
}

async function enrich(fx) {
  const fixtureId = fx.fixture?.id;
  const home = { id: fx.teams?.home?.id, name: fx.teams?.home?.name };
  const away = { id: fx.teams?.away?.id, name: fx.teams?.away?.name };
  const kickoff = fx.fixture?.date;

  let odds = {};
  try {
    odds = await oddsForFixture(fixtureId);
  } catch(_) {}

  const pick = bestPickFromOdds(odds);

  return { id: fixtureId, kickoff, home, away, odds, ...pick };
}

async function runLimited(arr, limit, worker){
  const out = [];
  let i = 0, running = 0, cursor = 0;
  return new Promise((resolve) => {
    const next = () => {
      if (cursor >= arr.length && running === 0) return resolve(out);
      while (running < limit && cursor < arr.length) {
        const idx = cursor++;
        running++;
        Promise.resolve(worker(arr[idx], idx))
          .then(v => out[idx]=v)
          .catch(()=> out[idx]=null)
          .finally(()=>{ running--; next(); });
      }
    };
    next();
  });
}

module.exports = async (req, res) => {
  try {
    const date = (req.query?.date && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date))
      ? req.query.date
      : new Date().toISOString().slice(0,10);

    // Sem API → modo demo (não gera 500)
    if (!RAPID_KEY) {
      return res.status(200).json({
        source: 'demo',
        date,
        matches: []
      });
    }

    const fixtures = await fixturesByDate(date);
    if (!fixtures.length) {
      return res.status(200).json({ source:'api', date, matches: [] });
    }

    const enriched = await runLimited(fixtures, MAX_CONCURRENCY, enrich);
    const matches = enriched.filter(Boolean);

    return res.status(200).json({ source:'api', date, matches });
  } catch (err) {
    return res.status(200).json({
      source: 'error',
      error: String(err?.message || err)
    });
  }
};