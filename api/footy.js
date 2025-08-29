// /api/footy.js  -> lista TODOS os jogos do dia, com uma confiança simples
const RAPID = process.env.RAPIDAPI_KEY;
const HOST  = 'v3.football.api-sports.io';
const BASE  = `https://${HOST}`;

export default async function handler(req, res) {
  const iso = (req.query.date || new Date().toISOString().slice(0,10));

  try {
    if (!RAPID) {
      return res.status(200).json({ source:'demo', note:'Sem RAPIDAPI_KEY', matches:[] });
    }

    const fixtures = await apiJson(`/fixtures?date=${iso}`);
    const list = (fixtures?.response ?? []).map(fx => toMatch(fx));

    // “confiança” simples: mais conhecida liga => mais confiança
    for (const m of list) m.confidence = leagueWeight(m.league.id) * 0.75;

    res.status(200).json({ source:'api', date: iso, matches: list });
  } catch (err) {
    console.error('[footy] error:', err);
    res.status(200).json({ source:'error', error: String(err?.message || err) });
  }
}

// -------- helpers
function toMatch(fx) {
  const fixture = fx.fixture || {};
  const league  = fx.league || {};
  const teams   = fx.teams || {};
  return {
    id: fixture.id,
    kickoff_ts: Math.floor((fixture.timestamp || Date.now()/1000)),
    league: { id: league.id, name: league.name, country: league.country },
    home: { id: teams.home?.id, name: teams.home?.name },
    away: { id: teams.away?.id, name: teams.away?.name }
  };
}

function leagueWeight(leagueId) {
  if (!leagueId) return 0.3;
  // pesos simples por ligas populares (ajuste como quiser)
  const top = new Set([39,140,135,78,61,2,3,4,5,94,848]); // EPL, LaLiga, Serie A, Bundesliga, Ligue 1, etc
  if (top.has(leagueId)) return 0.95;
  return 0.55;
}

async function apiJson(path) {
  const r = await fetch(`${BASE}${path}`, {
    headers: {
      'x-rapidapi-key': RAPID,
      'x-rapidapi-host': HOST
    },
    cache: 'no-store'
  });
  if (!r.ok) {
    const t = await r.text().catch(()=> '');
    throw new Error(`API ${path} -> ${r.status} ${r.statusText} ${t}`);
  }
  return r.json();
}
