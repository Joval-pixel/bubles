export default async function handler(req, res) {
  try {
    const API_KEY = process.env.API_KEY;

    const response = await fetch(
      "https://v3.football.api-sports.io/fixtures?live=all",
      {
        headers: {
          "x-apisports-key": API_KEY,
        },
      }
    );

    const data = await response.json();

    const games =
      data.response?.map((g) => ({
        id: g.fixture.id,
        game: `${g.teams.home.name} x ${g.teams.away.name}`,
        minute: g.fixture.status.elapsed || 0,
      })) || [];

    res.status(200).json(games);
  } catch (err) {
    console.log("erro api:", err.message);
    res.status(200).json([]);
  }
}
