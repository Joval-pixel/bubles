export default async function handler(req, res) {
  try {
    const headers = {
      "X-RapidAPI-Key": process.env.API_KEY,
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    };

    // 🔥 DATA DE HOJE
    const today = new Date().toISOString().slice(0, 10);

    // 🔥 TODOS OS JOGOS DO DIA (não só ao vivo)
    const response = await fetch(
      `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${today}`,
      { headers }
    );

    const data = await response.json();

    // ⚠️ proteção
    if (!data.response || data.response.length === 0) {
      throw new Error("Sem jogos");
    }

    const games = data.response.map((g) => {
      return {
        id: g.fixture.id,
        game: `${g.teams.home.name} vs ${g.teams.away.name}`,
        minute: g.fixture.status.elapsed || 0,

        // 🔥 SIMULAÇÃO (evita erro da API gratuita)
        corners: Math.floor(Math.random() * 10),
        shots: Math.floor(Math.random() * 15),
        dangerous: Math.floor(Math.random() * 25),

        // ⚠️ odds simulada (por enquanto)
        odds: 1.5 + Math.random() * 2,
      };
    });

    // 🔥 LIMITA (evita travar o site)
    res.status(200).json(games.slice(0, 80));

  } catch (e) {
    console.log("Erro API, usando fallback");

    // 🔥 fallback com vários jogos
    res.status(200).json(
      Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        game: `Jogo ${i + 1}`,
        minute: Math.floor(Math.random() * 90),
        corners: Math.floor(Math.random() * 10),
        shots: Math.floor(Math.random() * 15),
        dangerous: Math.floor(Math.random() * 25),
        odds: 1.5 + Math.random() * 2,
      }))
    );
  }
}
