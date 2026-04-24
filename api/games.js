export default async function handler(req, res) {
  try {
    const headers = {
      "X-RapidAPI-Key": process.env.API_KEY,
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    };

    const live = await fetch(
      "https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all",
      { headers }
    );

    const data = await live.json();

    const games = data.response.map((g) => {
      const stats = g.statistics || [];

      const getStat = (type) => {
        const found = stats.find((s) => s.type === type);
        return found ? Number(found.value) || 0 : 0;
      };

      const corners = getStat("Corner Kicks");
      const shots = getStat("Total Shots");
      const dangerous = getStat("Dangerous Attacks");

      return {
        id: g.fixture.id,
        game: `${g.teams.home.name} vs ${g.teams.away.name}`,
        minute: g.fixture.status.elapsed || 0,
        corners,
        shots,
        dangerous,
        odds: 1.5 + Math.random() * 2, // depois podemos trocar por odds reais
      };
    });

    res.status(200).json(games);

  } catch {
    res.status(200).json([]);
  }
}
