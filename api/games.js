const API_BASE = "https://v3.football.api-sports.io";
const API_KEY =
const API_BASE = "https://api.sportmonks.com/v3/football";
const API_TOKEN =
  process.env.SPORTMONKS_API_TOKEN ||
  process.env.API_TOKEN ||
  process.env.API_KEY ||
  process.env.APISPORTS_KEY ||
  process.env.API_FOOTBALL_KEY ||
  "";

const MATCH_WINNER_MARKET_ID = Number.parseInt(
  process.env.SPORTMONKS_MARKET_ID || "1",
  10
) || 1;

const NEXT_LIMIT = Math.max(
  1,
  Math.min(12, Number.parseInt(process.env.API_FOOTBALL_NEXT_LIMIT || "8", 10) || 8)
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
  Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "s-maxage=20, stale-while-revalidate=40",
      "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
    },
  });

  try {
    return await response.json();
  } catch (_error) {
    return { response: [] };
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

const fetchFromApi = async (path) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "x-apisports-key": API_KEY,
    },
const fetchFromSportMonks = async (path, params = {}) => {
  const searchParams = new URLSearchParams({
    ...params,
    api_token: API_TOKEN,
  });

  const response = await fetch(`${API_BASE}${path}?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error(`API_FOOTBALL_${response.status}`);
    const error = new Error(await extractErrorMessage(response));
    error.status = response.status;
    throw error;
  }

  const payload = await safeJson(response);
  return Array.isArray(payload.response) ? payload.response : [];
};
  const data = payload?.data;

const getStatistic = (statistics, aliases) => {
  const wanted = aliases.map(normalizeText);
  if (Array.isArray(data)) {
    return data;
  }

  for (const entry of statistics ?? []) {
    if (wanted.includes(normalizeText(entry?.type))) {
      return toNumber(entry?.value);
    }
  if (data && typeof data === "object") {
    return [data];
  }

  return 0;
  return [];
};

const extractHomeStats = (statisticsResponse, homeTeamId) => {
  const homeEntry =
    statisticsResponse.find((entry) => entry?.team?.id === homeTeamId) ?? statisticsResponse[0];
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

  const stats = homeEntry?.statistics ?? [];
const getStatisticValue = (statistics, location, typeId) => {
  const entry = (statistics ?? []).find(
    (item) =>
      normalizeText(item?.location) === normalizeText(location) &&
      toNumber(item?.type_id) === typeId
  );

  return {
    attacks: getStatistic(stats, ["Attacks", "Total Attacks"]),
    dangerous: getStatistic(stats, ["Dangerous Attacks", "Dangerous attacks"]),
    shots: getStatistic(stats, ["Total Shots", "Shots on Goal"]),
    corners: getStatistic(stats, ["Corner Kicks", "Corners"]),
    possession: getStatistic(stats, ["Ball Possession", "Possession"]),
  };
  return toNumber(entry?.data?.value);
};

const summarizeOddsEntries = (oddsEntries, homeName) => {
  const normalizedHome = normalizeText(homeName);
  const bookmakerRows = [];
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

  for (const item of oddsEntries ?? []) {
    for (const bookmaker of item?.bookmakers ?? []) {
      for (const bet of bookmaker?.bets ?? []) {
        const betName = normalizeText(bet?.name);
        const isMatchWinner =
          betName.includes("match winner") || betName === "winner" || betName === "1x2";
  for (const row of filteredRows) {
    const bookmakerId = row?.bookmaker_id ?? "unknown";

        if (!isMatchWinner) {
          continue;
        }
    if (!grouped.has(bookmakerId)) {
      grouped.set(bookmakerId, []);
    }

        const outcomes = (bet?.values ?? [])
          .map((value) => ({
            label: normalizeText(value?.value ?? value?.label),
            odd: toNumber(value?.odd),
          }))
          .filter((value) => value.odd > 1);
    grouped.get(bookmakerId).push(row);
  }

        if (outcomes.length < 2) {
          continue;
        }
  const bookmakerSummaries = [];

        const homeOutcome =
          outcomes.find((value) => value.label === "home") ||
          outcomes.find((value) => value.label === "1") ||
          outcomes.find((value) => value.label === normalizedHome);
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

        if (!homeOutcome) {
          continue;
        }
    if (outcomes.length < 2) {
      continue;
    }

        const totalImplied = outcomes.reduce((sum, value) => sum + 1 / value.odd, 0);
    const homeOutcome =
      outcomes.find((row) => row.label === "1") ||
      outcomes.find((row) => row.label === "home") ||
      outcomes.find((row) => row.name === normalizeText(homeTeamName));

        if (!(totalImplied > 0)) {
          continue;
        }
    if (!homeOutcome) {
      continue;
    }

        bookmakerRows.push({
          bookmaker: bookmaker?.name ?? bookmaker?.title ?? bookmaker?.id ?? "bookmaker",
          homeOdd: homeOutcome.odd,
          homeProbability: (1 / homeOutcome.odd) / totalImplied,
          lastUpdate: item?.update ?? bookmaker?.update ?? null,
        });
    const totalImplied = outcomes.reduce((sum, row) => sum + 1 / row.odd, 0);

        break;
      }
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

  if (!bookmakerRows.length) {
  if (!bookmakerSummaries.length) {
    return null;
  }

  const bestEntry = bookmakerRows.reduce((best, current) =>
  const bestEntry = bookmakerSummaries.reduce((best, current) =>
    current.homeOdd > best.homeOdd ? current : best
  );

  const consensusProbability = average(
    bookmakerRows.map((entry) => entry.homeProbability)
    bookmakerSummaries.map((entry) => entry.probability)
  );

  if (!(bestEntry.homeOdd > 1) || !(consensusProbability > 0)) {
  if (!(consensusProbability > 0)) {
    return null;
  }

  const fairOdd = 1 / consensusProbability;

  return {
    bestBookmaker: bestEntry.bookmaker,
    oddHome: bestEntry.homeOdd,
    consensusProbability,
    fairOdd,
    marketEdge: bestEntry.homeOdd - fairOdd,
    bookmakersCount: bookmakerRows.length,
    updatedAt: bestEntry.lastUpdate,
    probability: consensusProbability,
    fairOdd: 1 / consensusProbability,
    marketEdge: bestEntry.homeOdd - 1 / consensusProbability,
    updatedAt: bestEntry.updatedAt,
  };
};

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

  return map;
};

const calculateLiveEv = ({ attacks, dangerous, shots, corners, possession, minute, oddHome }) => {
  const pressure =
    attacks * 0.03 +
  };
};

const buildLiveGame = (fixture, stats, oddsSummary) => {
const buildLiveGame = (fixture, oddsSummary) => {
  if (!fixture || !oddsSummary) {
    return null;
  }

  const fixtureId = fixture?.fixture?.id;
  const minute = toNumber(fixture?.fixture?.status?.elapsed);
  const homeName = fixture?.teams?.home?.name ?? "";
  const awayName = fixture?.teams?.away?.name ?? "";
  const leagueName = fixture?.league?.name ?? "";
  const homeGoals = toNumber(fixture?.goals?.home);
  const awayGoals = toNumber(fixture?.goals?.away);
  const homeParticipant = getParticipantByLocation(fixture?.participants, "home");
  const awayParticipant = getParticipantByLocation(fixture?.participants, "away");

  if (!fixtureId || !homeName || !awayName || !(oddsSummary.oddHome > 1)) {
  if (!homeParticipant || !awayParticipant) {
    return null;
  }

  const stats = extractHomeStats(fixture);
  const minute = toNumber(fixture?.time?.minute);
  const { pressure, probability, ev } = calculateLiveEv({
    ...stats,
    minute,
  });

  return {
    id: fixtureId,
    game: `${homeName} x ${awayName}`,
    league: leagueName,
    id: fixture.id,
    game: `${homeParticipant.name} x ${awayParticipant.name}`,
    league: fixture?.league?.name || fixture?.league_id || "Football",
    minute,
    minuteLabel: "ao vivo",
    ev,
    bestBookmaker: oddsSummary.bestBookmaker,
    isPositiveEv: ev > 0,
    isLive: true,
    scoreLine: `${homeGoals} x ${awayGoals}`,
    scoreLine: `${getCurrentScore(fixture?.scores, "home")} x ${getCurrentScore(
      fixture?.scores,
      "away"
    )}`,
    attacks: stats.attacks,
    dangerous: stats.dangerous,
    shots: stats.shots,
    possession: stats.possession,
    pressure,
    updatedAt: oddsSummary.updatedAt,
    commenceTime: fixture?.fixture?.date ?? null,
    source: "API-Football",
    commenceTime: fixture?.starting_at || null,
    source: "SportMonks",
  };
};

    return null;
  }

  const fixtureId = fixture?.fixture?.id;
  const homeName = fixture?.teams?.home?.name ?? "";
  const awayName = fixture?.teams?.away?.name ?? "";
  const leagueName = fixture?.league?.name ?? "";
  const probability = oddsSummary.consensusProbability;
  const ev = probability * oddsSummary.oddHome - 1;
  const homeParticipant = getParticipantByLocation(fixture?.participants, "home");
  const awayParticipant = getParticipantByLocation(fixture?.participants, "away");

  if (!fixtureId || !homeName || !awayName || !(oddsSummary.oddHome > 1) || !(probability > 0)) {
  if (!homeParticipant || !awayParticipant) {
    return null;
  }

  const ev = oddsSummary.probability * oddsSummary.oddHome - 1;

  return {
    id: fixtureId,
    game: `${homeName} x ${awayName}`,
    league: leagueName,
    id: fixture.id,
    game: `${homeParticipant.name} x ${awayParticipant.name}`,
    league: fixture?.league?.name || fixture?.league_id || "Football",
    minute: 0,
    minuteLabel: "pre",
    ev,
    oddHome: oddsSummary.oddHome,
    probability,
    probability: oddsSummary.probability,
    fairOdd: oddsSummary.fairOdd,
    marketEdge: oddsSummary.marketEdge,
    bestBookmaker: oddsSummary.bestBookmaker,
    possession: 0,
    pressure: 0,
    updatedAt: oddsSummary.updatedAt,
    commenceTime: fixture?.fixture?.date ?? null,
    source: "API-Football",
    commenceTime: fixture?.starting_at || null,
    source: "SportMonks",
  };
};

const fetchLiveGames = async () => {
  const liveFixtures = await fetchFromApi("/fixtures?live=all");

  if (!liveFixtures.length) {
    return {
      games: [],
      fixturesCount: 0,
      oddsCount: 0,
    };
  }

  let liveOddsMap = new Map();

const fetchFixtureOddsSummary = async (fixtureId, homeTeamName, isLive) => {
  try {
    const liveOdds = await fetchFromApi("/odds/live");
    liveOddsMap = buildLiveOddsMap(liveOdds);
  } catch (_error) {
    liveOddsMap = new Map();
  }
    const liveOrPrePath = isLive
      ? `/odds/inplay/fixtures/${fixtureId}`
      : `/odds/pre-match/fixtures/${fixtureId}`;

  const statisticsResults = await Promise.allSettled(
    liveFixtures.map((fixture) => fetchFromApi(`/fixtures/statistics?fixture=${fixture.fixture.id}`))
  );
    const oddsRows = await fetchFromSportMonks(liveOrPrePath, {
      include: "bookmaker",
    });

  const statsMap = new Map();
    return groupOddsByBookmaker(oddsRows, homeTeamName);
  } catch (error) {
    if (isLive) {
      try {
        const preMatchRows = await fetchFromSportMonks(`/odds/pre-match/fixtures/${fixtureId}`, {
          include: "bookmaker",
        });

  statisticsResults.forEach((result, index) => {
    if (result.status !== "fulfilled") {
      return;
        return groupOddsByBookmaker(preMatchRows, homeTeamName);
      } catch (_fallbackError) {
        return null;
      }
    }

    const fixture = liveFixtures[index];
    const homeId = fixture?.teams?.home?.id;
    statsMap.set(fixture.fixture.id, extractHomeStats(result.value, homeId));
    return null;
  }
};

const fetchLiveGames = async () => {
  const liveFixtures = await fetchFromSportMonks("/livescores/inplay", {
    include: "participants;scores;statistics",
  });

  const oddsFallbackTargets = liveFixtures.filter((fixture) => !liveOddsMap.has(fixture?.fixture?.id));
  if (!liveFixtures.length) {
    return {
      fixturesCount: 0,
      games: [],
      inplayOddsForbidden: false,
    };
  }

  if (oddsFallbackTargets.length) {
    const oddsFallbackResults = await Promise.allSettled(
      oddsFallbackTargets.map((fixture) => fetchFromApi(`/odds?fixture=${fixture.fixture.id}`))
    );
  let inplayOddsForbidden = false;

    oddsFallbackResults.forEach((result, index) => {
      if (result.status !== "fulfilled") {
        return;
      }
  const oddsResults = await Promise.allSettled(
    liveFixtures.map(async (fixture) => {
      const homeParticipant = getParticipantByLocation(fixture?.participants, "home");

      const fixture = oddsFallbackTargets[index];
      const summary = summarizeOddsEntries(result.value, fixture?.teams?.home?.name ?? "");

      if (summary) {
        liveOddsMap.set(fixture.fixture.id, summary);
      try {
        return await fetchFixtureOddsSummary(fixture.id, homeParticipant?.name ?? "", true);
      } catch (error) {
        if (error?.status === 403) {
          inplayOddsForbidden = true;
        }
        return null;
      }
    });
  }
    })
  );

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
    .map((fixture, index) => {
      const oddsSummary =
        oddsResults[index]?.status === "fulfilled" ? oddsResults[index].value : null;
      return buildLiveGame(fixture, oddsSummary);
    })
    .filter(Boolean)
    .sort((left, right) => right.ev - left.ev);

  return {
    fixturesCount: liveFixtures.length,
    games,
    fixturesCount: liveFixtures.length,
    oddsCount: liveOddsMap.size,
    inplayOddsForbidden,
  };
};

const fetchUpcomingGames = async () => {
  const upcomingFixtures = await fetchFromApi(`/fixtures?next=${NEXT_LIMIT}`);
  const upcomingFixtures = await fetchFromSportMonks(
    `/fixtures/upcoming/markets/${MATCH_WINNER_MARKET_ID}`,
    {
      include: "participants",
      per_page: String(NEXT_LIMIT),
      order: "asc",
    }
  );

  if (!upcomingFixtures.length) {
    return [];
  }

  const oddsResults = await Promise.allSettled(
    upcomingFixtures.map((fixture) => fetchFromApi(`/odds?fixture=${fixture.fixture.id}`))
    upcomingFixtures.map(async (fixture) => {
      const homeParticipant = getParticipantByLocation(fixture?.participants, "home");
      return await fetchFixtureOddsSummary(fixture.id, homeParticipant?.name ?? "", false);
    })
  );

  return upcomingFixtures
    .map((fixture, index) => {
      const oddsResult = oddsResults[index];

      if (oddsResult.status !== "fulfilled") {
        return null;
      }

      const summary = summarizeOddsEntries(oddsResult.value, fixture?.teams?.home?.name ?? "");
      return buildUpcomingGame(fixture, summary);
      const oddsSummary =
        oddsResults[index]?.status === "fulfilled" ? oddsResults[index].value : null;
      return buildUpcomingGame(fixture, oddsSummary);
    })
    .filter(Boolean)
    .sort((left, right) => right.ev - left.ev);
};

export async function GET(_request) {
  if (!API_KEY) {
  if (!API_TOKEN) {
    return makeJsonResponse(
      makeEmptyPayload(
        "Sem jogos ao vivo",
        "API_KEY ausente no ambiente do servidor"
        "SPORTMONKS_API_TOKEN ausente no ambiente do servidor"
      )
    );
  }
        message: "ok",
        debug:
          liveResult.fixturesCount > liveResult.games.length
            ? "Alguns jogos ao vivo ficaram sem odds compativeis"
            ? "Alguns jogos ao vivo ficaram sem odds compativeis ou sem estatisticas suficientes"
            : "",
      });
    }
      return makeJsonResponse({
        games: upcomingGames,
        updatedAt: new Date().toISOString(),
        message: "Sem jogos ao vivo agora; mostrando proximos jogos com odds",
        debug:
          liveResult.fixturesCount > 0
            ? "Ha jogos ao vivo, mas sem odds ou estatisticas suficientes para montar o radar"
            : "Sem jogos ao vivo no momento; exibindo proximos jogos com odds",
        message: "Sem jogos ao vivo agora; mostrando proximos jogos com cotacoes",
        debug: liveResult.inplayOddsForbidden
          ? "Seu plano SportMonks parece sem acesso a live odds; exibindo cotacoes pre-jogo"
          : "Sem jogos ao vivo no momento; exibindo proximos jogos com cotacoes",
      });
    }

    return makeJsonResponse(
      makeEmptyPayload(
        "Sem jogos ao vivo",
        liveResult.fixturesCount > 0
          ? "Ha jogos ao vivo, mas sem odds disponiveis ou sem dados suficientes"
          : "Nenhum jogo ao vivo ou proximo jogo com odds disponiveis"
        liveResult.inplayOddsForbidden
          ? "Seu plano SportMonks parece sem acesso a live odds e nao houve pre-jogo com cotacoes"
          : "Nenhum jogo ao vivo ou proximo jogo com cotacoes disponiveis"
      )
    );
  } catch (error) {
