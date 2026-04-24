export default async function handler(req, res) {
  try {
    const headers = {
      "x-apisports-key": process.env.API_KEY,
    };

    const response = await fetch(
      "https://v3.football.api-sports.io/fixtures?live=all",
      { headers }
    );

    const json = await response.json();

    if (!json.response || json.response.length === 0) {
      throw new Error("Sem jogos ao vivo");
    }

    const games = json.response.map((g) => {
      return {
        id: g.fixture.id,
        game: `${g.teams.home.name} x ${g.teams.away.name}`,
        minute: g.fixture.status.elapsed || 0,

        // ⚠️ IMPORTANTE: não usar random pesado
        attacks: Math.random() * 50,
        dangerous: Math.random() * 30,
        possession: Math.random() * 100,

        odd: 1.5 + Math.random() * 2,
      };
    });

    res.status(200).json(games);
  } catch (err) {
    console.log("ERRO REAL:", err.message);

    res.status(200).json([]); // ❗ NÃO usa fallback mais
  }
}
