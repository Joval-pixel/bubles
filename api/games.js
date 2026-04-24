export default async function handler(req, res) {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const response = await fetch(
      `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${today}`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.API_KEY,
          "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
        },
      }
    );

    const data = await response.json();

    if (!data.response || data.response.length === 0) {
      throw new Error("sem jogos");
    }

    const games = data.response.map((g) => ({
      id: g.fixture.id,
      game: `${g.teams.home.name} x ${g.teams.away.name}`,
      minute: g.fixture.status.elapsed || 0,

      corners: Math.random() * 10,
      shots: Math.random() * 15,
      dangerous: Math.random() * 30,

      odds: 1.5 + Math.random() * 2,
    }));

    res.status(200).json(games.slice(0, 50));

  } catch (e) {
    console.log("ERRO REAL API:", e.message);

    res.status(500).json({
      error: "API não está funcionando",
    });
  }
}
