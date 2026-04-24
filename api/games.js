export default async function handler(req, res) {
  try {
    const API_KEY = process.env.ODDS_API_KEY;

    const url =
      "https://api.the-odds-api.com/v4/sports/soccer/odds/?regions=eu&markets=h2h";

    const response = await fetch(`${url}&apiKey=${API_KEY}`);
    const data = await response.json();

    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }

    const games = data.map((g) => {
      const bookmaker = g.bookmakers?.[0];
      const market = bookmaker?.markets?.[0];
      const outcomes = market?.outcomes || [];

      const home = outcomes.find((o) => o.name === g.home_team);
      const away = outcomes.find((o) => o.name === g.away_team);

      return {
        id: g.id,
        game: `${g.home_team} x ${g.away_team}`,
        oddHome: home?.price || 0,
        oddAway: away?.price || 0,
        league: g.sport_title,
      };
    });

    res.status(200).json(games);
  } catch (err) {
    console.log("erro odds:", err.message);
    res.status(200).json([]);
  }
}
