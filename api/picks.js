module.exports = async (req, res) => {
  try {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "RAPIDAPI_KEY não configurada no Vercel" });
      return;
    }

    const { fixture } = req.query || {};
    if (!fixture) {
      res.status(400).json({ error: "Passe ?fixture=<id> na URL" });
      return;
    }

    const r = await fetch(
      `https://api-football-v1.p.rapidapi.com/v3/predictions?fixture=${fixture}`,
      {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
        }
      }
    );

    const data = await r.json();
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    res.status(r.ok ? 200 : r.status).json(data);
  } catch (err) {
    console.error("Erro em /api/picks:", err);
    res.status(500).json({ error: "Falha ao buscar previsões" });
  }
};
