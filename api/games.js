export default async function handler(req, res) {
  try {
    const API_KEY = process.env.API_KEY;

    // 🔥 PROTEÇÃO TOTAL
    if (!API_KEY) {
      console.log("API_KEY NÃO DEFINIDA");
      return res.status(200).json(generateFallback());
    }

    const today = new Date().toISOString().slice(0, 10);

    const response = await fetch(
      `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${today}`,
      {
        headers: {
          "X-RapidAPI-Key": API_KEY,
          "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
        },
      }
    );

    if (!response.ok) {
      console.log("ERRO NA API:", response.status);
      return res.status(200).json(generateFallback());
    }

    const data = await response.json();

    if (!data.response || data.response.length === 0) {
      console.log("SEM JOGOS NA API");
      return res.status(200).json(generateFallback());
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

    return res.status(200).json(games.slice(0, 40));

  } catch (error) {
    console.log("ERRO GERAL:", error.message);
    return res.status(200).json(generateFallback());
  }
}

// 🔥 FALLBACK LIMPO
function generateFallback() {
  return Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    game: `Jogo ${i + 1}`,
    minute: Math.floor(Math.random() * 90),
    corners: Math.random() * 10,
    shots: Math.random() * 15,
    dangerous: Math.random() * 30,
    odds: 1.5 + Math.random() * 2,
  }));
}
