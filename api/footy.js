module.exports = async (req, res) => {
  try {
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "RAPIDAPI_KEY não configurada no Vercel" });
      return;
    }

    const { next = 20, league, season, date, live } = req.query || {};
    const params = new URLSearchParams({
      next,
      ...(league && { league }),
      ...(season && { season }),
      ...(date && { date }),
      ...(live && { live })
    });

    const r = await fetch(
      `https://api-football-v1.p.rapidapi.com/v3/fixtures?${params.toString()}`,
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
    console.error("Erro em /api/footy:", err);
    res.status(500).json({ error: "Falha ao buscar fixtures" });
  }
};
