const API_BASE = "https://api.the-odds-api.com/v4";
const API_KEY =
  process.env.ODDS_API_KEY ||
  process.env.API_KEY ||
  "";

const DEFAULT_SPORTS = "soccer_brazil_campeonato";
const SPORT_KEYS = String(
  process.env.ODDS_API_SPORTS ||
    process.env.ODDS_API_SPORT ||
    DEFAULT_SPORTS
)
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const REGIONS = String(process.env.ODDS_API_REGIONS || "eu")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean)
  .join(",");

const BOOKMAKERS = String(process.env.ODDS_API_BOOKMAKERS || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean)
  .join(",");

const normalizeText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const toNumber = (value) => {
  if (value === null || value === undefined || value === "" || value === "null") {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = parseFloat(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

const average = (values) => {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const estimateMinute = (commenceTime) => {
  const kickoff = new Date(commenceTime).getTime();

  if (!Number.isFinite(kickoff)) {
    return 0;
  }

  const elapsedMinutes = Math.round((Date.now() - kickoff) / 60000);
  return clamp(elapsedMinutes, 1, 120);
};

const makeEmptyPayload = (reason = "Sem jogos ao vivo", debug = "") => ({
  games: [],
  updatedAt: new Date().toISOString(),
  message: reason,
  debug,
});

const makeJsonResponse = (payload, status = 200) =>
  Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "s-maxage=120, stale-while-revalidate=180",
    },
  });

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch (_error) {
    return [];
  }
};

const fetchFromOddsApi = async (path, params = {}) => {
  const searchParams = new URLSearchParams({
    ...params,
    apiKey: API_KEY,
  });

  const response = await fetch(`${API_BASE}${path}?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error(`ODDS_API_${response.status}`);
  }

  return await safeJson(response);
};

const isLiveScoreEvent = (event) =>
  !event?.completed && Array.isArray(event?.scores) && event.scores.length > 0;

const findScore = (scores, teamName) => {
  const normalizedTeam = normalizeText(teamName);

  for (const item of scores ?? []) {
    if (normalizeText(item?.name) === normalizedTeam) {
      return toNumber(item?.score);
    }
  }

  return 0;
};

const findH2hMarket = (bookmaker) =>
  bookmaker?.markets?.find((market) => normalizeText(market?.key) === "h2h") ?? null;

const getHomeOutcome = (outcomes, homeTeam) => {
  const normalizedHome = normalizeText(homeTeam);

  return (
    outcomes?.find((outcome) => normalizeText(outcome?.name) === normalizedHome) ?? null
  );
};

const getNormalizedHomeProbability = (outcomes, homeTeam) => {
  const pricedOutcomes = (outcomes ?? [])
    .map((outcome) => ({
      name: outcome?.name ?? "",
      price: toNumber(outcome?.price),
    }))
    .filter((outcome) => outcome.price > 1);

  if (!pricedOutcomes.length) {
    return 0;
  }

  const implied = pricedOutcomes.map((outcome) => ({
    ...outcome,
    probability: 1 / outcome.price,
  }));

  const total = implied.reduce((sum, outcome) => sum + outcome.probability, 0);

  if (!(total > 0)) {
    return 0;
  }

  const homeEntry = implied.find(
    (outcome) => normalizeText(outcome.name) === normalizeText(homeTeam)
  );

  if (!homeEntry) {
    return 0;
  }

  return homeEntry.probability / total;
};

const buildGameFromOdds = (oddsEvent, liveScoreEvent) => {
  if (!oddsEvent || !liveScoreEvent) {
    return null;
  }

  const homeTeam = oddsEvent.home_team ?? liveScoreEvent.home_team ?? "";
  const awayTeam = oddsEvent.away_team ?? liveScoreEvent.away_team ?? "";
  const bookmakers = Array.isArray(oddsEvent.bookmakers) ? oddsEvent.bookmakers : [];

  const bookmakerEntries = bookmakers
    .map((bookmaker) => {
      const h2hMarket = findH2hMarket(bookmaker);
      const outcomes = h2hMarket?.outcomes ?? [];
      const homeOutcome = getHomeOutcome(outcomes, homeTeam);
      const homePrice = toNumber(homeOutcome?.price);
      const homeProbability = getNormalizedHomeProbability(outcomes, homeTeam);

      if (!(homePrice > 1) || !(homeProbability > 0)) {
        return null;
      }

      return {
        bookmaker: bookmaker?.title ?? bookmaker?.key ?? "bookmaker",
        homePrice,
        homeProbability,
        lastUpdate: bookmaker?.last_update ?? h2hMarket?.last_update ?? null,
      };
    })
    .filter(Boolean);

  if (!bookmakerEntries.length) {
    return null;
  }

  const bestEntry = bookmakerEntries.reduce((best, current) =>
    current.homePrice > best.homePrice ? current : best
  );

  const consensusProbability = average(
    bookmakerEntries.map((entry) => entry.homeProbability)
  );

  if (!(consensusProbability > 0)) {
    return null;
  }

  const ev = consensusProbability * bestEntry.homePrice - 1;

  const homeScore = findScore(liveScoreEvent.scores, homeTeam);
  const awayScore = findScore(liveScoreEvent.scores, awayTeam);
  const minute = estimateMinute(liveScoreEvent.commence_time || oddsEvent.commence_time);
  const fairOdd = consensusProbability > 0 ? 1 / consensusProbability : 0;

  return {
    id: oddsEvent.id,
    game: `${homeTeam} x ${awayTeam}`,
    league: oddsEvent.sport_title ?? liveScoreEvent.sport_title ?? "Soccer",
    minute,
    minuteLabel: "estimado",
    ev,
    oddHome: bestEntry.homePrice,
    probability: consensusProbability,
    fairOdd,
    marketEdge: bestEntry.homePrice - fairOdd,
    bestBookmaker: bestEntry.bookmaker,
    isPositiveEv: ev > 0,
    scoreLine: `${homeScore} x ${awayScore}`,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    updatedAt: liveScoreEvent.last_update || bestEntry.lastUpdate || null,
    commenceTime: liveScoreEvent.commence_time || oddsEvent.commence_time || null,
    source: "The Odds API",
  };
};

const fetchLiveGamesForSport = async (sportKey) => {
  const liveScores = await fetchFromOddsApi(`/sports/${sportKey}/scores`, {
    dateFormat: "iso",
  });

  const liveEvents = Array.isArray(liveScores) ? liveScores.filter(isLiveScoreEvent) : [];

  if (!liveEvents.length) {
    return {
      sportKey,
      liveEventCount: 0,
      oddsEventCount: 0,
      games: [],
    };
  }

  const eventIds = liveEvents.map((event) => event.id).filter(Boolean);

  if (!eventIds.length) {
    return {
      sportKey,
      liveEventCount: liveEvents.length,
      oddsEventCount: 0,
      games: [],
    };
  }

  const oddsParams = {
    regions: REGIONS || "eu",
    markets: "h2h",
    oddsFormat: "decimal",
    dateFormat: "iso",
    eventIds: eventIds.join(","),
  };

  if (BOOKMAKERS) {
    oddsParams.bookmakers = BOOKMAKERS;
    delete oddsParams.regions;
  }

  const liveOdds = await fetchFromOddsApi(`/sports/${sportKey}/odds`, oddsParams);
  const liveMap = new Map(liveEvents.map((event) => [event.id, event]));
  const oddsItems = Array.isArray(liveOdds) ? liveOdds : [];

  return {
    sportKey,
    liveEventCount: liveEvents.length,
    oddsEventCount: oddsItems.length,
    games: oddsItems.map((event) => buildGameFromOdds(event, liveMap.get(event.id))).filter(Boolean),
  };
};

export async function GET(_request) {
  if (!API_KEY) {
    return makeJsonResponse(
      makeEmptyPayload(
        "Sem jogos ao vivo",
        "ODDS_API_KEY ausente no ambiente do servidor"
      )
    );
  }

  if (!SPORT_KEYS.length) {
    return makeJsonResponse(
      makeEmptyPayload(
        "Sem jogos ao vivo",
        "Nenhuma liga configurada em ODDS_API_SPORTS"
      )
    );
  }

  try {
    const results = await Promise.allSettled(
      SPORT_KEYS.map((sportKey) => fetchLiveGamesForSport(sportKey))
    );

    const successfulResults = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    const totalLiveEventCount = successfulResults.reduce(
      (sum, result) => sum + result.liveEventCount,
      0
    );

    const totalOddsEventCount = successfulResults.reduce(
      (sum, result) => sum + result.oddsEventCount,
      0
    );

    const games = successfulResults
      .flatMap((result) => result.games)
      .sort((left, right) => right.ev - left.ev);

    const rejected = results.filter((result) => result.status === "rejected");

    if (!games.length) {
      let debugMessage = "Nenhum jogo ao vivo com cotacoes disponiveis";

      if (totalLiveEventCount === 0) {
        debugMessage = "Nenhum jogo ao vivo nas ligas configuradas";
      } else if (totalOddsEventCount === 0) {
        debugMessage = "Ha jogos ao vivo, mas sem cotacoes na regiao ou bookmakers configurados";
      } else if (rejected.length) {
        debugMessage = rejected[0]?.reason?.message || debugMessage;
      }

      return makeJsonResponse(
        makeEmptyPayload("Sem jogos ao vivo", debugMessage)
      );
    }

    return makeJsonResponse({
      games,
      updatedAt: new Date().toISOString(),
      message: "ok",
      debug:
        totalLiveEventCount > games.length
          ? "Alguns jogos ao vivo ficaram sem cotacoes compativeis com a configuracao atual"
          : "",
    });
  } catch (error) {
    return makeJsonResponse(
      makeEmptyPayload("Sem jogos ao vivo", error?.message || "Falha inesperada")
    );
  }
}

export default {
  fetch(request) {
    if (request.method !== "GET") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: {
          Allow: "GET",
          "Cache-Control": "no-store",
        },
      });
    }

    return GET(request);
  },
};
