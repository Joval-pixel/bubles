export default async function handler(req, res) {
  try {
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "API KEY não configurada" });
    }

    const url = `https://api.the-odds-api.com/v4/sports/soccer/odds/?regions=eu&markets=h2h&apiKey=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data)) {
      return res.status(500).json({ error: "Resposta inválida da API" });
    }

    const games = data.slice(0, 30).map((game, i) => {
      const home = game.home_team;
      const away = game.away_team;

      let odds = [];

      if (game.bookmakers?.length) {
        game.bookmakers.forEach((b) => {
          b.markets.forEach((m) => {
            m.outcomes.forEach((o) => {
              odds.push(o.price);
            });
          });
        });
      }

      const bestOdd = odds.length ? Math.min(...odds) : 0;

      return {
        id: i,
        game: `${home} x ${away}`,
        odds,
        bestOdd,
      };
    });

    res.status(200).json(games);
  } catch (error) {
    console.log("ERRO API:", error);

    res.status(200).json([]); // ❗ sem fallback fake
  }
}
