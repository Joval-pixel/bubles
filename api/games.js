const API_BASE = "https://v3.football.api-sports.io";
const API_KEY =
  process.env.API_KEY ||
  process.env.APISPORTS_KEY ||
  process.env.API_FOOTBALL_KEY ||
  "";

const NEXT_LIMIT = Math.max(
  24,
  Math.min(96, Number.parseInt(process.env.API_FOOTBALL_NEXT_LIMIT || "60", 10) || 60)
);

const UPCOMING_DAYS = Math.max(
  1,
  Math.min(3, Number.parseInt(process.env.API_FOOTBALL_UPCOMING_DAYS || "2", 10) || 2)
);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const normalizeText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const IMPORTANT_EXCLUSIONS = [
  "reserve",
  "reserves",
  "u17",
  "u18",
  "u19",
  "u20",
  "u21",
  "u23",
  "youth",
  "women",
  "femin",
  "feminino",
];

const toNumber = (value) => {
  if (value === null || value === undefined || value === "" || value === "null") {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number.parseFloat(String(value).replace("%", "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

const average = (values) => {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
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
      "Cache-Control": "s-maxage=900, stale-while-revalidate=1800",
    },
  });

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch (_error) {
    return { response: [] };
  }
};

let lastSuccessfulPayload = null;

const fetchFromApi = async (path) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "x-apisports-key": API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`API_FOOTBALL_${response.status}`);
  }

  const payload = await safeJson(response);

  const errors = Object.entries(payload?.errors ?? {}).filter(([, value]) => Boolean(value));

  if (errors.length) {
    const [type, message] = errors[0];
    throw new Error(`API_FOOTBALL_${String(type).toUpperCase()}: ${message}`);
  }

  return Array.isArray(payload?.response) ? payload.response : [];
};

const humanizeApiError = (message) => {
  const normalized = String(message ?? "");

  if (normalized.includes("API_FOOTBALL_REQUESTS")) {
    return "Limite diario da API-Football atingido no plano atual";
  }

  if (normalized.includes("API_FOOTBALL_PLAN")) {
    return "Seu plano atual da API-Football nao cobre essa faixa de datas";
  }

  return normalized || "Falha inesperada";
};

const isImportantFixture = (fixture) => {
  const haystack = normalizeText(
    [
      fixture?.league?.name,
      fixture?.league?.country,
      fixture?.teams?.home?.name,
      fixture?.teams?.away?.name,
    ]
      .filter(Boolean)
      .join(" ")
  );

  return !IMPORTANT_EXCLUSIONS.some((keyword) => haystack.includes(keyword));
};

const mapValueKey = (label, homeName, awayName) => {
  const normalized = normalizeText(label);

  if (
    normalized === "1" ||
    normalized === "home" ||
    normalized === normalizeText(homeName)
  ) {
    return "home";
  }

  if (
    normalized === "2" ||
    normalized === "away" ||
    normalized === normalizeText(awayName)
  ) {
    return "away";
  }

  if (normalized === "x" || normalized === "draw" || normalized === "tie" || normalized === "empate") {
    return "draw";
  }

  return null;
};

const getMatchWinnerBet = (bookmaker) => {
  const bets = bookmaker?.bets ?? [];

  return (
    bets.find((bet) => {
      const name = normalizeText(bet?.name);
      return name.includes("match winner") || name === "winner" || name === "1x2";
    }) ?? bets[0] ?? null
  );
};

const buildValuesSummary = (values, homeName, awayName, sourceLabel) => {
  const buckets = {
    home: {
      key: "home",
      code: "1",
      label: homeName,
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
      label: awayName,
      probabilities: [],
      bestOdd: 0,
      bestBookmaker: "",
    },
  };

  const normalizedValues = (values ?? [])
    .filter((value) => !value?.suspended)
    .map((value) => {
      const key = mapValueKey(value?.value, homeName, awayName);
      const odd = toNumber(value?.odd);

      if (!key || odd <= 1) {
        return null;
      }

      if (odd > buckets[key].bestOdd) {
        buckets[key].bestOdd = odd;
        buckets[key].bestBookmaker = sourceLabel;
      }

      return {
        key,
        odd,
      };
    })
    .filter(Boolean);

  if (normalizedValues.length < 2) {
    return null;
  }

  const totalImplied = normalizedValues.reduce((sum, item) => sum + 1 / item.odd, 0);

  if (!(totalImplied > 0)) {
    return null;
  }

  for (const item of normalizedValues) {
    buckets[item.key].probabilities.push((1 / item.odd) / totalImplied);
  }

  const available = Object.values(buckets)
    .map((bucket) => ({
      ...bucket,
      probability: average(bucket.probabilities),
    }))
    .filter((bucket) => bucket.bestOdd > 1 && bucket.probability > 0);

  if (!available.length) {
    return null;
  }

  const ordered = available.sort((left, right) => {
    if (right.probability !== left.probability) {
      return right.probability - left.probability;
    }

    return right.bestOdd - left.bestOdd;
  });

  const options = ordered.map((item) => {
    const probability = clamp(item.probability, 0.05, 0.95);
    const fairOdd = probability > 0 ? 1 / probability : 0;

    return {
      key: item.key,
      code: item.code,
      label: item.label,
      probability,
      odd: item.bestOdd,
      fairOdd,
      marketEdge: item.bestOdd - fairOdd,
      bookmaker: item.bestBookmaker,
    };
  });

  const selected = options[0];
  const probability = selected.probability;
  const fairOdd = probability > 0 ? 1 / probability : 0;
  const ev = probability * selected.odd - 1;

  return {
    pickCode: selected.code,
    pickLabel: selected.label,
    bestBookmaker: selected.bookmaker,
    odd: selected.odd,
    probability,
    fairOdd,
    marketEdge: selected.marketEdge,
    ev,
    options,
    leaderGap: Math.max(0, (options[0]?.probability ?? 0) - (options[1]?.probability ?? 0)),
  };
};

const buildMarketSummary = (bookmakers, homeName, awayName) => {
  const marketSummaries = (bookmakers ?? [])
    .map((bookmaker) => {
      const bet = getMatchWinnerBet(bookmaker);

      if (!bet || !Array.isArray(bet.values)) {
        return null;
      }

      return buildValuesSummary(
        bet.values,
        homeName,
        awayName,
        bookmaker?.name || "bookmaker"
      );
    })
    .filter(Boolean);

  if (!marketSummaries.length) {
    return null;
  }

  return marketSummaries.sort((left, right) => {
    if (right.probability !== left.probability) {
      return right.probability - left.probability;
    }

    return right.odd - left.odd;
  })[0];
};

const buildOddsMap = (entries, fixtureMap = new Map()) => {
  const map = new Map();

  for (const entry of entries ?? []) {
    const fixtureId = entry?.fixture?.id;
    const referenceFixture = fixtureMap.get(fixtureId);
    const homeName =
      referenceFixture?.teams?.home?.name ?? entry?.teams?.home?.name ?? "";
    const awayName =
      referenceFixture?.teams?.away?.name ?? entry?.teams?.away?.name ?? "";
    const market = buildMarketSummary(entry?.bookmakers ?? [], homeName, awayName);

    if (fixtureId && market) {
      map.set(fixtureId, market);
    }
  }

  return map;
};

const parseLiveMinuteCap = (marketName) => {
  const match = normalizeText(marketName).match(/^1x2 - (\d+) minutes$/);
  return match ? toNumber(match[1]) : null;
};

const countMappableValues = (values, homeName, awayName) =>
  (values ?? []).filter((value) => {
    const key = mapValueKey(value?.value, homeName, awayName);
    return key && toNumber(value?.odd) > 1 && !value?.suspended;
  }).length;

const selectLiveOddsMarket = (markets, homeName, awayName, minute, statusLong) => {
  const candidates = (markets ?? []).filter(
    (market) => countMappableValues(market?.values, homeName, awayName) >= 2
  );

  if (!candidates.length) {
    return null;
  }

  const normalizedStatus = normalizeText(statusLong);
  const fulltimeMarket = candidates.find((market) => {
    const name = normalizeText(market?.name);
    return name === "fulltime result" || name === "final score";
  });

  if (fulltimeMarket) {
    return fulltimeMarket;
  }

  const timedMarkets = candidates
    .map((market) => ({
      market,
      cap: parseLiveMinuteCap(market?.name),
    }))
    .filter((item) => item.cap > 0)
    .sort((left, right) => left.cap - right.cap);

  if (timedMarkets.length) {
    return (
      timedMarkets.find((item) => item.cap >= minute)?.market ??
      timedMarkets[timedMarkets.length - 1]?.market ??
      null
    );
  }

  if (minute <= 45) {
    const firstHalf = candidates.find(
      (market) => normalizeText(market?.name) === "1x2 (1st half)"
    );

    if (firstHalf) {
      return firstHalf;
    }
  }

  if (normalizedStatus.includes("penalty")) {
    const penaltyWinner = candidates.find((market) =>
      normalizeText(market?.name).includes("penalties shootout winner")
    );

    if (penaltyWinner) {
      return penaltyWinner;
    }
  }

  return candidates[0];
};

const buildLiveOddsMap = (entries, fixtureMap) => {
  const map = new Map();

  for (const entry of entries ?? []) {
    const fixtureId = entry?.fixture?.id;
    const referenceFixture = fixtureMap.get(fixtureId);

    if (!fixtureId || !referenceFixture) {
      continue;
    }

    const homeName = referenceFixture?.teams?.home?.name ?? "";
    const awayName = referenceFixture?.teams?.away?.name ?? "";
    const minute = toNumber(
      referenceFixture?.fixture?.status?.elapsed || entry?.fixture?.status?.elapsed
    );
    const selectedMarket = selectLiveOddsMarket(
      entry?.odds ?? [],
      homeName,
      awayName,
      minute,
      referenceFixture?.fixture?.status?.long || entry?.fixture?.status?.long || ""
    );

    if (!selectedMarket) {
      continue;
    }

    const market = buildValuesSummary(
      selectedMarket.values,
      homeName,
      awayName,
      selectedMarket.name || "Live market"
    );

    if (market) {
      map.set(fixtureId, market);
    }
  }

  return map;
};

const getScoreLine = (fixture) => {
  const home = toNumber(fixture?.goals?.home);
  const away = toNumber(fixture?.goals?.away);

  if (!Number.isFinite(home) || !Number.isFinite(away)) {
    return "Pre-jogo";
  }

  return `${home} x ${away}`;
};

const buildGame = (fixture, market, isLive) => {
  if (!fixture || !market) {
    return null;
  }

  const fixtureId = fixture?.fixture?.id;
  const homeName = fixture?.teams?.home?.name ?? "";
  const awayName = fixture?.teams?.away?.name ?? "";

  if (!fixtureId || !homeName || !awayName) {
    return null;
  }

  const minute = isLive ? clamp(toNumber(fixture?.fixture?.status?.elapsed), 1, 120) : 0;

  return {
    id: fixtureId,
    game: `${homeName} x ${awayName}`,
    homeTeam: homeName,
    awayTeam: awayName,
    league: fixture?.league?.name || "Football",
    minute,
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
    marketOptions: market.options ?? [],
    leaderGap: market.leaderGap ?? 0,
    hasOdds: market.odd > 1,
    isPositiveEv: market.ev > 0,
    isLive,
    bubbleValue: market.probability,
    scoreLine: isLive ? getScoreLine(fixture) : "Pre-jogo",
    attacks: 0,
    dangerous: 0,
    shots: 0,
    corners: 0,
    possession: 0,
    pressure: 0,
    updatedAt: new Date().toISOString(),
    commenceTime: fixture?.fixture?.date || null,
    source: "API-Football",
  };
};

const getIsoDate = (offset = 0) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

const sortGames = (games) =>
  [...games].sort((left, right) => {
    if (Number(right.isLive) !== Number(left.isLive)) {
      return Number(right.isLive) - Number(left.isLive);
    }

    if ((right.bubbleValue ?? 0) !== (left.bubbleValue ?? 0)) {
      return (right.bubbleValue ?? 0) - (left.bubbleValue ?? 0);
    }

    return (right.ev ?? -999) - (left.ev ?? -999);
  });

const fetchLiveGames = async () => {
  const liveFixtures = (await fetchFromApi("/fixtures?live=all")).filter(isImportantFixture);

  if (!liveFixtures.length) {
    return [];
  }

  const fixtureMap = new Map(
    liveFixtures.map((fixture) => [fixture?.fixture?.id, fixture]).filter((item) => item[0])
  );

  let liveOddsMap = new Map();

  try {
    const liveOdds = await fetchFromApi("/odds/live");
    liveOddsMap = buildLiveOddsMap(liveOdds, fixtureMap);
  } catch (_error) {
    liveOddsMap = new Map();
  }

  const liveWithoutOdds = liveFixtures.filter(
    (fixture) => !liveOddsMap.has(fixture?.fixture?.id)
  );

  if (liveWithoutOdds.length) {
    try {
      const fallbackOdds = await fetchFromApi(`/odds?date=${getIsoDate(0)}`);
      const fallbackOddsMap = buildOddsMap(fallbackOdds, fixtureMap);

      for (const fixture of liveWithoutOdds) {
        const fixtureId = fixture?.fixture?.id;

        if (fixtureId && fallbackOddsMap.has(fixtureId)) {
          liveOddsMap.set(fixtureId, fallbackOddsMap.get(fixtureId));
        }
      }
    } catch (_error) {
      // Keep the live map we already have.
    }
  }

  return liveFixtures
    .map((fixture) => buildGame(fixture, liveOddsMap.get(fixture?.fixture?.id), true))
    .filter(Boolean);
};

const fetchUpcomingGames = async () => {
  const dates = Array.from({ length: UPCOMING_DAYS }, (_item, index) => getIsoDate(index));
  const upcomingFixtures = [];

  for (const date of dates) {
    const fixtures = await fetchFromApi(`/fixtures?date=${date}`);

    upcomingFixtures.push(
      ...fixtures
        .filter((fixture) => normalizeText(fixture?.fixture?.status?.short) === "ns")
        .filter(isImportantFixture)
    );

    if (upcomingFixtures.length >= NEXT_LIMIT * 2) {
      break;
    }
  }

  if (!upcomingFixtures.length) {
    return [];
  }

  const fixtureMap = new Map(
    upcomingFixtures.map((fixture) => [fixture?.fixture?.id, fixture]).filter((item) => item[0])
  );

  const oddsEntries = [];

  for (const date of dates) {
    const odds = await fetchFromApi(`/odds?date=${date}`);
    oddsEntries.push(...odds);
  }

  const oddsMap = buildOddsMap(oddsEntries, fixtureMap);

  return upcomingFixtures
    .map((fixture) => buildGame(fixture, oddsMap.get(fixture?.fixture?.id), false))
    .filter(Boolean);
};

export async function GET(_request) {
  if (!API_KEY) {
    return makeJsonResponse(
      makeEmptyPayload("Sem jogos ao vivo", "API_KEY ausente no ambiente do servidor")
    );
  }

  try {
    const [liveGames, upcomingGames] = await Promise.all([
      fetchLiveGames(),
      fetchUpcomingGames(),
    ]);

    const merged = sortGames([...liveGames, ...upcomingGames]).slice(0, NEXT_LIMIT);

    if (!merged.length) {
      return makeJsonResponse(
        makeEmptyPayload(
          "Sem jogos ao vivo",
          "Nenhum jogo com odds disponiveis retornado pela API-Football"
        )
      );
    }

    const payload = {
      games: merged,
      updatedAt: new Date().toISOString(),
      message: liveGames.length
        ? "ok"
        : "Sem jogos ao vivo agora; mostrando proximos jogos com cotacoes",
      debug: liveGames.length
        ? "Jogos ao vivo priorizados no topo. O restante do radar mostra os jogos mais fortes por probabilidade."
        : "A API-Football nao retornou partidas em andamento neste momento para as ligas cobertas, entao o radar caiu para pre-jogo.",
    };

    lastSuccessfulPayload = payload;

    return makeJsonResponse(payload);
  } catch (error) {
    if (lastSuccessfulPayload) {
      return makeJsonResponse({
        ...lastSuccessfulPayload,
        updatedAt: new Date().toISOString(),
        debug: `${lastSuccessfulPayload.debug} | Cache mantido porque a API respondeu: ${humanizeApiError(error?.message)}`,
      });
    }

    return makeJsonResponse(
      makeEmptyPayload("Sem jogos ao vivo", humanizeApiError(error?.message))
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
