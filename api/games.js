export default async function handler(req, res) {
  try {
    const API_KEY = process.env.API_KEY;

    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer/odds/?regions=eu&markets=h2h&apiKey=${API_KEY}`
    );

    const data = await response.json();

    const games = data.slice(0, 40).map((g, i) => {
      const home = g.home_team;
      const away = g.away_team;

      let oddHome = 2;
      let oddAway = 2;

      if (g.bookmakers && g.bookmakers[0]) {
        const outcomes = g.bookmakers[0].markets[0].outcomes;

        outcomes.forEach((o) => {
          if (o.name === home) oddHome = o.price;
          if (o.name === away) oddAway = o.price;
        });
      }

      return {
        id: i,
        game: `${home} x ${away}`,
        oddHome,
        oddAway,
        bestOdd: Math.min(oddHome, oddAway),
      };
    });

    res.status(200).json(games);
  } catch (e) {
    console.log("ERRO API", e);

    // fallback pra não quebrar
    res.status(200).json(
      Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        game: "Fallback",
        oddHome: 2,
        oddAway: 2,
        bestOdd: 2,
      }))
    );
  }
}
