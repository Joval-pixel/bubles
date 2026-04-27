export default async function handler(req, res) {
  try {
    const API_KEY = process.env.ODDS_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "API KEY não configurada" });
    }

    const url = `https://api.the-odds-api.com/v4/sports/soccer/odds/?regions=eu&markets=h2h&oddsFormat=decimal&apiKey=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(500).json({ error: "Erro na API externa" });
    }

    const data = await response.json();

    const games = data.map((game, i) => {
      const home = game.home_team;
      const away = game.away_team;

      let odds = [];

      game.bookmakers?.forEach(b => {
        b.markets?.forEach(m => {
          m.outcomes?.forEach(o => {
            if (o.name === home) odds.push(o.price);
          });
        });
      });

      if (odds.length < 2) return null;

      const best = Math.max(...odds);
      const avg = odds.reduce((a, b) => a + b, 0) / odds.length;

      const ev = (best / avg) - 1;

      return {
        id: i,
        game: `${home} x ${away}`,
        odd: best,
        ev: Number(ev.toFixed(3))
      };
    }).filter(Boolean);

    res.status(200).json(games);

  } catch (err) {
    res.status(500).json({ error: "Erro interno" });
  }
}
