export default async function handler(req, res) {
  try {
    const API_KEY = process.env.ODDS_API_KEY;

    if (!API_KEY) {
      return res.status(200).json([
        { id: 1, game: "API KEY NÃO CONFIGURADA", oddHome: 0, ev: 0 }
      ]);
    }

    const url = `https://api.the-odds-api.com/v4/sports/soccer/odds/?regions=eu&markets=h2h&oddsFormat=decimal&apiKey=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(200).json([
        { id: 1, game: "ERRO NA API EXTERNA", oddHome: 0, ev: 0 }
      ]);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return res.status(200).json([]);
    }

    const games = data.map((game, i) => {
      const home = game.home_team;
      const away = game.away_team;

      let bestHome = null;

      game.bookmakers?.forEach((b) => {
        b.markets?.forEach((m) => {
          m.outcomes?.forEach((o) => {
            if (o.name === home) {
              if (!bestHome || o.price > bestHome) bestHome = o.price;
            }
          });
        });
      });

      if (!bestHome) return null;

      return {
        id: i,
        game: `${home} x ${away}`,
        oddHome: bestHome,
        ev: Number((bestHome * 0.5 - 1).toFixed(3)), // simplificado só pra não quebrar
      };
    }).filter(Boolean);

    return res.status(200).json(games);

  } catch (err) {
    console.error("ERRO:", err);

    return res.status(200).json([
      { id: 1, game: "ERRO INTERNO NA API", oddHome: 0, ev: 0 }
    ]);
  }
}
