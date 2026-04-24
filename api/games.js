export default async function handler(req, res) {
  try {
    const API_KEY = process.env.ODDS_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "API KEY não configurada" });
    }

    const leagues = [
      "soccer_epl",
      "soccer_spain_la_liga",
      "soccer_italy_serie_a",
      "soccer_brazil_campeonato"
    ];

    let allGames = [];

    for (const league of leagues) {
      const url = `https://api.the-odds-api.com/v4/sports/${league}/odds/?regions=eu&markets=h2h&oddsFormat=decimal&apiKey=${API_KEY}`;

      const response = await fetch(url);
      if (!response.ok) continue;

      const data = await response.json();

      if (!Array.isArray(data)) continue;

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

        const probHome = 1 / bestHome;
        const probAway = 1 / bestAway;

        const total = probHome + probAway;

        const fairHome = probHome / total;

        const ev = bestHome * fairHome - 1;

        return {
          id: `${league}-${i}`,
          game: `${home} x ${away}`,
          oddHome: bestHome,
          oddAway: bestAway,
          ev: Number(ev.toFixed(3)),
        };
      }).filter(Boolean);

      allGames = [...allGames, ...games];
    }

    res.status(200).json(allGames);
  } catch (err) {
    console.log(err);
    res.status(200).json([]);
  }
}
