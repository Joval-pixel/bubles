export default async function handler(req, res) {
  try {
    const API_KEY = process.env.ODDS_API_KEY;

    // 1️⃣ buscar esportes disponíveis
    const sportsRes = await fetch(
      `https://api.the-odds-api.com/v4/sports/?apiKey=${API_KEY}`
    );

    const sports = await sportsRes.json();

    // pega só futebol
    const soccerSports = sports.filter((s) =>
      s.key.includes("soccer")
    );

    let allGames = [];

    // 2️⃣ buscar odds de várias ligas
    for (const sport of soccerSports.slice(0, 5)) {
      const url = `https://api.the-odds-api.com/v4/sports/${sport.key}/odds/?regions=eu&markets=h2h&oddsFormat=decimal&apiKey=${API_KEY}`;

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

        const fair = probHome / total;
        const ev = bestHome * fair - 1;

        return {
          id: `${sport.key}-${i}`,
          game: `${home} x ${away}`,
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
