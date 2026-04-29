const API_BASE = "https://v3.football.api-sports.io";
const API_KEY =
  process.env.API_KEY ||
  process.env.APISPORTS_KEY ||
  process.env.API_FOOTBALL_KEY ||
  "";

const NEXT_LIMIT = Math.max(
  18,
  Math.min(48, Number.parseInt(process.env.API_FOOTBALL_NEXT_LIMIT || "24", 10) || 24)
);

const UPCOMING_DAYS = Math.max(
  1,
  Math.min(4, Number.parseInt(process.env.API_FOOTBALL_UPCOMING_DAYS || "3", 10) || 3)
);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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
      "Cache-Control": "s-maxage=120, stale-while-revalidate=240",
    },
  });

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch (_error) {
    return { response: [] };
  }
};

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
  return Array.isArray(payload?.response) ? payload.response : [];
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

const buildMarketSummary = (bookmakers, homeName, awayName) => {
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

  for (const bookmaker of bookmakers ?? []) {
    const bet = getMatchWinnerBet(bookmaker);

    if (!bet || !Array.isArray(bet.values)) {
      continue;
    }

    const normalizedValues = bet.values
      .map((value) => {
        const key = mapValueKey(value?.value, homeName, awayName);
        const odd = toNumber(value?.odd);

        if (!key || odd <= 1) {
          return null;
        }

        if (odd > buckets[key].bestOdd) {
          buckets[key].bestOdd = odd;
          buckets[key].bestBookmaker = bookmaker?.name || "bookmaker";
        }

        return {
          key,
          odd,
        };
      })
      .filter(Boolean);

    if (normalizedValues.length < 2) {
      continue;
    }

    const totalImplied = normalizedValues.reduce((sum, item) => sum + 1 / item.odd, 0);

    if (!(totalImplied > 0)) {
      continue;
    }

    for (const item of normalizedValues) {
      buckets[item.key].probabilities.push((1 / item.odd) / totalImplied);
    }
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

  const selected = available.sort((left, right) => {
    if (right.probability !== left.probability) {
      return right.probability - left.probability;
    }

    return right.bestOdd - left.bestOdd;
  })[0];

  const probability = clamp(selected.probability, 0.05, 0.95);
  const fairOdd = probability > 0 ? 1 / probability : 0;
  const ev = probability * selected.bestOdd - 1;

  return {
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

const buildOddsMap = (entries) => {
  const map = new Map();

  for (const entry of entries ?? []) {
    const fixtureId = entry?.fixture?.id;
    const homeName = entry?.teams?.home?.name ?? "";
    const awayName = entry?.teams?.away?.name ?? "";
    const market = buildMarketSummary(entry?.bookmakers ?? [], homeName, awayName);

    if (fixtureId && market) {
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
  const liveFixtures = await fetchFromApi("/fixtures?live=all");

  if (!liveFixtures.length) {
    return [];
  }

  let liveOddsMap = new Map();

  try {
    const liveOdds = await fetchFromApi("/odds/live");
    liveOddsMap = buildOddsMap(liveOdds);
  } catch (_error) {
    liveOddsMap = new Map();
  }

  return liveFixtures
    .map((fixture) => buildGame(fixture, liveOddsMap.get(fixture?.fixture?.id), true))
    .filter(Boolean);
};

const fetchUpcomingGames = async () => {
  const fixtureResponses = await Promise.allSettled(
    Array.from({ length: UPCOMING_DAYS }, (_item, index) =>
      fetchFromApi(`/fixtures?date=${getIsoDate(index)}`)
    )
  );

  const upcomingFixtures = fixtureResponses
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value)
    .filter((fixture) => normalizeText(fixture?.fixture?.status?.short) === "ns")
    .slice(0, NEXT_LIMIT * 2);

  if (!upcomingFixtures.length) {
    return [];
  }

  const oddsResponses = await Promise.allSettled(
    Array.from({ length: UPCOMING_DAYS }, (_item, index) =>
      fetchFromApi(`/odds?date=${getIsoDate(index)}`)
    )
  );

  const oddsMap = buildOddsMap(
    oddsResponses
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value)
  );

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

    return makeJsonResponse({
      games: merged,
      updatedAt: new Date().toISOString(),
      message: liveGames.length
        ? "ok"
        : "Sem jogos ao vivo agora; mostrando proximos jogos com cotacoes",
      debug: liveGames.length
        ? "Jogos ao vivo priorizados no topo. O restante do radar mostra os jogos mais fortes por probabilidade."
        : "A API-Football nao retornou partidas em andamento neste momento para as ligas cobertas, entao o radar caiu para pre-jogo.",
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
