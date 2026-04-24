export default async function handler(req, res) {
  try {
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
      return res.status(200).json(fallback());
    }

    const today = new Date().toISOString().slice(0, 10);

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${today}`,
      {
        headers: {
          "x-apisports-key": API_KEY,
        },
      }
    );

    if (!response.ok) {
      return res.status(200).json(fallback());
    }

    const data = await response.json();

    if (!data.response || data.response.length === 0) {
      return res.status(200).json(fallback());
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

  } catch (err) {
    console.log("erro:", err.message);
    res.status(200).json(fallback());
  }
}

function fallback() {
  return Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    game: `Jogo ${i + 1}`,
    minute: Math.random() * 90,
    corners: Math.random() * 10,
    shots: Math.random() * 15,
    dangerous: Math.random() * 30,
    odds: 1.5 + Math.random() * 2,
  }));
}
