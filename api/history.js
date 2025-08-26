// api/history.js — últimos 10 jogos de cada time + H2H (Head to Head)
const RAPID_KEY = process.env.RAPIDAPI_KEY;
const HOST = "api-football-v1.p.rapidapi.com";
const BASE = https://${HOST}/v3;
const headers = { "x-rapidapi-key": RAPID_KEY || "", "x-rapidapi-host": HOST };

export default async function handler(req, res){
  try{
    if (!RAPID_KEY) return res.status(200).json({ source:"demo", note:"Sem RAPIDAPI_KEY" });

    const homeId = Number(req.query.home);
    const awayId = Number(req.query.away);
    if (!homeId || !awayId) return res.status(400).json({ error:"Informe ?home=<id>&away=<id>" });

    // últimos 10 jogos por time
    const [homeJ, awayJ] = await Promise.all([
      fetchJson(${BASE}/fixtures?team=${homeId}&last=10),
      fetchJson(${BASE}/fixtures?team=${awayId}&last=10)
    ]);
    // últimos confrontos diretos (até 10)
    const h2h = await fetchJson(${BASE}/fixtures/headtohead?h2h=${homeId}-${awayId}&last=10);

    const homeStats = summarizeMatches(homeJ?.response || [], homeId);
    const awayStats = summarizeMatches(awayJ?.response || [], awayId);
    const h2hStats  = summarizeH2H(h2h?.response || [], homeId, awayId);

    return res.status(200).json({ source:"api", home:homeStats, away:awayStats, h2h:h2hStats });
  }catch(err){
    return res.status(200).json({ source:"error", error:String(err) });
  }
}

async function fetchJson(url){ const r = await fetch(url, { headers, next:{revalidate:0} }); if(!r.ok) throw new Error(HTTP ${r.status}); return r.json(); }

function summarizeMatches(list, teamId){
  let W=0,D=0,L=0, gf=0, ga=0;
  for(const fx of list){
    const homeId = fx.teams?.home?.id;
    const isHome = (homeId === teamId);
    const goalsFor  = isHome ? fx.goals?.home ?? 0 : fx.goals?.away ?? 0;
    const goalsAgst = isHome ? fx.goals?.away ?? 0 : fx.goals?.home ?? 0;
    gf += goalsFor; ga += goalsAgst;
    if (goalsFor>goalsAgst) W++; else if (goalsFor===goalsAgst) D++; else L++;
  }
  const n = list.length || 1;
  return {
    games: n, W, D, L,
    winRate: +(W/n).toFixed(2),
    goalsForAvg: +(gf/n).toFixed(2),
    goalsAgstAvg: +(ga/n).toFixed(2)
  };
}
function summarizeH2H(list, homeId, awayId){
  let homeW=0, draws=0, awayW=0;
  for(const fx of list){
    const h = fx.teams?.home?.id, a = fx.teams?.away?.id;
    const gh = fx.goals?.home ?? 0, ga = fx.goals?.away ?? 0;
    if (gh===ga) { draws++; continue; }
    const winner = gh>ga ? h : a;
    if (winner===homeId) homeW++; else if (winner===awayId) awayW++;
  }
  const n = list.length || 1;
  return { games:n, homeW, draws, awayW, homeEdge: +((homeW/n)).toFixed(2) };
}
