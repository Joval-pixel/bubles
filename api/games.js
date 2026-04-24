export default async function handler(req, res) {
  try {
    const API_KEY = process.env.ODDS_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "API KEY não configurada" });
    }

    const url = `https://api.the-odds-api.com/v4/sports/soccer/odds?regions=eu&markets=h2h&oddsFormat=decimal&apiKey=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data)) {
      return res.status(200).json([]);
    }

    const games = data.slice(0, 20).map((game, i) => {
      let bestOdd = null;

      game.bookmakers?.forEach(b => {
        b.markets?.forEach(m => {
          m.outcomes?.forEach(o => {
            if (!bestOdd || o.price > bestOdd) {
              bestOdd = o.price;
            }
          });
        });
      });

      return {
        id: i,
        game: `${game.home_team} x ${game.away_team}`,
        bestOdd: bestOdd || 0
      };
    });

    res.status(200).json(games);

  } catch (err) {
    console.error(err);
    res.status(200).json([]);
  }
}
