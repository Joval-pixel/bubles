export default async function handler(req, res) {
  try {
    const headers = {
      "X-RapidAPI-Key": process.env.API_KEY,
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    };

    // jogos do dia (você pode trocar por /fixtures?live=all para ao vivo)
    const today = new Date().toISOString().slice(0, 10);

    const resp = await fetch(
      `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${today}`,
      { headers }
    );

    const json = await resp.json();
    const list = json?.response || [];

    // mapeia só o que precisamos
    const games = list.slice(0, 80).map((m) => {
      const stats = m.statistics || [];
      const get = (teamIdx, type) =>
        (stats[teamIdx]?.statistics?.find((s) => s.type === type)?.value) || 0;

      // estatísticas (quando não vierem, ficam 0)
      const shotsHome = Number(get(0, "Total Shots")) || 0;
      const shotsAway = Number(get(1, "Total Shots")) || 0;

      const cornersHome = Number(get(0, "Corner Kicks")) || 0;
      const cornersAway = Number(get(1, "Corner Kicks")) || 0;

      const attacksHome = Number(get(0, "Dangerous Attacks")) || 0;
      const attacksAway = Number(get(1, "Dangerous Attacks")) || 0;

      const minute = m.fixture?.status?.elapsed || 0;

      // ⚠️ odds: muitas vezes exigem endpoint pago; aqui simulamos leve variação
      // se você tiver odds reais, substitua por leitura do endpoint /odds
      const odds = 1.5 + Math.random() * 2; // 1.5–3.5

      return {
        id: m.fixture.id,
        game: `${m.teams.home.name} x ${m.teams.away.name}`,
        minute,

        shots: shotsHome + shotsAway,
        corners: cornersHome + cornersAway,
        dangerous: attacksHome + attacksAway,

        odds,
      };
    });

    res.status(200).json(games);
  } catch (e) {
    console.log("API error:", e.message);
    res.status(500).json({ error: "Erro API" });
  }
}
