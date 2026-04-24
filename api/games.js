export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?regions=eu&markets=h2h&apiKey=" +
        process.env.API_KEY
    );

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("API ruim");
    }

    const games = data.slice(0, 20).map((g, i) => {
      const home = g.home_team;
      const away = g.away_team;

      let bestOdd = 2;

      if (g.bookmakers?.[0]?.markets?.[0]?.outcomes) {
        const odds = g.bookmakers[0].markets[0].outcomes.map(
          (o) => o.price
        );
        bestOdd = Math.min(...odds);
      }

      return {
        id: i,
        game: `${home} x ${away}`,
        bestOdd,
      };
    });

    res.status(200).json(games);
  } catch (err) {
    console.log("ERRO REAL:", err);

    res.status(200).json([]); // ❗ NÃO usa fallback fake
  }
}
