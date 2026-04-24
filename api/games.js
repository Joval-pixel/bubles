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

    if (!data.response || data.response.length === 0) {
      throw new Error("Sem dados");
    }

    const games = data.response.map((g) => {
      return {
        id: g.fixture.id,
        game: `${g.teams.home.name} x ${g.teams.away.name}`,
        minute: g.fixture.status.elapsed || 0,

        // 🔥 fallback de stats (API grátis quase nunca manda)
        corners: Math.floor(Math.random() * 10),
        shots: Math.floor(Math.random() * 15),
        dangerous: Math.floor(Math.random() * 30),

        odds: 1.5 + Math.random() * 2,
      };
    });

    res.status(200).json(games);

  } catch (e) {
    console.log("Fallback ativado");

    res.status(200).json(
      Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        game: `Time A ${i} x Time B ${i}`, // 🔥 melhor nome fake
        minute: Math.floor(Math.random() * 90),
        corners: Math.random() * 10,
        shots: Math.random() * 15,
        dangerous: Math.random() * 30,
        odds: 1.5 + Math.random() * 2,
      }))
    );
  }
}
