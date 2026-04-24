export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all",
      {
        headers: {
          "X-RapidAPI-Key": process.env.API_KEY,
          "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
        },
      }
    );

    const json = await response.json();

    const games = json.response.slice(0, 30).map((g, i) => ({
      id: i,
      game: `${g.teams.home.name} x ${g.teams.away.name}`,
      bestOdd: 1.5 + Math.random() * 2 // simula odds se não tiver
    }));

    res.status(200).json(games);
  } catch (e) {
    res.status(200).json([]);
  }
}
