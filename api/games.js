const API_BASE = "https://api.the-odds-api.com/v4";
const API_KEY = process.env.ODDS_API_KEY || process.env.API_KEY || "";

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
  24,
  Math.min(60, Number.parseInt(process.env.ODDS_API_NEXT_LIMIT || "36", 10) || 36)
);
const LIVE_WINDOW_MINUTES = Math.max(
  60,
  Math.min(220, Number.parseInt(process.env.ODDS_API_LIVE_WINDOW_MINUTES || "170", 10) || 170)
);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const average = (values) => {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
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

  const parsed = Number.parseFloat(String(value).replace("%", "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
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
      "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
    },
  });

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch (_error) {
    return [];
  }
};

const fetchJson = async (path, query) => {
  const searchParams = new URLSearchParams(query);
  const response = await fetch(`${API_BASE}${path}?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error(`THE_ODDS_API_${response.status}`);
  }

  return safeJson(response);
};

const fetchOddsForSport = async (sportKey) =>
  fetchJson(`/sports/${sportKey}/odds`, {
    apiKey: API_KEY,
    regions: REGIONS,
    markets: MARKETS,
    oddsFormat: "decimal",
    dateFormat: "iso",
  });

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

const mapOutcomeKey = (name, homeTeam, awayTeam) => {
  const normalizedName = normalizeText(name);

  if (normalizedName === normalizeText(homeTeam)) {
    return "home";
  }

  if (normalizedName === normalizeText(awayTeam)) {
    return "away";
  }

  if (normalizedName === "draw" || normalizedName === "tie" || normalizedName === "empate" || normalizedName === "x") {
    return "draw";
  }

  return null;
};

const findScoreValue = (scores, teamName) => {
  const target = normalizeText(teamName);
  const row = (scores ?? []).find((entry) => normalizeText(entry?.name) === target);

  if (!row) {
    return null;
  }

  const rawValue = row.score ?? row.points ?? row.value ?? null;

  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return null;
  }

  const score = toNumber(rawValue);
  return Number.isFinite(score) ? score : null;
};

const buildScoresMap = (events) => {
  const map = new Map();

  for (const event of events ?? []) {
    const homeScore = findScoreValue(event?.scores, event?.home_team);
    const awayScore = findScoreValue(event?.scores, event?.away_team);
    const hasScores = homeScore !== null && awayScore !== null;

    map.set(event?.id, {
      completed: Boolean(event?.completed),
      hasScores,
      scoreLine: hasScores ? `${homeScore} x ${awayScore}` : null,
    });
  }

  return map;
};

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

  for (const bookmaker of event?.bookmakers ?? []) {
    const market =
      (bookmaker?.markets ?? []).find((item) => item?.key === MARKETS) ??
      (bookmaker?.markets ?? [])[0];

    if (!market || !Array.isArray(market.outcomes)) {
      continue;
    }

    const normalized = market.outcomes
      .map((outcome) => {
        const bucketKey = mapOutcomeKey(outcome?.name, event?.home_team, event?.away_team);
        const price = toNumber(outcome?.price);

        if (!bucketKey || price <= 1) {
          return null;
        }

        if (price > buckets[bucketKey].bestOdd) {
          buckets[bucketKey].bestOdd = price;
          buckets[bucketKey].bestBookmaker = bookmaker?.title || "bookmaker";
        }

        return {
          bucketKey,
          price,
        };
      })
      .filter(Boolean);

    if (normalized.length < 2) {
      continue;
    }

    const totalImplied = normalized.reduce((sum, item) => sum + 1 / item.price, 0);

    if (!(totalImplied > 0)) {
      continue;
    }

    for (const item of normalized) {
      buckets[item.bucketKey].probabilities.push((1 / item.price) / totalImplied);
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

const buildGameFromEvent = (event, scoreInfo) => {
  const market = aggregateOutcomes(event);

  if (!market) {
    return null;
  }

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
    id: event?.id,
    game: `${event?.home_team ?? "Time A"} x ${event?.away_team ?? "Time B"}`,
    league: event?.sport_title || event?.sport_key || "Football",
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
    scoreLine: isLive ? scoreInfo?.scoreLine || "Ao vivo" : "Pre-jogo",
    attacks: 0,
    dangerous: 0,
    shots: 0,
    corners: 0,
    possession: 0,
    pressure: 0,
    updatedAt: new Date().toISOString(),
    commenceTime,
    source: "The Odds API",
  };
};

const fetchAllGames = async () => {
  const games = [];
  const failures = [];

  for (const sportKey of SPORT_KEYS) {
    try {
      const oddsEvents = await fetchOddsForSport(sportKey);

      if (!Array.isArray(oddsEvents) || !oddsEvents.length) {
        continue;
      }

      const scoreEvents = await fetchScoresForSport(sportKey);
      const scoreMap = buildScoresMap(scoreEvents);

      games.push(
        ...oddsEvents
          .map((event) => buildGameFromEvent(event, scoreMap.get(event?.id)))
          .filter(Boolean)
      );
    } catch (error) {
      failures.push(`${sportKey}: ${error?.message || "falha"}`);
    }
  }

  return {
    games,
    failures,
  };
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

export async function GET(_request) {
  if (!API_KEY) {
    return makeJsonResponse(
      makeEmptyPayload(
        "Sem jogos ao vivo",
        "ODDS_API_KEY ausente no ambiente do servidor"
      )
    );
  }

  try {
    const upstream = await fetchAllGames();
    const games = sortGames(upstream.games);

    if (!games.length) {
      return makeJsonResponse(
        makeEmptyPayload(
          "Sem jogos ao vivo",
          upstream.failures.length
            ? `Nenhum evento retornado. Falhas: ${upstream.failures.join(" | ")}`
            : "Nenhum evento retornado pela The Odds API nas ligas configuradas"
        )
      );
    }

    const liveGames = games.filter((game) => game.isLive);
    const mainGames = games.slice(0, NEXT_LIMIT);

    return makeJsonResponse({
      games: mainGames,
      updatedAt: new Date().toISOString(),
      message: liveGames.length
        ? "ok"
        : "Sem jogos ao vivo agora; mostrando proximos jogos com cotacoes",
      debug: liveGames.length
        ? "Jogos ao vivo priorizados no topo. O restante do radar mostra as partidas mais fortes por probabilidade."
        : "A The Odds API nao retornou partidas em andamento neste momento para as ligas configuradas",
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
