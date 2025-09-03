export default async function handler(req, res) {
  try {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) return res.status(500).json({ error: "RAPIDAPI_KEY não configurada no Vercel" });

    const { fixture } = req.query;
    if (!fixture) return res.status(400).json({ error: "Passe ?fixture=<id> na URL" });

    const r = await fetch(`https://api-football-v1.p.rapidapi.com/v3/predictions?fixture=${fixture}`, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
      }
    });

    const data = await r.json();
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    return res.status(r.ok ? 200 : r.status).json(data);

  } catch (err) {
    console.error("Erro em /api/picks:", err);
    return res.status(500).json({ error: "Falha ao buscar previsões" });
  }
}
