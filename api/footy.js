// api/footy.js
// API-Football (RapidAPI) → resposta enxuta p/ o front.
// Query params aceitos: ?date=YYYY-MM-DD  (default = hoje)

const RAPID_KEY = process.env.RAPIDAPI_KEY;
const HOST = "api-football-v1.p.rapidapi.com";
const BASE = `https://${HOST}/v3`;

export default async function handler(req, res) {
  try {
    const { date } = req.query || {};
    const iso = (date && /^\d{4}-\d{2}-\d{2}$/.test(date))
      ? date
      : new Date().toISOString().slice(0, 10);

    // Sem chave → modo DEMO
    if (!RAPID_KEY) {
      return res.status(200).json(demoPayload(iso, "Sem RAPIDAPI_KEY"));
    }

    // 1) Buscar jogos do dia
    const fixturesResp = await rapidFetch(`/fixtures?date=${iso}`);
    if (!fixturesResp?.response?.length) {
      // Sem jogos na API → demo
      return res.status(200).json(demoPayload(iso, "Sem fixtures na API"));
    }

    // Pegamos até 8 jogos para não estourar cota grátis
    const fixtures = fixturesResp.response.slice(0, 8);

    // 2) Para cada jogo, tentar pegar odds
    const enriched = await Promise.all(
      fixtures.map(async (fx) => {
        const f = {
          fixtureId: fx.fixture?.id,
          kickoff: fx.fixture?.date, // ISO
          league: joinNonEmpty([fx.league?.name, fx.league?.country]),
          home: fx.teams?.home?.name,
          away: fx.teams?.away?.name,
          label: `${fx.teams?.home?.name} vs ${fx.teams?.away?.name}`,
          odds: {
            "1x2": null,              // {home, draw, away, bookmaker, updated}
            "over_under_2_5": null,   // {over, under, bookmaker, updated}
          }
        };

        try {
          const oddsResp = await rapidFetch(`/odds?fixture=${f.fixtureId}`);
          const books = oddsResp?.response?.[0]?.bookmakers || [];
          if (books.length) {
            // preferir Bet365
            const bet365 = books.find(b => /bet\s*365/i.test(b.name)) || books[0];

            // mercados disponíveis nessa casa
            const markets = bet365?.bets || [];

            // 1x2 (Match Winner / 1X2)
            const mw = markets.find(m =>
              /match\s*winn|1x2|winner/i.test(m.name || "")
            );
            if (mw?.values?.length >= 3) {
              const home = findOdd(mw.values, /home|1/i)?.odd;
              const draw = findOdd(mw.values, /draw|x/i)?.odd;
              const away = findOdd(mw.values, /away|2/i)?.odd;
              f.odds["1x2"] = safeNumObj({ home, draw, away, bookmaker: bet365.name, updated: bet365?.update });
            }

            // Over/Under 2.5
            // Alguns provedores têm "Over/Under", outros "Goals Over/Under"
            const ou = markets.find(m => /over\/?under|goals/i.test(m.name || ""));
            if (ou?.values?.length) {
              // procurar especificamente a linha 2.5
              const over = findOdd(ou.values, /over\s*2\.?5/i)?.odd
                        || findOdd(ou.values, /^over$/i)?.odd;
              const under = findOdd(ou.values, /under\s*2\.?5/i)?.odd
                         || findOdd(ou.values, /^under$/i)?.odd;
              if (over || under) {
                f.odds["over_under_2_5"] = safeNumObj({ over, under, bookmaker: bet365.name, updated: bet365?.update });
              }
            }
          }
        } catch (e) {
          // Em caso de erro nas odds, seguimos só com dados do jogo
        }

        return f;
      })
    );

    return res.status(200).json({
      source: "api",
      provider: "api-football-v1 (RapidAPI)",
      date: iso,
      matches: enriched
    });

  } catch (err) {
    return res.status(200).json(demoPayload(
      new Date().toISOString().slice(0,10),
      "Erro: " + String(err?.message || err)
    ));
  }
}

/* ----------------- helpers ----------------- */

async function rapidFetch(path) {
  const url = `${BASE}${path}`;
  const r = await fetch(url, {
    headers: {
      "x-rapidapi-key": RAPID_KEY,
      "x-rapidapi-host": HOST
    },
    // timeout “manual”
    next: { revalidate: 0 } // evitar cache agressivo
  });
  if (!r.ok) throw new Error(`RapidAPI HTTP ${r.status}`);
  return r.json();
}

function findOdd(arr, regex) {
  return (arr || []).find(v => regex.test(String(v.value || v.label || "")));
}

function safeNumObj(obj) {
  // Converte strings para númeroFloat quando possível
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v == null) { out[k] = null; continue; }
    const n = Number(String(v).replace(",", "."));
    out[k] = Number.isFinite(n) ? n : v;
  }
  return out;
}

function joinNonEmpty(parts) {
  return (parts || []).filter(Boolean).join(" — ");
}

function demoPayload(date, reason) {
  return {
    source: "demo",
    note: reason,
    date,
    matches: [
      {
        fixtureId: 1,
        kickoff: `${date}T18:00:00Z`,
        league: "Brasil — Série A",
        home: "Flamengo",
        away: "Palmeiras",
        label: "Flamengo vs Palmeiras",
        odds: {
          "1x2": { home: 2.05, draw: 3.10, away: 3.60, bookmaker: "DEMO", updated: null },
          "over_under_2_5": { over: 2.02, under: 1.84, bookmaker: "DEMO", updated: null }
        }
      },
      {
        fixtureId: 2,
        kickoff: `${date}T20:00:00Z`,
        league: "Brasil — Série A",
        home: "Santos",
        away: "Corinthians",
        label: "Santos vs Corinthians",
        odds: {
          "1x2": { home: 2.60, draw: 3.10, away: 2.70, bookmaker: "DEMO", updated: null },
          "over_under_2_5": { over: 2.35, under: 1.65, bookmaker: "DEMO", updated: null }
        }
      },
      {
        fixtureId: 3,
        kickoff: `${date}T22:00:00Z`,
        league: "Brasil — Série A",
        home: "São Paulo",
        away: "Vasco",
        label: "São Paulo vs Vasco",
        odds: {
          "1x2": { home: 2.17, draw: 3.25, away: 3.05, bookmaker: "DEMO", updated: null },
          "over_under_2_5": { over: 2.15, under: 1.75, bookmaker: "DEMO", updated: null }
        }
      }
    ]
  };
}