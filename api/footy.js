// /api/footy.js — Proxy para API-Football (RapidAPI)
// Configure a env var: RAPIDAPI_KEY

export default async function handler(req, res){
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try{
    const { path = "/v3/fixtures", ...query } = req.query;
    const host = "api-football-v1.p.rapidapi.com";
    const url = new URL(`https://${host}${path}`);
    Object.entries(query).forEach(([k,v])=> url.searchParams.set(k, v));

    // Verificar se a chave da API está configurada
    if (!process.env.RAPIDAPI_KEY) {
      return res.status(500).json({ 
        error: true, 
        message: "RAPIDAPI_KEY não configurada. Configure a variável de ambiente no Vercel." 
      });
    }

    const r = await fetch(url, {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": host
      }
    });
    
    const data = await r.json();
    res.status(r.status).json(data);
  } catch(err){
    console.error('API Error:', err);
    res.status(500).json({ error: true, message: err.message });
  }
}
