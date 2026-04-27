const API_BASE = "https://api.the-odds-api.com/v4";
const API_BASE = "https://v3.football.api-sports.io";
const API_KEY =
  process.env.ODDS_API_KEY ||
  process.env.API_KEY ||
  process.env.APISPORTS_KEY ||
  process.env.API_FOOTBALL_KEY ||
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

const UPCOMING_LIMIT = Math.max(
const NEXT_LIMIT = Math.max(
  1,
  Math.min(12, Number.parseInt(process.env.ODDS_API_UPCOMING_LIMIT || "8", 10) || 8)
  Math.min(12, Number.parseInt(process.env.API_FOOTBALL_NEXT_LIMIT || "8", 10) || 8)
);

const normalizeText = (value) =>
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = parseFloat(String(value).replace(",", "."));
  const parsed = parseFloat(String(value).replace("%", "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

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
  Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "s-maxage=120, stale-while-revalidate=180",
      "Cache-Control": "s-maxage=20, stale-while-revalidate=40",
    },
  });

  try {
    return await response.json();
  } catch (_error) {
    return [];
    return { response: [] };
  }
};

const fetchFromOddsApi = async (path, params = {}) => {
  const searchParams = new URLSearchParams({
    ...params,
    apiKey: API_KEY,
const fetchFromApi = async (path) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "x-apisports-key": API_KEY,
    },
  });

  const response = await fetch(`${API_BASE}${path}?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error(`ODDS_API_${response.status}`);
    throw new Error(`API_FOOTBALL_${response.status}`);
  }

  return await safeJson(response);
  const payload = await safeJson(response);
  return Array.isArray(payload.response) ? payload.response : [];
};

const createOddsParams = (extraParams = {}) => {
  const params = {
    regions: REGIONS || "eu",
    markets: "h2h",
    oddsFormat: "decimal",
    dateFormat: "iso",
    ...extraParams,
  };
const getStatistic = (statistics, aliases) => {
  const wanted = aliases.map(normalizeText);

  if (BOOKMAKERS) {
    params.bookmakers = BOOKMAKERS;
    delete params.regions;
  for (const entry of statistics ?? []) {
    if (wanted.includes(normalizeText(entry?.type))) {
      return toNumber(entry?.value);
    }
  }

  return params;
  return 0;
};

const isLiveScoreEvent = (event) =>
  !event?.completed && Array.isArray(event?.scores) && event.scores.length > 0;
const extractHomeStats = (statisticsResponse, homeTeamId) => {
  const homeEntry =
    statisticsResponse.find((entry) => entry?.team?.id === homeTeamId) ?? statisticsResponse[0];

const findScore = (scores, teamName) => {
  const normalizedTeam = normalizeText(teamName);
  const stats = homeEntry?.statistics ?? [];

  for (const item of scores ?? []) {
    if (normalizeText(item?.name) === normalizedTeam) {
      return toNumber(item?.score);
    }
  }

  return 0;
  return {
    attacks: getStatistic(stats, ["Attacks", "Total Attacks"]),
    dangerous: getStatistic(stats, ["Dangerous Attacks", "Dangerous attacks"]),
    shots: getStatistic(stats, ["Total Shots", "Shots on Goal"]),
    corners: getStatistic(stats, ["Corner Kicks", "Corners"]),
    possession: getStatistic(stats, ["Ball Possession", "Possession"]),
  };
};

const findH2hMarket = (bookmaker) =>
  bookmaker?.markets?.find((market) => normalizeText(market?.key) === "h2h") ?? null;
const summarizeOddsEntries = (oddsEntries, homeName) => {
  const normalizedHome = normalizeText(homeName);
  const bookmakerRows = [];

const getHomeOutcome = (outcomes, homeTeam) => {
  const normalizedHome = normalizeText(homeTeam);
  for (const item of oddsEntries ?? []) {
    for (const bookmaker of item?.bookmakers ?? []) {
      for (const bet of bookmaker?.bets ?? []) {
        const betName = normalizeText(bet?.name);
        const isMatchWinner =
          betName.includes("match winner") || betName === "winner" || betName === "1x2";

  return (
    outcomes?.find((outcome) => normalizeText(outcome?.name) === normalizedHome) ?? null
  );
};
        if (!isMatchWinner) {
          continue;
        }

const getNormalizedHomeProbability = (outcomes, homeTeam) => {
  const pricedOutcomes = (outcomes ?? [])
    .map((outcome) => ({
      name: outcome?.name ?? "",
      price: toNumber(outcome?.price),
    }))
    .filter((outcome) => outcome.price > 1);
        const outcomes = (bet?.values ?? [])
          .map((value) => ({
            label: normalizeText(value?.value ?? value?.label),
            odd: toNumber(value?.odd),
          }))
          .filter((value) => value.odd > 1);

        if (outcomes.length < 2) {
          continue;
        }

        const homeOutcome =
          outcomes.find((value) => value.label === "home") ||
          outcomes.find((value) => value.label === "1") ||
          outcomes.find((value) => value.label === normalizedHome);

        if (!homeOutcome) {
          continue;
        }

        const totalImplied = outcomes.reduce((sum, value) => sum + 1 / value.odd, 0);

  if (!pricedOutcomes.length) {
    return 0;
  }
        if (!(totalImplied > 0)) {
          continue;
        }

  const implied = pricedOutcomes.map((outcome) => ({
    ...outcome,
    probability: 1 / outcome.price,
  }));
        bookmakerRows.push({
          bookmaker: bookmaker?.name ?? bookmaker?.title ?? bookmaker?.id ?? "bookmaker",
          homeOdd: homeOutcome.odd,
          homeProbability: (1 / homeOutcome.odd) / totalImplied,
          lastUpdate: item?.update ?? bookmaker?.update ?? null,
        });

  const total = implied.reduce((sum, outcome) => sum + outcome.probability, 0);
        break;
      }
    }
  }

  if (!(total > 0)) {
    return 0;
  if (!bookmakerRows.length) {
    return null;
  }

  const homeEntry = implied.find(
    (outcome) => normalizeText(outcome.name) === normalizeText(homeTeam)
  const bestEntry = bookmakerRows.reduce((best, current) =>
    current.homeOdd > best.homeOdd ? current : best
  );

  if (!homeEntry) {
    return 0;
  const consensusProbability = average(
    bookmakerRows.map((entry) => entry.homeProbability)
  );

  if (!(bestEntry.homeOdd > 1) || !(consensusProbability > 0)) {
    return null;
  }

  return homeEntry.probability / total;
  const fairOdd = 1 / consensusProbability;

  return {
    bestBookmaker: bestEntry.bookmaker,
    oddHome: bestEntry.homeOdd,
    consensusProbability,
    fairOdd,
    marketEdge: bestEntry.homeOdd - fairOdd,
    bookmakersCount: bookmakerRows.length,
    updatedAt: bestEntry.lastUpdate,
  };
};

const buildGameFromOdds = (oddsEvent, liveScoreEvent = null) => {
  if (!oddsEvent) {
    return null;
const buildLiveOddsMap = (oddsResponse) => {
  const map = new Map();

  for (const item of oddsResponse ?? []) {
    const fixtureId = item?.fixture?.id;
    const homeName = item?.teams?.home?.name ?? "";
    const summary = summarizeOddsEntries([item], homeName);

    if (fixtureId && summary) {
      map.set(fixtureId, summary);
    }
  }

  const homeTeam = oddsEvent.home_team ?? liveScoreEvent?.home_team ?? "";
  const awayTeam = oddsEvent.away_team ?? liveScoreEvent?.away_team ?? "";
  const bookmakers = Array.isArray(oddsEvent.bookmakers) ? oddsEvent.bookmakers : [];
  return map;
};

  const bookmakerEntries = bookmakers
    .map((bookmaker) => {
      const h2hMarket = findH2hMarket(bookmaker);
      const outcomes = h2hMarket?.outcomes ?? [];
      const homeOutcome = getHomeOutcome(outcomes, homeTeam);
      const homePrice = toNumber(homeOutcome?.price);
      const homeProbability = getNormalizedHomeProbability(outcomes, homeTeam);
const calculateLiveEv = ({ attacks, dangerous, shots, corners, possession, minute, oddHome }) => {
  const pressure =
    attacks * 0.03 +
    dangerous * 0.07 +
    shots * 0.06 +
    corners * 0.04 +
    possession * 0.01 +
    minute * 0.02;

      if (!(homePrice > 1) || !(homeProbability > 0)) {
        return null;
      }
  const probability = Math.min(0.85, pressure / 10);
  const ev = probability * oddHome - 1;

      return {
        bookmaker: bookmaker?.title ?? bookmaker?.key ?? "bookmaker",
        homePrice,
        homeProbability,
        lastUpdate: bookmaker?.last_update ?? h2hMarket?.last_update ?? null,
      };
    })
    .filter(Boolean);
  return {
    pressure,
    probability,
    ev,
  };
};

  if (!bookmakerEntries.length) {
const buildLiveGame = (fixture, stats, oddsSummary) => {
  if (!fixture || !oddsSummary) {
    return null;
  }

  const bestEntry = bookmakerEntries.reduce((best, current) =>
    current.homePrice > best.homePrice ? current : best
  );

  const consensusProbability = average(
    bookmakerEntries.map((entry) => entry.homeProbability)
  );
  const fixtureId = fixture?.fixture?.id;
  const minute = toNumber(fixture?.fixture?.status?.elapsed);
  const homeName = fixture?.teams?.home?.name ?? "";
  const awayName = fixture?.teams?.away?.name ?? "";
  const leagueName = fixture?.league?.name ?? "";
  const homeGoals = toNumber(fixture?.goals?.home);
  const awayGoals = toNumber(fixture?.goals?.away);

  if (!(consensusProbability > 0)) {
  if (!fixtureId || !homeName || !awayName || !(oddsSummary.oddHome > 1)) {
    return null;
  }

  const ev = consensusProbability * bestEntry.homePrice - 1;
  const isLive = Boolean(liveScoreEvent);
  const homeScore = isLive ? findScore(liveScoreEvent.scores, homeTeam) : null;
  const awayScore = isLive ? findScore(liveScoreEvent.scores, awayTeam) : null;
  const minute = isLive ? estimateMinute(liveScoreEvent.commence_time || oddsEvent.commence_time) : 0;
  const fairOdd = consensusProbability > 0 ? 1 / consensusProbability : 0;
  const { pressure, probability, ev } = calculateLiveEv({
    ...stats,
    minute,
    oddHome: oddsSummary.oddHome,
  });

  return {
    id: oddsEvent.id,
    game: `${homeTeam} x ${awayTeam}`,
    league: oddsEvent.sport_title ?? liveScoreEvent?.sport_title ?? "Soccer",
    id: fixtureId,
    game: `${homeName} x ${awayName}`,
    league: leagueName,
    minute,
    minuteLabel: isLive ? "estimado" : "pre",
    minuteLabel: "ao vivo",
    ev,
    oddHome: bestEntry.homePrice,
    probability: consensusProbability,
    fairOdd,
    marketEdge: bestEntry.homePrice - fairOdd,
    bestBookmaker: bestEntry.bookmaker,
    oddHome: oddsSummary.oddHome,
    probability,
    fairOdd: probability > 0 ? 1 / probability : 0,
    marketEdge: oddsSummary.marketEdge,
    bestBookmaker: oddsSummary.bestBookmaker,
    isPositiveEv: ev > 0,
    isLive,
    scoreLine: isLive ? `${homeScore} x ${awayScore}` : "Pre-jogo",
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    updatedAt: liveScoreEvent?.last_update || bestEntry.lastUpdate || null,
    commenceTime: liveScoreEvent?.commence_time || oddsEvent.commence_time || null,
    source: "The Odds API",
    isLive: true,
    scoreLine: `${homeGoals} x ${awayGoals}`,
    attacks: stats.attacks,
    dangerous: stats.dangerous,
    shots: stats.shots,
    corners: stats.corners,
    possession: stats.possession,
    pressure,
    updatedAt: oddsSummary.updatedAt,
    commenceTime: fixture?.fixture?.date ?? null,
    source: "API-Football",
  };
};

const fetchLiveGamesForSport = async (sportKey) => {
  const liveScores = await fetchFromOddsApi(`/sports/${sportKey}/scores`, {
    dateFormat: "iso",
  });
const buildUpcomingGame = (fixture, oddsSummary) => {
  if (!fixture || !oddsSummary) {
    return null;
  }

  const liveEvents = Array.isArray(liveScores) ? liveScores.filter(isLiveScoreEvent) : [];
  const fixtureId = fixture?.fixture?.id;
  const homeName = fixture?.teams?.home?.name ?? "";
  const awayName = fixture?.teams?.away?.name ?? "";
  const leagueName = fixture?.league?.name ?? "";
  const probability = oddsSummary.consensusProbability;
  const ev = probability * oddsSummary.oddHome - 1;

  if (!liveEvents.length) {
    return {
      sportKey,
      liveEventCount: 0,
      oddsEventCount: 0,
      games: [],
    };
  if (!fixtureId || !homeName || !awayName || !(oddsSummary.oddHome > 1) || !(probability > 0)) {
    return null;
  }

  const eventIds = liveEvents.map((event) => event.id).filter(Boolean);
  return {
    id: fixtureId,
    game: `${homeName} x ${awayName}`,
    league: leagueName,
    minute: 0,
    minuteLabel: "pre",
    ev,
    oddHome: oddsSummary.oddHome,
    probability,
    fairOdd: oddsSummary.fairOdd,
    marketEdge: oddsSummary.marketEdge,
    bestBookmaker: oddsSummary.bestBookmaker,
    isPositiveEv: ev > 0,
    isLive: false,
    scoreLine: "Pre-jogo",
    attacks: 0,
    dangerous: 0,
    shots: 0,
    corners: 0,
    possession: 0,
    pressure: 0,
    updatedAt: oddsSummary.updatedAt,
    commenceTime: fixture?.fixture?.date ?? null,
    source: "API-Football",
  };
};

  if (!eventIds.length) {
const fetchLiveGames = async () => {
  const liveFixtures = await fetchFromApi("/fixtures?live=all");

  if (!liveFixtures.length) {
    return {
      sportKey,
      liveEventCount: liveEvents.length,
      oddsEventCount: 0,
      games: [],
      fixturesCount: 0,
      oddsCount: 0,
    };
  }

  const liveOdds = await fetchFromOddsApi(
    `/sports/${sportKey}/odds`,
    createOddsParams({
      eventIds: eventIds.join(","),
    })
  let liveOddsMap = new Map();

  try {
    const liveOdds = await fetchFromApi("/odds/live");
    liveOddsMap = buildLiveOddsMap(liveOdds);
  } catch (_error) {
    liveOddsMap = new Map();
  }

  const statisticsResults = await Promise.allSettled(
    liveFixtures.map((fixture) => fetchFromApi(`/fixtures/statistics?fixture=${fixture.fixture.id}`))
  );

  const liveMap = new Map(liveEvents.map((event) => [event.id, event]));
  const oddsItems = Array.isArray(liveOdds) ? liveOdds : [];
  const statsMap = new Map();

  statisticsResults.forEach((result, index) => {
    if (result.status !== "fulfilled") {
      return;
    }

    const fixture = liveFixtures[index];
    const homeId = fixture?.teams?.home?.id;
    statsMap.set(fixture.fixture.id, extractHomeStats(result.value, homeId));
  });

  const oddsFallbackTargets = liveFixtures.filter((fixture) => !liveOddsMap.has(fixture?.fixture?.id));

  if (oddsFallbackTargets.length) {
    const oddsFallbackResults = await Promise.allSettled(
      oddsFallbackTargets.map((fixture) => fetchFromApi(`/odds?fixture=${fixture.fixture.id}`))
    );

    oddsFallbackResults.forEach((result, index) => {
      if (result.status !== "fulfilled") {
        return;
      }

      const fixture = oddsFallbackTargets[index];
      const summary = summarizeOddsEntries(result.value, fixture?.teams?.home?.name ?? "");

      if (summary) {
        liveOddsMap.set(fixture.fixture.id, summary);
      }
    });
  }

  const games = liveFixtures
    .map((fixture) => {
      const stats =
        statsMap.get(fixture?.fixture?.id) ?? {
          attacks: 0,
          dangerous: 0,
          shots: 0,
          corners: 0,
          possession: 0,
        };

      return buildLiveGame(fixture, stats, liveOddsMap.get(fixture?.fixture?.id));
    })
    .filter(Boolean)
    .sort((left, right) => right.ev - left.ev);

  return {
    sportKey,
    liveEventCount: liveEvents.length,
    oddsEventCount: oddsItems.length,
    games: oddsItems.map((event) => buildGameFromOdds(event, liveMap.get(event.id))).filter(Boolean),
    games,
    fixturesCount: liveFixtures.length,
    oddsCount: liveOddsMap.size,
  };
};

const fetchUpcomingGamesForSport = async (sportKey) => {
  const oddsItems = await fetchFromOddsApi(
    `/sports/${sportKey}/odds`,
    createOddsParams({
      commenceTimeFrom: new Date().toISOString(),
    })
const fetchUpcomingGames = async () => {
  const upcomingFixtures = await fetchFromApi(`/fixtures?next=${NEXT_LIMIT}`);

  if (!upcomingFixtures.length) {
    return [];
  }

  const oddsResults = await Promise.allSettled(
    upcomingFixtures.map((fixture) => fetchFromApi(`/odds?fixture=${fixture.fixture.id}`))
  );

  const upcomingGames = (Array.isArray(oddsItems) ? oddsItems : [])
    .map((event) => buildGameFromOdds(event, null))
    .filter(Boolean)
    .sort((left, right) => {
      const leftTime = new Date(left.commenceTime || 0).getTime();
      const rightTime = new Date(right.commenceTime || 0).getTime();
      return leftTime - rightTime;
    })
    .slice(0, UPCOMING_LIMIT);
  return upcomingFixtures
    .map((fixture, index) => {
      const oddsResult = oddsResults[index];

  return {
    sportKey,
    games: upcomingGames,
  };
      if (oddsResult.status !== "fulfilled") {
        return null;
      }

      const summary = summarizeOddsEntries(oddsResult.value, fixture?.teams?.home?.name ?? "");
      return buildUpcomingGame(fixture, summary);
    })
    .filter(Boolean)
    .sort((left, right) => right.ev - left.ev);
};

export async function GET(_request) {
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
        "API_KEY ausente no ambiente do servidor"
      )
    );
  }

  try {
    const results = await Promise.allSettled(
      SPORT_KEYS.map((sportKey) => fetchLiveGamesForSport(sportKey))
    );
    const liveResult = await fetchLiveGames();

    const successfulResults = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);
    if (liveResult.games.length) {
      return makeJsonResponse({
        games: liveResult.games,
        updatedAt: new Date().toISOString(),
        message: "ok",
        debug:
          liveResult.fixturesCount > liveResult.games.length
            ? "Alguns jogos ao vivo ficaram sem odds compativeis"
            : "",
      });
    }

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
      const upcomingResults = await Promise.allSettled(
        SPORT_KEYS.map((sportKey) => fetchUpcomingGamesForSport(sportKey))
      );

      const upcomingGames = upcomingResults
        .filter((result) => result.status === "fulfilled")
        .flatMap((result) => result.value.games)
        .sort((left, right) => right.ev - left.ev);

      if (upcomingGames.length) {
        return makeJsonResponse({
          games: upcomingGames,
          updatedAt: new Date().toISOString(),
          message: "Sem jogos ao vivo agora; mostrando proximos jogos com cotacoes",
          debug: "Sem jogos ao vivo nas ligas configuradas; exibindo proximos jogos",
        });
      }

      let debugMessage = "Nenhum jogo ao vivo ou proximo jogo com cotacoes disponiveis";

      if (totalLiveEventCount === 0) {
        debugMessage = "Nenhum jogo ao vivo nas ligas configuradas";
      } else if (totalOddsEventCount === 0) {
        debugMessage = "Ha jogos ao vivo, mas sem cotacoes na regiao ou bookmakers configurados";
      } else if (rejected.length) {
        debugMessage = rejected[0]?.reason?.message || debugMessage;
      }
    const upcomingGames = await fetchUpcomingGames();

      return makeJsonResponse(
        makeEmptyPayload("Sem jogos ao vivo", debugMessage)
      );
    if (upcomingGames.length) {
      return makeJsonResponse({
        games: upcomingGames,
        updatedAt: new Date().toISOString(),
        message: "Sem jogos ao vivo agora; mostrando proximos jogos com odds",
        debug:
          liveResult.fixturesCount > 0
            ? "Ha jogos ao vivo, mas sem odds ou estatisticas suficientes para montar o radar"
            : "Sem jogos ao vivo no momento; exibindo proximos jogos com odds",
      });
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
    return makeJsonResponse(
      makeEmptyPayload(
        "Sem jogos ao vivo",
        liveResult.fixturesCount > 0
          ? "Ha jogos ao vivo, mas sem odds disponiveis ou sem dados suficientes"
          : "Nenhum jogo ao vivo ou proximo jogo com odds disponiveis"
      )
    );
  } catch (error) {
    return makeJsonResponse(
      makeEmptyPayload("Sem jogos ao vivo", error?.message || "Falha inesperada")
