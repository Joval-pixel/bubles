export default async function handler(req, res) {
  try {
    const headers = {
      "X-RapidAPI-Key": process.env.API_KEY,
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    };

    const response = await fetch(
      "https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all",
      { headers }
    );

    const data = await response.json();

    if (!data.response) throw new Error("API falhou");

    const games = data.response.map((g) => {
      const stats = g.statistics || [];

      const getStat = (type) => {
        const found = stats.find((s) => s.type === type);
        return found ? Number(found.value) || 0 : 0;
      };

      return {
        id: g.fixture.id,
        game: `${g.teams.home.name} vs ${g.teams.away.name}`,
        minute: g.fixture.status.elapsed || 0,
        corners: getStat("Corner Kicks"),
        shots: getStat("Total Shots"),
        dangerous: getStat("Dangerous Attacks"),
        odds: 1.5 + Math.random() * 2, // depois pode trocar por odds reais
      };
    });

    res.status(200).json(games.slice(0, 50));

  } catch (err) {
    console.log("Fallback ativado");

    res.status(200).json(
      Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        game: `Jogo ${i + 1}`,
        minute: Math.floor(Math.random() * 90),
        corners: Math.random() * 10,
        shots: Math.random() * 15,
        dangerous: Math.random() * 30,
        odds: 1.5 + Math.random() * 2,
      }))
    );
  }
}
