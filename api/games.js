export default async function handler(req, res) {
  try {
    const API_KEY = process.env.ODDS_API_KEY;

    if (!API_KEY) {
      return res.status(200).json([]);
    }

    const url = `https://api.the-odds-api.com/v4/sports/soccer/odds/?regions=eu&markets=h2h&oddsFormat=decimal&apiKey=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(200).json([]);
    }

    const data = await response.json();

    const games = data.map((game, i) => {
      const home = game.home_team;

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
        game: `${game.home_team} x ${game.away_team}`,
        oddHome: bestHome,
        ev: Number((bestHome * 0.5 - 1).toFixed(3)),
      };
    }).filter(Boolean);

    return res.status(200).json(games);

  } catch (err) {
    return res.status(200).json([]);
  }
}
