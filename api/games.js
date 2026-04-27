const API_BASE = "https://api.sportmonks.com/v3/football";
const API_TOKEN =
  process.env.SPORTMONKS_API_TOKEN ||
  process.env.API_TOKEN ||
  process.env.API_KEY ||
  "";

const MATCH_WINNER_MARKET_ID = Number.parseInt(
  process.env.SPORTMONKS_MARKET_ID || "1",
  10
) || 1;

const NEXT_LIMIT = Math.max(
  1,
  Math.min(12, Number.parseInt(process.env.SPORTMONKS_NEXT_LIMIT || "8", 10) || 8)
);

const STAT_TYPES = {
  corners: 34,
  shots: 42,
  attacks: 43,
  dangerous: 44,
  possession: 45,
};

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

  const parsed = parseFloat(String(value).replace("%", "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

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
  message: reason,
  debug,
});

const makeJsonResponse = (payload, status = 200) =>
  Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
    },
  });

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch (_error) {
    return { data: [] };
  }
};

const extractErrorMessage = async (response) => {
  const payload = await safeJson(response);

  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message.trim();
  }

  if (typeof payload?.error === "string" && payload.error.trim()) {
    return payload.error.trim();
  }

  return `SPORTMONKS_${response.status}`;
};

const fetchFromSportMonks = async (path, params = {}) => {
  const searchParams = new URLSearchParams({
    ...params,
    api_token: API_TOKEN,
  });

  const response = await fetch(`${API_BASE}${path}?${searchParams.toString()}`);

  if (!response.ok) {
    const error = new Error(await extractErrorMessage(response));
    error.status = response.status;
    throw error;
  }

  const payload = await safeJson(response);
  const data = payload?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object") {
    return [data];
  }

  return [];
};

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
};

const getStatisticValue = (statistics, location, typeId) => {
  const entry = (statistics ?? []).find(
    (item) =>
      normalizeText(item?.location) === normalizeText(location) &&
      toNumber(item?.type_id) === typeId
  );

  return toNumber(entry?.data?.value);
};

const extractHomeStats = (fixture) => ({
  corners: getStatisticValue(fixture?.statistics, "home", STAT_TYPES.corners),
  shots: getStatisticValue(fixture?.statistics, "home", STAT_TYPES.shots),
  attacks: getStatisticValue(fixture?.statistics, "home", STAT_TYPES.attacks),
  dangerous: getStatisticValue(fixture?.statistics, "home", STAT_TYPES.dangerous),
  possession: getStatisticValue(fixture?.statistics, "home", STAT_TYPES.possession),
});

const groupOddsByBookmaker = (oddsRows, homeTeamName) => {
  const filteredRows = (oddsRows ?? []).filter(
    (row) => toNumber(row?.market_id) === MATCH_WINNER_MARKET_ID
  );

  const grouped = new Map();

  for (const row of filteredRows) {
    const bookmakerId = row?.bookmaker_id ?? "unknown";

    if (!grouped.has(bookmakerId)) {
      grouped.set(bookmakerId, []);
    }

    grouped.get(bookmakerId).push(row);
  }

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

    if (outcomes.length < 2) {
      continue;
    }

    const homeOutcome =
      outcomes.find((row) => row.label === "1") ||
      outcomes.find((row) => row.label === "home") ||
      outcomes.find((row) => row.name === normalizeText(homeTeamName));

    if (!homeOutcome) {
      continue;
    }

    const totalImplied = outcomes.reduce((sum, row) => sum + 1 / row.odd, 0);

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
  }

  const bestEntry = bookmakerSummaries.reduce((best, current) =>
    current.homeOdd > best.homeOdd ? current : best
  );

  const consensusProbability = average(
    bookmakerSummaries.map((entry) => entry.probability)
  );

  if (!(consensusProbability > 0)) {
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

const calculateLiveSignal = ({ attacks, dangerous, shots, corners, possession, minute, oddHome }) => {
  const pressure =
    attacks * 0.03 +
    dangerous * 0.07 +
    shots * 0.06 +
    corners * 0.04 +
    possession * 0.01 +
    minute * 0.02;

  const probability = clamp(Math.min(0.85, pressure / 10), 0.12, 0.9);
  const ev = oddHome > 1 ? probability * oddHome - 1 : null;

  return {
    pressure,
    probability,
    ev,
  };
};

const buildLiveGame = (fixture, oddsSummary) => {
  if (!fixture) {
    return null;
  }

  const homeParticipant = getParticipantByLocation(fixture?.participants, "home");
  const awayParticipant = getParticipantByLocation(fixture?.participants, "away");

  if (!homeParticipant || !awayParticipant) {
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

  return {
    id: fixture.id,
    game: `${homeParticipant.name} x ${awayParticipant.name}`,
    league: fixture?.league?.name || fixture?.league_id || "Football",
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
  };
};

const fetchUpcomingGames = async () => {
  const upcomingFixtures = await fetchFromSportMonks(
    `/fixtures/upcoming/markets/${MATCH_WINNER_MARKET_ID}`,
    {
      include: "participants;league",
      per_page: String(NEXT_LIMIT),
      order: "asc",
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

export async function GET(_request) {
  if (!API_TOKEN) {
    return makeJsonResponse(
      makeEmptyPayload(
        "Sem jogos ao vivo",
        "SPORTMONKS_API_TOKEN ausente no ambiente do servidor"
      )
    );
  }

  try {
    const liveResult = await fetchLiveGames();

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
    }

    const upcomingGames = await fetchUpcomingGames();

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
