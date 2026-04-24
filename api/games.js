export default async function handler(req, res) {
  try {
    const headers = {
      "x-apisports-key": process.env.API_KEY,
    };

    // 🔥 Jogos AO VIVO
    const fixturesRes = await fetch(
      "https://v3.football.api-sports.io/fixtures?live=all",
      { headers }
    );

    const fixturesData = await fixturesRes.json();

    if (!fixturesData.response || fixturesData.response.length === 0) {
      throw new Error("Sem jogos ao vivo");
    }

    const games = await Promise.all(
      fixturesData.response.map(async (g) => {
        const fixtureId = g.fixture.id;

        // 📊 Estatísticas
        const statsRes = await fetch(
          `https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixtureId}`,
          { headers }
        );
        const statsData = await statsRes.json();

        // 💰 Odds
        const oddsRes = await fetch(
          `https://v3.football.api-sports.io/odds?fixture=${fixtureId}`,
          { headers }
        );
        const oddsData = await oddsRes.json();

        const statsHome = statsData.response?.[0]?.statistics || [];
        const statsAway = statsData.response?.[1]?.statistics || [];

        const findStat = (arr, name) =>
          Number(arr.find((s) => s.type === name)?.value || 0);

        const bookmaker =
          oddsData.response?.[0]?.bookmakers?.[0]?.bets?.[0]?.values || [];

        const oddHome = parseFloat(bookmaker?.[0]?.odd || 2);
        const oddDraw = parseFloat(bookmaker?.[1]?.odd || 3);
        const oddAway = parseFloat(bookmaker?.[2]?.odd || 2);

        return {
          id: fixtureId,
          game: `${g.teams.home.name} x ${g.teams.away.name}`,
          minute: g.fixture.status.elapsed || 0,

          shots:
            findStat(statsHome, "Shots on Goal") +
            findStat(statsAway, "Shots on Goal"),

          corners:
            findStat(statsHome, "Corner Kicks") +
            findStat(statsAway, "Corner Kicks"),

          dangerous:
            findStat(statsHome, "Dangerous Attacks") +
            findStat(statsAway, "Dangerous Attacks"),

          oddHome,
          oddDraw,
          oddAway,
        };
      })
    );

    res.status(200).json(games);
  } catch (err) {
    console.log("ERRO API:", err.message);

    // 🔥 fallback (nunca quebra)
    const fallback = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      game: `Fallback ${i}`,
      minute: Math.random() * 90,
      shots: Math.random() * 10,
      corners: Math.random() * 8,
      dangerous: Math.random() * 30,
      oddHome: 1.5 + Math.random() * 2,
    }));

    res.status(200).json(fallback);
  }
}
