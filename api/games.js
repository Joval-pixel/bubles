export default async function handler(req, res) {
  try {
    const headers = {
      "X-RapidAPI-Key": process.env.API_KEY,
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    };

    // 🔥 jogos ao vivo
    const response = await fetch(
      "https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all",
      { headers }
    );

    const data = await response.json();

    const games = [];

    for (const g of data.response) {
      // 🔥 pegar estatísticas completas
      const statsRes = await fetch(
        `https://api-football-v1.p.rapidapi.com/v3/fixtures/statistics?fixture=${g.fixture.id}`,
        { headers }
      );

      const statsData = await statsRes.json();

      const stats = statsData.response?.[0]?.statistics || [];

      const getStat = (name) =>
        parseInt(
          stats.find((s) => s.type === name)?.value || 0
        );

      games.push({
        id: g.fixture.id,
        game: `${g.teams.home.name} vs ${g.teams.away.name}`,
        minute: g.fixture.status.elapsed || 0,

        // 🔥 DADOS REAIS
        corners: getStat("Corner Kicks"),
        shots: getStat("Total Shots"),
        attacks: getStat("Attacks"),
        dangerous: getStat("Dangerous Attacks"),

        // ⚠️ odds (simulação por enquanto)
        odds: 1.5 + Math.random() * 2,
      });
    }

    res.status(200).json(games);
  } catch (e) {
    res.status(500).json({ error: "Erro API" });
  }
}
