export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://v3.football.api-sports.io/fixtures?live=all",
      {
        headers: {
          "x-apisports-key": process.env.API_KEY,
        },
      }
    );

    const data = await response.json();

    if (!data.response || data.response.length === 0) {
      throw new Error("Sem jogos ao vivo");
    }

    const games = data.response.map((g) => {
      return {
        id: g.fixture.id,

        game: `${g.teams.home.name} x ${g.teams.away.name}`,

        minute: g.fixture.status.elapsed || 0,

        // 📊 ESTATÍSTICAS REAIS (IMPORTANTÍSSIMO)
        shots:
          g.statistics?.[0]?.statistics?.find(
            (s) => s.type === "Shots on Goal"
          )?.value || 0,

        corners:
          g.statistics?.[0]?.statistics?.find(
            (s) => s.type === "Corner Kicks"
          )?.value || 0,

        dangerous:
          g.statistics?.[0]?.statistics?.find(
            (s) => s.type === "Dangerous Attacks"
          )?.value || 0,

        odds: 1.8 + Math.random(), // depois podemos pegar odds reais
      };
    });

    res.status(200).json(games);

  } catch (err) {
    console.log("ERRO API:", err.message);

    // 🔥 FALLBACK (NUNCA QUEBRA)
    const fallback = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      game: `Fallback ${i}`,
      minute: Math.random() * 90,
      shots: Math.random() * 10,
      corners: Math.random() * 8,
      dangerous: Math.random() * 30,
      odds: 1.5 + Math.random() * 2,
    }));

    res.status(200).json(fallback);
  }
}
