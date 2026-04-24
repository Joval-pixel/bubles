export default async function handler(req, res) {
  try {
    const headers = {
      "x-apisports-key": process.env.API_KEY,
    };

    // 🔥 BUSCA SIMPLES (SEM ESTATÍSTICA/ODDS PARA NÃO QUEBRAR)
    const response = await fetch(
      "https://v3.football.api-sports.io/fixtures?live=all",
      { headers }
    );

    const data = await response.json();

    if (!data.response || data.response.length === 0) {
      throw new Error("Sem jogos");
    }

    const games = data.response.map((g) => {
      return {
        id: g.fixture.id,
        game: `${g.teams.home.name} x ${g.teams.away.name}`,
        minute: g.fixture.status.elapsed || 0,

        // ⚠️ SIMULAÇÃO INTELIGENTE (porque plano free não libera stats completas)
        shots: Math.random() * 10,
        corners: Math.random() * 8,
        dangerous: Math.random() * 30,

        // ⚠️ odds simuladas (real só no plano pago)
        oddHome: 1.5 + Math.random() * 2,
      };
    });

    res.status(200).json(games);
  } catch (err) {
    console.log("ERRO API:", err.message);

    res.status(200).json(
      Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        game: `Fallback ${i}`,
        minute: Math.random() * 90,
        shots: Math.random() * 10,
        corners: Math.random() * 8,
        dangerous: Math.random() * 30,
        oddHome: 1.5 + Math.random() * 2,
      }))
    );
  }
}
