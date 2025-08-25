// /api/footy.js — Proxy para API-Football (RapidAPI) com cache simples em memória.
// Configure: Settings → Environment Variables → RAPIDAPI_KEY
let CACHE = new Map();
const TTL_MS = 60 * 1000;

export default async function handler(req, res){
  try{
    const { path = "/v3/fixtures", ...query } = req.query;
    const host = "api-football-v1.p.rapidapi.com";
    const url = new URL(`https://${host}${path}`);
    Object.entries(query).forEach(([k,v])=> url.searchParams.set(k, v));
    const key = url.toString();
    const now = Date.now();
    if(CACHE.has(key)){
      const hit = CACHE.get(key);
      if(now - hit.t < TTL_MS){
        res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");
        return res.status(200).json(hit.data);
      } else CACHE.delete(key);
    }
    const r = await fetch(url, { headers: { "x-rapidapi-key": process.env.RAPIDAPI_KEY, "x-rapidapi-host": host } });
    const data = await r.json();
    if(r.status===200){ CACHE.set(key, { t: now, data }); res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30"); }
    res.status(r.status).json(data);
  } catch(err){
    res.status(500).json({ error: true, message: err.message });
  }
}
