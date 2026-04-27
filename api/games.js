const API_BASE = "https://api.sportmonks.com/v3/football";
const API_TOKEN =
  process.env.SPORTMONKS_API_TOKEN ||
  process.env.API_TOKEN ||
  process.env.API_KEY ||
  "";
const API_BASE = "https://api.the-odds-api.com/v4";
const API_KEY = process.env.ODDS_API_KEY || process.env.API_KEY || "";

const MATCH_WINNER_MARKET_ID = Number.parseInt(
  process.env.SPORTMONKS_MARKET_ID || "1",
  10
) || 1;
const DEFAULT_SPORTS = [
  "soccer_brazil_campeonato",
  "soccer_brazil_serie_b",
  "soccer_epl",
  "soccer_spain_la_liga",
  "soccer_italy_serie_a",
  "soccer_germany_bundesliga",
  "soccer_france_ligue_one",
];

const SPORT_KEYS = String(process.env.ODDS_API_SPORTS || DEFAULT_SPORTS.join(","))
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const REGIONS = String(process.env.ODDS_API_REGIONS || "eu").trim() || "eu";
const MARKETS = String(process.env.ODDS_API_MARKETS || "h2h").trim() || "h2h";
const NEXT_LIMIT = Math.max(
  1,
  Math.min(12, Number.parseInt(process.env.SPORTMONKS_NEXT_LIMIT || "8", 10) || 8)
  Math.min(18, Number.parseInt(process.env.ODDS_API_NEXT_LIMIT || "8", 10) || 8)
);
const LIVE_WINDOW_MINUTES = Math.max(
  60,
  Math.min(220, Number.parseInt(process.env.ODDS_API_LIVE_WINDOW_MINUTES || "170", 10) || 170)
);

const STAT_TYPES = {
  corners: 34,
  shots: 42,
  attacks: 43,
  dangerous: 44,
  possession: 45,
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const average = (values) => {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const LIVE_STATE_CODES = new Set([
  "INPLAY_1ST_HALF",
  "INPLAY_2ND_HALF",
  "HT",
  "BREAK",
  "ET",
  "INPLAY_ET",
  "PEN_LIVE",
  "LIVE",
]);

const normalizeText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = parseFloat(String(value).replace("%", "").replace(",", "."));
  const parsed = Number.parseFloat(String(value).replace("%", "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeStateCode = (value) => String(value ?? "").trim().toUpperCase();

const average = (values) => {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const makeEmptyPayload = (reason = "Sem jogos ao vivo", debug = "") => ({
  games: [],
  updatedAt: new Date().toISOString(),
  try {
    return await response.json();
  } catch (_error) {
    return { data: [] };
    return [];
  }
};

const extractErrorMessage = async (response) => {
  const payload = await safeJson(response);

  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message.trim();
  }
const fetchJson = async (path, query) => {
  const searchParams = new URLSearchParams(query);
  const response = await fetch(`${API_BASE}${path}?${searchParams.toString()}`);

  if (typeof payload?.error === "string" && payload.error.trim()) {
    return payload.error.trim();
  if (!response.ok) {
    throw new Error(`THE_ODDS_API_${response.status}`);
  }

  return `SPORTMONKS_${response.status}`;
  return safeJson(response);
};

const fetchFromSportMonks = async (path, params = {}) => {
  const searchParams = new URLSearchParams({
    ...params,
    api_token: API_TOKEN,
const fetchOddsForSport = async (sportKey) =>
  fetchJson(`/sports/${sportKey}/odds`, {
    apiKey: API_KEY,
    regions: REGIONS,
    markets: MARKETS,
    oddsFormat: "decimal",
    dateFormat: "iso",
  });

  const response = await fetch(`${API_BASE}${path}?${searchParams.toString()}`);

  if (!response.ok) {
    const error = new Error(await extractErrorMessage(response));
    error.status = response.status;
    throw error;
const fetchScoresForSport = async (sportKey) => {
  try {
    return await fetchJson(`/sports/${sportKey}/scores`, {
      apiKey: API_KEY,
      dateFormat: "iso",
    });
  } catch (_error) {
    return [];
  }
};

  const payload = await safeJson(response);
  const data = payload?.data;
const mapOutcomeKey = (name, homeTeam, awayTeam) => {
  const normalizedName = normalizeText(name);

  if (Array.isArray(data)) {
    return data;
  if (normalizedName === normalizeText(homeTeam)) {
    return "home";
  }

  if (data && typeof data === "object") {
    return [data];
  if (normalizedName === normalizeText(awayTeam)) {
    return "away";
  }

  return [];
};
  if (normalizedName === "draw" || normalizedName === "tie" || normalizedName === "empate" || normalizedName === "x") {
    return "draw";
  }

const getParticipantByLocation = (participants, location) =>
  (participants ?? []).find(
    (participant) => normalizeText(participant?.meta?.location) === normalizeText(location)
  ) ?? null;

const getCurrentScore = (scores, location) => {
  const currentScore =
    (scores ?? []).find(
      (entry) =>
        normalizeText(entry?.description) === "current" &&
        normalizeText(entry?.score?.participant) === normalizeText(location)
    ) ??
    (scores ?? [])
      .filter((entry) => normalizeText(entry?.score?.participant) === normalizeText(location))
      .slice(-1)[0];

  return toNumber(currentScore?.score?.goals);
  return null;
};

const getStatisticValue = (statistics, location, typeId) => {
  const entry = (statistics ?? []).find(
    (item) =>
      normalizeText(item?.location) === normalizeText(location) &&
      toNumber(item?.type_id) === typeId
  );

  return toNumber(entry?.data?.value);
};
const findScoreValue = (scores, teamName) => {
  const target = normalizeText(teamName);
  const row = (scores ?? []).find((entry) => normalizeText(entry?.name) === target);

const extractHomeStats = (fixture) => ({
  corners: getStatisticValue(fixture?.statistics, "home", STAT_TYPES.corners),
  shots: getStatisticValue(fixture?.statistics, "home", STAT_TYPES.shots),
  attacks: getStatisticValue(fixture?.statistics, "home", STAT_TYPES.attacks),
  dangerous: getStatisticValue(fixture?.statistics, "home", STAT_TYPES.dangerous),
  possession: getStatisticValue(fixture?.statistics, "home", STAT_TYPES.possession),
});
  if (!row) {
    return null;
  }

const getFixtureStateCode = (fixture) =>
  normalizeStateCode(
    fixture?.state?.developer_name ||
      fixture?.state?.state ||
      fixture?.state?.short_name ||
      fixture?.state?.name
  );
  const rawValue = row.score ?? row.points ?? row.value ?? null;

const isFixtureLiveByState = (fixture) => {
  const stateCode = getFixtureStateCode(fixture);
  const minute = toNumber(fixture?.time?.minute);
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return null;
  }

  return LIVE_STATE_CODES.has(stateCode) || minute > 0;
  const score = toNumber(rawValue);
  return Number.isFinite(score) ? score : null;
};

const isFixtureStartingSoon = (fixture) => {
  const stateCode = getFixtureStateCode(fixture);

  if (stateCode !== "NS") {
    return false;
  }
const buildScoresMap = (events) => {
  const map = new Map();

  const kickoff = new Date(fixture?.starting_at || fixture?.starting_at_timestamp * 1000 || 0).getTime();
  for (const event of events ?? []) {
    const homeScore = findScoreValue(event?.scores, event?.home_team);
    const awayScore = findScoreValue(event?.scores, event?.away_team);
    const hasScores = homeScore !== null && awayScore !== null;

  if (!kickoff) {
    return false;
    map.set(event?.id, {
      completed: Boolean(event?.completed),
      hasScores,
      scoreLine: hasScores ? `${homeScore} x ${awayScore}` : null,
    });
  }

  const diffMinutes = (kickoff - Date.now()) / 60000;
  return diffMinutes >= -15 && diffMinutes <= 30;
  return map;
};

const groupOddsByBookmaker = (oddsRows, homeTeamName) => {
  const filteredRows = (oddsRows ?? []).filter(
    (row) => toNumber(row?.market_id) === MATCH_WINNER_MARKET_ID
  );

  const grouped = new Map();
const aggregateOutcomes = (event) => {
  const buckets = {
    home: {
      key: "home",
      code: "1",
      label: event.home_team,
      probabilities: [],
      bestOdd: 0,
      bestBookmaker: "",
    },
    draw: {
      key: "draw",
      code: "X",
      label: "Empate",
      probabilities: [],
      bestOdd: 0,
      bestBookmaker: "",
    },
    away: {
      key: "away",
      code: "2",
      label: event.away_team,
      probabilities: [],
      bestOdd: 0,
      bestBookmaker: "",
    },
  };

  for (const row of filteredRows) {
    const bookmakerId = row?.bookmaker_id ?? "unknown";
  for (const bookmaker of event?.bookmakers ?? []) {
    const market =
      (bookmaker?.markets ?? []).find((item) => item?.key === MARKETS) ??
      (bookmaker?.markets ?? [])[0];

    if (!grouped.has(bookmakerId)) {
      grouped.set(bookmakerId, []);
    if (!market || !Array.isArray(market.outcomes)) {
      continue;
    }

    grouped.get(bookmakerId).push(row);
  }
    const normalized = market.outcomes
      .map((outcome) => {
        const bucketKey = mapOutcomeKey(outcome?.name, event?.home_team, event?.away_team);
        const price = toNumber(outcome?.price);

  const bookmakerSummaries = [];

  for (const rows of grouped.values()) {
    const outcomes = rows
      .map((row) => ({
        label: normalizeText(row?.label),
        name: normalizeText(row?.name),
        odd: toNumber(row?.value),
        bookmaker:
          row?.bookmaker?.name ||
          row?.bookmaker?.data?.name ||
          row?.bookmaker_id ||
          "bookmaker",
        updatedAt: row?.latest_bookmaker_update || row?.updated_at || null,
      }))
      .filter((row) => row.odd > 1);
        if (!bucketKey || price <= 1) {
          return null;
        }

    if (outcomes.length < 2) {
      continue;
    }
        if (price > buckets[bucketKey].bestOdd) {
          buckets[bucketKey].bestOdd = price;
          buckets[bucketKey].bestBookmaker = bookmaker?.title || "bookmaker";
        }

    const homeOutcome =
      outcomes.find((row) => row.label === "1") ||
      outcomes.find((row) => row.label === "home") ||
      outcomes.find((row) => row.name === normalizeText(homeTeamName));
        return {
          bucketKey,
          price,
        };
      })
      .filter(Boolean);

    if (!homeOutcome) {
    if (normalized.length < 2) {
      continue;
    }

    const totalImplied = outcomes.reduce((sum, row) => sum + 1 / row.odd, 0);
    const totalImplied = normalized.reduce((sum, item) => sum + 1 / item.price, 0);

    if (!(totalImplied > 0)) {
      continue;
    }

    bookmakerSummaries.push({
      bookmaker: homeOutcome.bookmaker,
      homeOdd: homeOutcome.odd,
      probability: (1 / homeOutcome.odd) / totalImplied,
      updatedAt: homeOutcome.updatedAt,
    });
  }

  if (!bookmakerSummaries.length) {
    return null;
    for (const item of normalized) {
      buckets[item.bucketKey].probabilities.push((1 / item.price) / totalImplied);
    }
  }

  const bestEntry = bookmakerSummaries.reduce((best, current) =>
    current.homeOdd > best.homeOdd ? current : best
  );
  const available = Object.values(buckets)
    .map((bucket) => ({
      ...bucket,
      probability: average(bucket.probabilities),
    }))
    .filter((bucket) => bucket.bestOdd > 1 && bucket.probability > 0);

  const consensusProbability = average(
    bookmakerSummaries.map((entry) => entry.probability)
  );

  if (!(consensusProbability > 0)) {
  if (!available.length) {
    return null;
  }

  return {
    bestBookmaker: bestEntry.bookmaker,
    oddHome: bestEntry.homeOdd,
    probability: consensusProbability,
    fairOdd: 1 / consensusProbability,
    marketEdge: bestEntry.homeOdd - 1 / consensusProbability,
    updatedAt: bestEntry.updatedAt,
  };
};
  const selected = available.sort((left, right) => {
    if (right.probability !== left.probability) {
      return right.probability - left.probability;
    }

const calculateLiveSignal = ({ attacks, dangerous, shots, corners, possession, minute, oddHome }) => {
  const pressure =
    attacks * 0.03 +
    dangerous * 0.07 +
    shots * 0.06 +
    corners * 0.04 +
    possession * 0.01 +
    minute * 0.02;
    return right.bestOdd - left.bestOdd;
  })[0];

  const probability = clamp(Math.min(0.85, pressure / 10), 0.12, 0.9);
  const ev = oddHome > 1 ? probability * oddHome - 1 : null;
  const probability = clamp(selected.probability, 0.05, 0.95);
  const fairOdd = probability > 0 ? 1 / probability : 0;
  const ev = probability * selected.bestOdd - 1;

  return {
    pressure,
    pickCode: selected.code,
    pickLabel: selected.label,
    bestBookmaker: selected.bestBookmaker,
    odd: selected.bestOdd,
    probability,
    fairOdd,
    marketEdge: selected.bestOdd - fairOdd,
    ev,
  };
};

const buildLiveGame = (fixture, oddsSummary) => {
  if (!fixture) {
    return null;
  }

  const homeParticipant = getParticipantByLocation(fixture?.participants, "home");
  const awayParticipant = getParticipantByLocation(fixture?.participants, "away");
const buildGameFromEvent = (event, scoreInfo) => {
  const market = aggregateOutcomes(event);

  if (!homeParticipant || !awayParticipant) {
  if (!market) {
    return null;
  }

  const stats = extractHomeStats(fixture);
  const minute = toNumber(fixture?.time?.minute);
  const oddHome = oddsSummary?.oddHome ?? 0;
  const { pressure, probability, ev } = calculateLiveSignal({
    ...stats,
    minute,
    oddHome,
  });
  const commenceTime = event?.commence_time || null;
  const kickoffTimestamp = commenceTime ? Date.parse(commenceTime) : 0;
  const elapsedMinutes = kickoffTimestamp
    ? Math.floor((Date.now() - kickoffTimestamp) / 60000)
    : -1;

  const isLiveByTime = elapsedMinutes >= 0 && elapsedMinutes <= LIVE_WINDOW_MINUTES;
  const isLiveByScore = Boolean(scoreInfo) && scoreInfo.completed === false && (scoreInfo.hasScores || isLiveByTime);
  const isLive = isLiveByScore || isLiveByTime;
  const minute = isLive ? clamp(elapsedMinutes, 1, 120) : 0;

  return {
    id: fixture.id,
    game: `${homeParticipant.name} x ${awayParticipant.name}`,
    league: fixture?.league?.name || fixture?.league_id || "Football",
    id: event?.id,
    game: `${event?.home_team ?? "Time A"} x ${event?.away_team ?? "Time B"}`,
    league: event?.sport_title || event?.sport_key || "Football",
    minute,
    minuteLabel: "ao vivo",
    ev,
    oddHome,
    probability,
    marketProbability: oddsSummary?.probability ?? 0,
    fairOdd: probability > 0 ? 1 / probability : 0,
    marketEdge: oddHome > 1 && probability > 0 ? oddHome - 1 / probability : 0,
    bestBookmaker: oddsSummary?.bestBookmaker ?? "Sem odd live",
    hasOdds: oddHome > 1,
    isPositiveEv: oddHome > 1 ? ev > 0 : probability >= 0.6,
    isLive: true,
    bubbleValue: probability,
    scoreLine: `${getCurrentScore(fixture?.scores, "home")} x ${getCurrentScore(
      fixture?.scores,
      "away"
    )}`,
    attacks: stats.attacks,
    dangerous: stats.dangerous,
    shots: stats.shots,
    corners: stats.corners,
    possession: stats.possession,
    pressure,
    updatedAt: oddsSummary?.updatedAt ?? fixture?.last_processed_at ?? null,
    commenceTime: fixture?.starting_at || null,
    source: "SportMonks",
  };
};

const buildUpcomingGame = (fixture, oddsSummary) => {
  if (!fixture || !oddsSummary) {
    return null;
  }

  const homeParticipant = getParticipantByLocation(fixture?.participants, "home");
  const awayParticipant = getParticipantByLocation(fixture?.participants, "away");

  if (!homeParticipant || !awayParticipant) {
    return null;
  }

  const ev = oddsSummary.probability * oddsSummary.oddHome - 1;

  return {
    id: fixture.id,
    game: `${homeParticipant.name} x ${awayParticipant.name}`,
    league: fixture?.league?.name || fixture?.league_id || "Football",
    minute: 0,
    minuteLabel: "pre",
    ev,
    oddHome: oddsSummary.oddHome,
    probability: oddsSummary.probability,
    fairOdd: oddsSummary.fairOdd,
    marketEdge: oddsSummary.marketEdge,
    bestBookmaker: oddsSummary.bestBookmaker,
    hasOdds: oddsSummary.oddHome > 1,
    isPositiveEv: ev > 0,
    isLive: false,
    bubbleValue: oddsSummary.probability,
    scoreLine: "Pre-jogo",
    minuteLabel: isLive ? "ao vivo" : "pre",
    ev: market.ev,
    oddHome: market.odd,
    probability: market.probability,
    marketProbability: market.probability,
    fairOdd: market.fairOdd,
    marketEdge: market.marketEdge,
    bestBookmaker: market.bestBookmaker,
    pickCode: market.pickCode,
    pickLabel: market.pickLabel,
    hasOdds: market.odd > 1,
    isPositiveEv: market.ev > 0,
    isLive,
    bubbleValue: market.probability,
    scoreLine: isLive ? scoreInfo?.scoreLine || "Ao vivo" : "Pre-jogo",
    attacks: 0,
    dangerous: 0,
    shots: 0,
    corners: 0,
    possession: 0,
    pressure: 0,
    updatedAt: oddsSummary.updatedAt,
    commenceTime: fixture?.starting_at || null,
    source: "SportMonks",
  };
};

const fetchFixtureOddsSummary = async (fixtureId, homeTeamName, isLive) => {
  try {
    const liveOrPrePath = isLive
      ? `/odds/inplay/fixtures/${fixtureId}`
      : `/odds/pre-match/fixtures/${fixtureId}`;

    const oddsRows = await fetchFromSportMonks(liveOrPrePath, {
      include: "bookmaker",
    });

    return groupOddsByBookmaker(oddsRows, homeTeamName);
  } catch (error) {
    if (isLive) {
      try {
        const preMatchRows = await fetchFromSportMonks(`/odds/pre-match/fixtures/${fixtureId}`, {
          include: "bookmaker",
        });

        return groupOddsByBookmaker(preMatchRows, homeTeamName);
      } catch (_fallbackError) {
        return null;
      }
    }

    return null;
  }
};

const fetchLiveGames = async () => {
  const liveFixtures = await fetchFromSportMonks("/livescores/inplay", {
    include: "participants;scores;statistics;league;state",
  });

  if (!liveFixtures.length) {
    return {
      fixturesCount: 0,
      games: [],
      inplayOddsForbidden: false,
    };
  }

  let inplayOddsForbidden = false;

  const oddsResults = await Promise.allSettled(
    liveFixtures.map(async (fixture) => {
      const homeParticipant = getParticipantByLocation(fixture?.participants, "home");

      try {
        return await fetchFixtureOddsSummary(fixture.id, homeParticipant?.name ?? "", true);
      } catch (error) {
        if (error?.status === 403) {
          inplayOddsForbidden = true;
        }
        return null;
      }
    })
  );

  const games = liveFixtures
    .map((fixture, index) => {
      const oddsSummary =
        oddsResults[index]?.status === "fulfilled" ? oddsResults[index].value : null;
      return buildLiveGame(fixture, oddsSummary);
    })
    .filter(Boolean)
    .sort(
      (left, right) =>
        (right.bubbleValue ?? right.probability ?? 0) -
        (left.bubbleValue ?? left.probability ?? 0)
    );

  return {
    fixturesCount: liveFixtures.length,
    games,
    inplayOddsForbidden,
    updatedAt: new Date().toISOString(),
    commenceTime,
    source: "The Odds API",
  };
};

const fetchCurrentWindowGames = async () => {
  const liveScoreFixtures = await fetchFromSportMonks("/livescores", {
    include: "participants;scores;statistics;league;state",
  });
const fetchAllGames = async () => {
  const results = await Promise.allSettled(
    SPORT_KEYS.map(async (sportKey) => {
      const [oddsEvents, scoreEvents] = await Promise.all([
        fetchOddsForSport(sportKey),
        fetchScoresForSport(sportKey),
      ]);

  const currentWindowFixtures = liveScoreFixtures.filter(
    (fixture) => isFixtureLiveByState(fixture) || isFixtureStartingSoon(fixture)
  );
      const scoreMap = buildScoresMap(scoreEvents);

  if (!currentWindowFixtures.length) {
    return {
      fixturesCount: 0,
      games: [],
    };
  }

  const oddsResults = await Promise.allSettled(
    currentWindowFixtures.map(async (fixture) => {
      const homeParticipant = getParticipantByLocation(fixture?.participants, "home");
      return await fetchFixtureOddsSummary(
        fixture.id,
        homeParticipant?.name ?? "",
        isFixtureLiveByState(fixture)
      );
      return (oddsEvents ?? [])
        .map((event) => buildGameFromEvent(event, scoreMap.get(event?.id)))
        .filter(Boolean);
    })
  );

  const games = currentWindowFixtures
    .map((fixture, index) => {
      const oddsSummary =
        oddsResults[index]?.status === "fulfilled" ? oddsResults[index].value : null;

      if (isFixtureLiveByState(fixture)) {
        return buildLiveGame(fixture, oddsSummary);
      }

      return buildUpcomingGame(fixture, oddsSummary);
    })
    .filter(Boolean)
    .sort(
      (left, right) =>
        (right.bubbleValue ?? right.probability ?? 0) -
        (left.bubbleValue ?? left.probability ?? 0)
    );

  return {
    fixturesCount: currentWindowFixtures.length,
    games,
  };
  return results
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value);
};

const fetchUpcomingGames = async () => {
  const upcomingFixtures = await fetchFromSportMonks(
    `/fixtures/upcoming/markets/${MATCH_WINNER_MARKET_ID}`,
    {
      include: "participants;league",
      per_page: String(NEXT_LIMIT),
      order: "asc",
const sortGames = (games) =>
  [...games].sort((left, right) => {
    if (Number(right.isLive) !== Number(left.isLive)) {
      return Number(right.isLive) - Number(left.isLive);
    }
  );

  if (!upcomingFixtures.length) {
    return [];
  }

  const oddsResults = await Promise.allSettled(
    upcomingFixtures.map(async (fixture) => {
      const homeParticipant = getParticipantByLocation(fixture?.participants, "home");
      return await fetchFixtureOddsSummary(fixture.id, homeParticipant?.name ?? "", false);
    })
  );
    if ((right.bubbleValue ?? 0) !== (left.bubbleValue ?? 0)) {
      return (right.bubbleValue ?? 0) - (left.bubbleValue ?? 0);
    }

  return upcomingFixtures
    .map((fixture, index) => {
      const oddsSummary =
        oddsResults[index]?.status === "fulfilled" ? oddsResults[index].value : null;
      return buildUpcomingGame(fixture, oddsSummary);
    })
    .filter(Boolean)
    .sort(
      (left, right) =>
        (right.bubbleValue ?? right.probability ?? 0) -
        (left.bubbleValue ?? left.probability ?? 0)
    );
};
    return (right.ev ?? -999) - (left.ev ?? -999);
  });

export async function GET(_request) {
  if (!API_TOKEN) {
  if (!API_KEY) {
    return makeJsonResponse(
      makeEmptyPayload(
        "Sem jogos ao vivo",
        "SPORTMONKS_API_TOKEN ausente no ambiente do servidor"
        "ODDS_API_KEY ausente no ambiente do servidor"
      )
    );
  }

  try {
    const liveResult = await fetchLiveGames();
    const games = sortGames(await fetchAllGames());

    if (liveResult.games.length) {
      return makeJsonResponse({
        games: liveResult.games,
        updatedAt: new Date().toISOString(),
        message: "ok",
        debug: liveResult.inplayOddsForbidden
          ? "Jogos ao vivo exibidos com prioridade; parte deles pode estar sem odd live do seu plano"
          : liveResult.fixturesCount > liveResult.games.length
            ? "Alguns jogos ao vivo ficaram sem estatisticas suficientes"
            : "",
      });
    if (!games.length) {
      return makeJsonResponse(
        makeEmptyPayload(
          "Sem jogos ao vivo",
          "Nenhum evento retornado pela The Odds API nas ligas configuradas"
        )
      );
    }

    const currentWindowResult = await fetchCurrentWindowGames();
    const liveGames = games.filter((game) => game.isLive);

    if (currentWindowResult.games.length) {
    if (liveGames.length) {
      return makeJsonResponse({
        games: currentWindowResult.games,
        games: liveGames,
        updatedAt: new Date().toISOString(),
        message: "Sem inplay puro agora; mostrando jogos do momento",
        message: "ok",
        debug:
          "A API nao trouxe fixtures em /livescores/inplay, entao o radar caiu para /livescores com jogos ao vivo ou muito proximos",
          "Jogos ao vivo identificados via The Odds API. O minuto e estimado pelo horario de inicio.",
      });
    }

    const upcomingGames = await fetchUpcomingGames();
    const upcomingGames = games.filter((game) => !game.isLive).slice(0, NEXT_LIMIT);

    if (upcomingGames.length) {
      return makeJsonResponse({
        games: upcomingGames,
        updatedAt: new Date().toISOString(),
        message: "Sem jogos ao vivo agora; mostrando proximos jogos com cotacoes",
        debug: liveResult.inplayOddsForbidden
          ? "Seu plano SportMonks parece sem acesso a live odds; exibindo cotacoes pre-jogo"
          : "Sem jogos ao vivo no momento; exibindo proximos jogos com cotacoes",
      });
    }

    return makeJsonResponse(
      makeEmptyPayload(
        "Sem jogos ao vivo",
        liveResult.inplayOddsForbidden
          ? "Seu plano SportMonks parece sem acesso a live odds e nao houve pre-jogo com cotacoes"
          : "Nenhum jogo ao vivo ou proximo jogo com cotacoes disponiveis"
      )
    );
    return makeJsonResponse({
      games: upcomingGames,
      updatedAt: new Date().toISOString(),
      message: "Sem jogos ao vivo agora; mostrando proximos jogos com cotacoes",
      debug:
        "A The Odds API nao retornou partidas em andamento neste momento para as ligas configuradas",
    });
  } catch (error) {
    return makeJsonResponse(
      makeEmptyPayload("Sem jogos ao vivo", error?.message || "Falha inesperada")
