// /api/footy.js — Proxy para API-Football (RapidAPI)
// Use sua chave em: Vercel → Settings → Environment Variables → RAPIDAPI_KEY

let CACHE = new Map();              // cache simples em memória
const TTL_MS = 60 * 1000;           // 60s de cache

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  try {
    // caminho solicitado (ex.: /v3/fixtures)
    const { path = "/v3/fixtures", ...query } = req.query;
    const host = "api-football-v1.p.rapidapi.com";
    const url = new URL(`https://${host}${path}`);
    Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));

    // se não tiver chave configurada, retorna demo
    if (!process.env.RAPIDAPI_KEY) {
      return res.status(200).json({
        response: [],
        demo: true,
        message: "RAPIDAPI_KEY não configurada na Vercel"
      });
    }

    // cache
    const key = url.toString();
    const now = Date.now();
    const hit = CACHE.get(key);
    if (hit && (now - hit.t) < TTL_MS) {
      res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");
      return res.status(200).json(hit.data);
    }

    // request para a API-Football
    const r = await fetch(url, {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": host
      }
    });
    const data = await r.json();

    if (r.status === 200) {
      CACHE.set(key, { t: now, data });
      res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=30");
    }

    res.status(r.status).json(data);
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
}
