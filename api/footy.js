// api/footy.js
export default async function handler(req, res) {
  try {
    // Se tiver RAPIDAPI_KEY no Vercel, você pode chamar a API real.
    // Caso contrário, respondemos com DEMO.
    const useDemo = !process.env.RAPIDAPI_KEY;

    if (useDemo) {
      return res.status(200).json({
        source: "demo",
        matches: [
          { label: "Flamengo vs Palmeiras", market: "over_under", odds: { over: 2.05, under: 1.80 } },
          { label: "Manchester City vs Liverpool", market: "1x2", odds: { home: 1.95, draw: 3.50, away: 3.20 } }
        ]
      });
    }

    // ===== exemplo de chamada real (ajuste endpoint/params segundo sua API) =====
    const url = "https://api-football-v1.p.rapidapi.com/v3/fixtures?date=" +
                new Date().toISOString().slice(0,10);

    const r = await fetch(url, {
      headers: {
        "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY
      }
    });

    if (!r.ok) {
      // fallback demo se API falhar
      return res.status(200).json({
        source: "fallback-demo",
        error: `API respondeu ${r.status}`,
        matches: [
          { label: "Santos vs Corinthians", market: "over_under", odds: { over: 1.95, under: 1.95 } }
        ]
      });
    }

    const data = await r.json();
    // → aqui você transforma "data" no formato que seu front usa
    return res.status(200).json({ source: "api", raw: data });
  } catch (e) {
    return res.status(200).json({
      source: "error-demo",
      error: String(e),
      matches: [
        { label: "São Paulo vs Vasco", market: "1x2", odds: { home: 2.20, draw: 3.10, away: 3.40 } }
      ]
    });
  }
}
