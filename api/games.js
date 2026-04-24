export default async function handler(req, res) {
  try {
    const API_KEY = process.env.ODDS_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "API KEY não configurada" });
    }

    const url = `https://api.the-odds-api.com/v4/sports/soccer/odds/?regions=eu&markets=h2h&oddsFormat=decimal&apiKey=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data)) {
      return res.status(200).json([]);
    }

    const games = data.map((game, i) => {
      const home = game.home_team;
      const away = game.away_team;

      let bestHome = null;
      let bestAway = null;

      game.bookmakers?.forEach((b) => {
        b.markets?.forEach((m) => {
          m.outcomes?.forEach((o) => {
            if (o.name === home) {
              if (!bestHome || o.price > bestHome) bestHome = o.price;
            }
            if (o.name === away) {
              if (!bestAway || o.price > bestAway) bestAway = o.price;
            }
          });
        });
      });

      if (!bestHome || !bestAway) return null;

      // 🔥 PROBABILIDADE IMPLÍCITA
      const probHome = 1 / bestHome;
      const probAway = 1 / bestAway;

      // 🔥 NORMALIZA (remove margem)
      const totalProb = probHome + probAway;
      const fairHome = probHome / totalProb;

      // 🔥 EV REAL
      const ev = bestHome * fairHome - 1;

      return {
        id: i,
        game: `${home} x ${away}`,
        oddHome: bestHome,
        oddAway: bestAway,
        ev: Number(ev.toFixed(3)),
      };
    }).filter(Boolean);

    res.status(200).json(games);
  } catch (err) {
    console.log(err);
    res.status(200).json([]);
  }
}
