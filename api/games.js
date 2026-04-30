const API_BASE = "https://v3.football.api-sports.io";
const API_KEY =
  process.env.API_KEY ||
  process.env.APISPORTS_KEY ||
  process.env.API_FOOTBALL_KEY ||
  "";

const WORLD_CUP_LEAGUE_ID = Number.parseInt(process.env.WORLD_CUP_LEAGUE_ID || "1", 10) || 1;
const WORLD_CUP_SEASON = Number.parseInt(process.env.WORLD_CUP_SEASON || "2026", 10) || 2026;
const WORLD_CUP_LIMIT = Math.max(
  48,
  Math.min(140, Number.parseInt(process.env.WORLD_CUP_LIMIT || "120", 10) || 120)
);

const LIVE_STATUSES = new Set(["1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE"]);
const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);

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

const makeJsonResponse = (payload, status = 200) =>
  Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "s-maxage=240, stale-while-revalidate=600",
    },
  });

const makeEmptyPayload = (message, debug = "") => ({
  games: [],
  updatedAt: new Date().toISOString(),
  message,
  debug,
  tournament: {
    id: WORLD_CUP_LEAGUE_ID,
    season: WORLD_CUP_SEASON,
    name: "FIFA World Cup 2026",
  },
});

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch (_error) {
    return { response: [], errors: {} };
  }
};

const humanizeApiError = (message) => {
  const text = String(message ?? "");

  if (text.includes("REQUESTS")) {
    return "Limite diario da API-Football atingido no plano atual";
  }

  if (text.includes("PLAN")) {
    return "Seu plano atual da API-Football nao cobre esse endpoint";
  }

  return text || "Falha inesperada na API-Football";
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
  const errors = Object.entries(payload?.errors ?? {}).filter(([, value]) => Boolean(value));

  if (errors.length) {
    const [type, message] = errors[0];
    throw new Error(`API_FOOTBALL_${String(type).toUpperCase()}: ${message}`);
  }

  return Array.isArray(payload?.response) ? payload.response : [];
};

const stableSeed = (input) => {
  let hash = 2166136261;
  const text = String(input ?? "");

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash >>> 0) / 4294967295;
};

const mapOutcomeKey = (label, homeName, awayName) => {
  const normalized = normalizeText(label);

  if (normalized === "1" || normalized === "home" || normalized === normalizeText(homeName)) {
    return "home";
  }

  if (normalized === "2" || normalized === "away" || normalized === normalizeText(awayName)) {
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

const createOption = ({ key, code, label, probability, odd, bookmaker, source }) => ({
  key,
  code,
  label,
  probability: clamp(probability, 0.03, 0.94),
  odd: odd > 1 ? odd : probability > 0 ? 1 / probability : 0,
  bookmaker: bookmaker || "Modelo Bubles",
  source,
});

const normalizeOptions = (options) => {
  const total = options.reduce((sum, option) => sum + option.probability, 0);

  if (!(total > 0)) {
    return options;
  }

  return options.map((option) => ({
    ...option,
    probability: option.probability / total,
    odd: option.odd > 1 ? option.odd : total / option.probability,
  }));
};

const buildMarketFromOptions = (options, bookmakerName = "bookmaker") => {
  const sorted = [...options].sort((left, right) => right.probability - left.probability);
  const selected = sorted[0];
  const second = sorted[1];
  const probability = clamp(selected?.probability || 0, 0.03, 0.94);
  const odd = selected?.odd > 1 ? selected.odd : probability > 0 ? 1 / probability : 0;
  const fairOdd = probability > 0 ? 1 / probability : 0;

  return {
    pickCode: selected?.code || "1",
    pickLabel: selected?.label || "Favorito",
    bestBookmaker: selected?.bookmaker || bookmakerName,
    odd,
    probability,
    fairOdd,
    marketEdge: odd - fairOdd,
    ev: probability * odd - 1,
    leaderGap: Math.max(0, probability - (second?.probability || 0)),
    confidence: selected?.source === "odds" ? "odds" : "estimate",
    marketOptions: sorted.map((option) => ({
      code: option.code,
      label: option.label,
      probability: option.probability,
      odd: option.odd,
      bookmaker: option.bookmaker || bookmakerName,
      source: option.source,
    })),
  };
};

const buildFallbackMarket = (fixture) => {
  const homeName = fixture?.teams?.home?.name || "Mandante";
  const awayName = fixture?.teams?.away?.name || "Visitante";
  const seed = stableSeed(`${fixture?.fixture?.id}-${homeName}-${awayName}`);
  const lean = (seed - 0.5) * 0.16;
  const draw = 0.27 + (stableSeed(`${fixture?.fixture?.id}-draw`) - 0.5) * 0.04;
  const home = 0.365 + lean;
  const away = 1 - draw - home;

  return buildMarketFromOptions(
    normalizeOptions([
      createOption({ key: "home", code: "1", label: homeName, probability: home, source: "estimate" }),
      createOption({ key: "draw", code: "X", label: "Empate", probability: draw, source: "estimate" }),
      createOption({ key: "away", code: "2", label: awayName, probability: away, source: "estimate" }),
    ]),
    "Modelo Bubles"
  );
};

const buildMarketFromBookmakers = (entry) => {
  const homeName = entry?.teams?.home?.name || "";
  const awayName = entry?.teams?.away?.name || "";
  const buckets = {
    home: { key: "home", code: "1", label: homeName, probabilities: [], bestOdd: 0, bookmaker: "" },
    draw: { key: "draw", code: "X", label: "Empate", probabilities: [], bestOdd: 0, bookmaker: "" },
    away: { key: "away", code: "2", label: awayName, probabilities: [], bestOdd: 0, bookmaker: "" },
  };

  for (const bookmaker of entry?.bookmakers ?? []) {
    const bet = getMatchWinnerBet(bookmaker);

    if (!bet || !Array.isArray(bet.values)) {
      continue;
    }

    const values = bet.values
      .map((value) => {
        const key = mapOutcomeKey(value?.value, homeName, awayName);
        const odd = toNumber(value?.odd);

        if (!key || odd <= 1) {
          return null;
        }

        if (odd > buckets[key].bestOdd) {
          buckets[key].bestOdd = odd;
          buckets[key].bookmaker = bookmaker?.name || "bookmaker";
        }

        return { key, odd };
      })
      .filter(Boolean);

    if (values.length < 2) {
      continue;
    }

    const totalImplied = values.reduce((sum, value) => sum + 1 / value.odd, 0);

    if (!(totalImplied > 0)) {
      continue;
    }

    for (const value of values) {
      buckets[value.key].probabilities.push((1 / value.odd) / totalImplied);
    }
  }

  const options = Object.values(buckets)
    .map((bucket) =>
      createOption({
        key: bucket.key,
        code: bucket.code,
        label: bucket.label,
        probability: average(bucket.probabilities),
        odd: bucket.bestOdd,
        bookmaker: bucket.bookmaker,
        source: "odds",
      })
    )
    .filter((option) => option.probability > 0 && option.odd > 1);

  if (options.length < 2) {
    return null;
  }

  return buildMarketFromOptions(options);
};

const buildOddsMap = (oddsEntries) => {
  const map = new Map();

  for (const entry of oddsEntries ?? []) {
    const fixtureId = entry?.fixture?.id;
    const market = buildMarketFromBookmakers(entry);

    if (fixtureId && market) {
      map.set(fixtureId, market);
    }
  }

  return map;
};

const getScoreLine = (fixture) => {
  const home = fixture?.goals?.home;
  const away = fixture?.goals?.away;

  if (home === null || home === undefined || away === null || away === undefined) {
    return "Pre-jogo";
  }

  return `${home} x ${away}`;
};

const getStage = (fixture) => {
  const round = normalizeText(fixture?.league?.round);

  if (round.includes("group")) {
    return "groups";
  }

  if (round.includes("final") || round.includes("round") || round.includes("semi") || round.includes("third")) {
    return "knockout";
  }

  return "worldcup";
};

const buildGame = (fixture, oddsMarket) => {
  const fixtureId = fixture?.fixture?.id;
  const homeName = fixture?.teams?.home?.name || "A definir";
  const awayName = fixture?.teams?.away?.name || "A definir";
  const statusShort = fixture?.fixture?.status?.short || "NS";
  const isLive = LIVE_STATUSES.has(statusShort);
  const isFinished = FINISHED_STATUSES.has(statusShort);
  const market = oddsMarket || buildFallbackMarket(fixture);
  const minute = isLive ? clamp(toNumber(fixture?.fixture?.status?.elapsed), 1, 130) : 0;

  return {
    id: fixtureId,
    game: `${homeName} x ${awayName}`,
    homeTeam: homeName,
    awayTeam: awayName,
    league: fixture?.league?.name || "FIFA World Cup",
    country: fixture?.league?.country || "World",
    round: fixture?.league?.round || "Copa do Mundo 2026",
    stage: getStage(fixture),
    venue: fixture?.fixture?.venue?.name || "",
    city: fixture?.fixture?.venue?.city || "",
    minute,
    minuteLabel: isLive ? "ao vivo" : isFinished ? "encerrado" : "pre",
    ev: market.ev,
    oddHome: market.odd,
    probability: market.probability,
    marketProbability: market.probability,
    fairOdd: market.fairOdd,
    marketEdge: market.marketEdge,
    bestBookmaker: market.bestBookmaker,
    pickCode: market.pickCode,
    pickLabel: market.pickLabel,
    hasOdds: market.confidence === "odds",
    isPositiveEv: market.ev > 0,
    isLive,
    isFinished,
    bubbleValue: market.probability,
    scoreLine: getScoreLine(fixture),
    updatedAt: new Date().toISOString(),
    commenceTime: fixture?.fixture?.date || null,
    statusShort,
    source: "API-Football",
    confidence: market.confidence,
    leaderGap: market.leaderGap,
    marketOptions: market.marketOptions,
  };
};

const sortGames = (games) =>
  [...games].sort((left, right) => {
    if (Number(right.isLive) !== Number(left.isLive)) {
      return Number(right.isLive) - Number(left.isLive);
    }

    if (new Date(left.commenceTime || 0).getTime() !== new Date(right.commenceTime || 0).getTime()) {
      return new Date(left.commenceTime || 0).getTime() - new Date(right.commenceTime || 0).getTime();
    }

    return (right.bubbleValue || 0) - (left.bubbleValue || 0);
  });

const fetchWorldCupOdds = async () => {
  try {
    const oddsEntries = await fetchFromApi(`/odds?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}`);
    return buildOddsMap(oddsEntries);
  } catch (_error) {
    return new Map();
  }
};

const fetchWorldCupGames = async () => {
  const [fixtures, oddsMap] = await Promise.all([
    fetchFromApi(`/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}`),
    fetchWorldCupOdds(),
  ]);

  return sortGames(
    fixtures
      .slice(0, WORLD_CUP_LIMIT)
      .map((fixture) => buildGame(fixture, oddsMap.get(fixture?.fixture?.id)))
      .filter((game) => game?.id)
  );
};

export async function GET(_request) {
  if (!API_KEY) {
    return makeJsonResponse(
      makeEmptyPayload("API_KEY ausente", "Configure API_KEY no ambiente do servidor")
    );
  }

  try {
    const games = await fetchWorldCupGames();
    const oddsCount = games.filter((game) => game.hasOdds).length;
    const liveCount = games.filter((game) => game.isLive).length;

    if (!games.length) {
      return makeJsonResponse(
        makeEmptyPayload(
          "Sem jogos da Copa 2026",
          `Nenhuma fixture retornada para league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}`
        )
      );
    }

    return makeJsonResponse({
      games,
      updatedAt: new Date().toISOString(),
      message: liveCount ? "Jogos ao vivo da Copa 2026 no radar" : "Calendario da Copa 2026 carregado",
      debug: `${games.length} jogos da Copa 2026 carregados. ${oddsCount} com odds oficiais; os demais usam estimativa visual ate odds/previsoes ficarem disponiveis.`,
      tournament: {
        id: WORLD_CUP_LEAGUE_ID,
        season: WORLD_CUP_SEASON,
        name: "FIFA World Cup 2026",
      },
    });
  } catch (error) {
    return makeJsonResponse(
      makeEmptyPayload("Falha ao carregar Copa 2026", humanizeApiError(error?.message))
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
