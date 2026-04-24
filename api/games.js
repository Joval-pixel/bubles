export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all",
      {
        headers: {
          "X-RapidAPI-Key": process.env.API_KEY,
          "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
        },
      }
    );

    const data = await response.json();

    const games = data.response.map((g) => ({
      id: g.fixture.id,
      game: `${g.teams.home.name} vs ${g.teams.away.name}`,
      minute: g.fixture.status.elapsed || 0,
      odds: Math.random() * 3 + 1.2,
      corners: 0,
    }));

    res.status(200).json(games);
  } catch (err) {
    res.status(500).json({ error: "Erro API" });
  }
}
