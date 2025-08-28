// api/history.js — últimas 10 partidas + H2H — CommonJS
const RAPID_KEY = process.env.RAPIDAPI_KEY;
const HOST = "api-football-v1.p.rapidapi.com";
const BASE = `https://${HOST}/v3`;
const H = { "x-rapidapi-key": RAPID_KEY || "", "x-rapidapi-host": HOST };

module.exports = async (req, res) => {
  try {
    const homeId = Number(req.query.home);
    const awayId = Number(req.query.away);
    if (!homeId || !awayId) {
      return res.status(200).json({ source: "error", error: "Use ?home=<id>&away=<id>" });
    }
    if (!RAPID_KEY) {
      return res.status(200).json({
        source: "demo",
        note: "Sem RAPIDAPI_KEY",
        home: { games: 10, W:5, D:2, L:3, winRate:0.5, goalsForAvg:1.6, goalsAgstAvg:1.2 },
        away: { games: 10, W:4, D:3, L:3, winRate:0.4, goalsForAvg:1.3, goalsAgstAvg:1.1 },
        h2h : { games: 6, homeW: 2, draws: 2, awayW: 2 }
      });
    }

    const [homeJ, awayJ, h2hJ] = await Promise.allSettled([
      j(`${BASE}/fixtures?team=${homeId}&last=10`),
      j(`${BASE}/fixtures?team=${awayId}&last=10`),
      j(`${BASE}/fixtures/headtohead?h2h=${homeId}-${awayId}&last=10`)
    ]);

    const home = summarizeMatches(homeJ.status === "fulfilled" ? (homeJ.value?.response || []) : [], homeId);
    const away = summarizeMatches(awayJ.status === "fulfilled" ? (awayJ.value?.response || []) : [], awayId);
    const h2h  = summarizeH2H(h2hJ.status  === "fulfilled" ? (h2hJ.value?.response  || []) : [], homeId);

    return res.status(200).json({ source:"api", home, away, h2h });
  } catch (err) {
    return res.status(200).json({ source: "error", error: String(err?.message || err) });
  }
};

/* helpers */
async function j(url){ const r = await fetch(url, { headers: H, next: { revalidate: 0 } }); if (!r.ok){ let t=""; try{ t=await r.text(); }catch{} throw new Error(`HTTP ${r.status} – ${t.slice(0,180)}`); } return r.json(); }
function summarizeMatches(list, myId){ let W=0,D=0,L=0,gf=0,ga=0; for(const f of list){ const hs=Number(f.goals?.home ?? f.score?.fulltime?.home ?? 0); const as=Number(f.goals?.away ?? f.score?.fulltime?.away ?? 0); const isHome = (f.teams?.home?.id === myId); const my = isHome?hs:as; const op=isHome?as:hs; if(my>op)W++; else if(my===op)D++; else L++; gf+=my; ga+=op; } const n=list.length||1; return { games:list.length, W,D,L, winRate:+(W/n).toFixed(2), goalsForAvg:+(gf/n).toFixed(2), goalsAgstAvg:+(ga/n).toFixed(2) }; }
function summarizeH2H(list, homeId){ let homeW=0,draws=0,awayW=0; for(const f of list){ const hs=Number(f.goals?.home ?? f.score?.fulltime?.home ?? 0); const as=Number(f.goals?.away ?? f.score?.fulltime?.away ?? 0); if(hs===as){draws++;continue;} const isHome=(f.teams?.home?.id===homeId); const homeWon = hs>as; if((isHome&&homeWon)||(!isHome&&!homeWon)) homeW++; else awayW++; } return { games:list.length, homeW, draws, awayW }; }
