// /api/history.js  -> últimos 10 jogos mandante/visitante + H2H
const RAPID = process.env.RAPIDAPI_KEY;
const HOST  = 'v3.football.api-sports.io';
const BASE  = `https://${HOST}`;

export default async function handler(req, res) {
  const homeId = Number(req.query.home);
  const awayId = Number(req.query.away);

  try {
    if (!homeId || !awayId) {
      return res.status(200).json({ source:'error', error:'Use ?home=<id>&away=<id>' });
    }
    if (!RAPID) {
      return res.status(200).json({ source:'demo', note:'Sem RAPIDAPI_KEY', home:{}, away:{}, h2h:{} });
    }

    const [home, away, h2h] = await Promise.allSettled([
      apiJson(`/fixtures?team=${homeId}&last=10`),
      apiJson(`/fixtures?team=${awayId}&last=10`),
      apiJson(`/fixtures/headtohead?h2h=${homeId}-${awayId}&last=10`)
    ]);

    const homeList = ok(home)?.response ?? [];
    const awayList = ok(away)?.response ?? [];
    const  h2hList = ok(h2h)?.response ?? [];

    const summary = {
      home: summarize(homeList, homeId),
      away: summarize(awayList, awayId),
      h2h : summarizeH2H(h2hList, homeId)
    };

    res.status(200).json({ source:'api', ...summary });
  } catch (err) {
    console.error('[history] error:', err);
    res.status(200).json({ source:'error', error:String(err?.message||err) });
  }
}

// -------- helpers
function ok(p) { return p && p.status === 'fulfilled' ? p.value : null; }

function summarize(list, teamId) {
  let W=0,D=0,L=0, gf=0, ga=0, n=0;
  for (const item of list) {
    const t = item.teams || {};
    const s = item.goals || {};
    const isHome = t.home?.id === teamId;
    const goalsFor  = isHome ? s.home ?? 0 : s.away ?? 0;
    const goalsAgst = isHome ? s.away ?? 0 : s.home ?? 0;
    gf += goalsFor; ga += goalsAgst;
    if (goalsFor > goalsAgst) W++; else if (goalsFor === goalsAgst) D++; else L++;
    n++;
  }
  return {
    games: n, W, D, L,
    winRate: n ? +(W/n).toFixed(2) : 0,
    goalsForAvg: n ? +(gf/n).toFixed(2) : 0,
    goalsAgstAvg: n ? +(ga/n).toFixed(2) : 0
  };
}

function summarizeH2H(list, homeId) {
  let homeW=0, draws=0, awayW=0, n=0;
  for (const item of list) {
    const t = item.teams || {};
    const g = item.goals || {};
    const gh = g.home ?? 0, ga = g.away ?? 0;
    const isHomeHomeTeam = t.home?.id === homeId; // se o time A está como mandante nesse jogo
    if (gh === ga) draws++;
    else {
      const homeWinner = gh > ga;
      if (homeWinner === isHomeHomeTeam) homeW++;
      else awayW++;
    }
    n++;
  }
  return { games:n, homeW, draws, awayW };
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
