export default async function handler(req, res) {
  try {
    const API_KEY = process.env.ODDS_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "API KEY não encontrada" });
    }

    const url = `https://api.the-odds-api.com/v4/sports/soccer/odds/?regions=eu&markets=h2h&oddsFormat=decimal&apiKey=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(500).json({ error: "Erro ao buscar API" });
    }

    const data = await response.json();

    // 👉 se não tiver jogos, retorna vazio (SEM fallback lixo)
    if (!data || !data.length) {
      return res.status(200).json([]);
    }

    const games = data.map((game, i) => {
      const home = game.home_team;
      const away = game.away_team;

      let bestHome = null;
      let bestAway = null;

      game.bookmakers?.forEach((book) => {
        book.markets?.forEach((market) => {
          market.outcomes?.forEach((o) => {
            if (o.name === home) {
              if (!bestHome || o.price > bestHome) bestHome = o.price;
            }
            if (o.name === away) {
              if (!bestAway || o.price > bestAway) bestAway = o.price;
            }
          });
        });
      });

      // 👉 calcula EV real simples
      const probHome = bestHome ? 1 / bestHome : 0;
      const probAway = bestAway ? 1 / bestAway : 0;

      const ev = bestHome ? (bestHome * probHome - 1) : 0;

      return {
        id: i,
        game: `${home} x ${away}`,
        oddHome: bestHome,
        oddAway: bestAway,
        ev: Number(ev.toFixed(3)),
      };
    });

    res.status(200).json(games);
  } catch (error) {
    console.log("ERRO:", error);

    // 👉 nunca mais fallback fake
    res.status(200).json([]);
  }
}
