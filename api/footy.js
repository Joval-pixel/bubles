// api/footy.js - Minimal serverless proxy with demo fallback
export default async function handler(req, res) {
  try {
    // Optional: pass ?date=YYYY-MM-DD and ?market=over_under|1x2
    const { date, market } = req.query || {};
    const useDemo = !process.env.RAPIDAPI_KEY;

    if (useDemo) {
      return res.status(200).json({
        source: "demo",
        date: date || new Date().toISOString().slice(0,10),
        market: market || "over_under",
        matches: [
          {
            label: "Flamengo vs Palmeiras",
            market: "over_under",
            odds: { over: 2.05, under: 1.80 },
            bookmakerCount: 8, volume: 320, marketLiquidity: 180
          },
          {
            label: "Manchester City vs Liverpool",
            market: "1x2",
            odds: { home: 1.95, draw: 3.50, away: 3.20 },
            bookmakerCount: 12, volume: 650, marketLiquidity: 420
          },
          {
            label: "Real Madrid vs Barcelona",
            market: "1x2",
            odds: { home: 2.10, draw: 3.40, away: 2.90 },
            bookmakerCount: 10, volume: 540, marketLiquidity: 360
          }
        ]
      });
    }

    // Example real call (adjust endpoint/params to your provider if desired)
    const iso = date || new Date().toISOString().slice(0,10);
    const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${iso}`;

    const r = await fetch(url, {
      headers: {
        "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY
      }
    });

    if (!r.ok) {
      return res.status(200).json({
        source: "fallback-demo",
        error: `API responded ${r.status}`,
        matches: [
          {
            label: "Santos vs Corinthians",
            market: "over_under",
            odds: { over: 1.95, under: 1.95 },
            bookmakerCount: 6, volume: 250, marketLiquidity: 150
          }
        ]
      });
    }

    const apiData = await r.json();
    // NOTE: transform apiData into the shape expected by your frontend if needed.
    return res.status(200).json({ source: "api", raw: apiData });
  } catch (e) {
    return res.status(200).json({
      source: "error-demo",
      error: String(e),
      matches: [
        {
          label: "São Paulo vs Vasco",
          market: "1x2",
          odds: { home: 2.20, draw: 3.10, away: 3.40 },
          bookmakerCount: 5, volume: 210, marketLiquidity: 140
        }
      ]
    });
  }
}
