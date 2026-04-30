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
const TODAY_LIMIT = Math.max(
  24,
  Math.min(1000, Number.parseInt(process.env.TODAY_LIMIT || "500", 10) || 500)
);
const MARKETS_PER_GAME_LIMIT = Math.max(
  12,
  Math.min(120, Number.parseInt(process.env.MARKETS_PER_GAME_LIMIT || "80", 10) || 80)
);
const OPTIONS_PER_MARKET_LIMIT = Math.max(
  4,
  Math.min(30, Number.parseInt(process.env.OPTIONS_PER_MARKET_LIMIT || "16", 10) || 16)
);
const API_TIMEZONE = process.env.API_FOOTBALL_TIMEZONE || "America/Sao_Paulo";

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

const makeEmptyPayload = (message, debug = "", tournament = null) => ({
  games: [],
  updatedAt: new Date().toISOString(),
  message,
  debug,
  tournament: tournament || {
    id: WORLD_CUP_LEAGUE_ID,
    season: WORLD_CUP_SEASON,
    name: "FIFA World Cup 2026",
  },
});

const getBrazilDate = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: API_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
};

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

const getBetCategory = (betName) => {
  const name = normalizeText(betName);

  if (name.includes("corner")) {
    return "Escanteios";
  }

  if (
    name.includes("goal") ||
    name.includes("over") ||
    name.includes("under") ||
    name.includes("both teams") ||
    name.includes("clean sheet")
  ) {
    return "Gols";
  }

  if (name.includes("card") || name.includes("booking")) {
    return "Cartoes";
  }

  if (name.includes("handicap") || name.includes("asian")) {
    return "Handicap";
  }

  if (name.includes("half") || name.includes("1st") || name.includes("2nd")) {
    return "Tempo";
  }

  if (name.includes("score")) {
    return "Placar";
  }

  if (name.includes("winner") || name === "1x2" || name.includes("double chance")) {
    return "Resultado";
  }

  return "Outros";
};

const getCategoryRank = (category) => {
  const ranks = {
    Resultado: 1,
    Gols: 2,
    Escanteios: 3,
    Cartoes: 4,
    Handicap: 5,
    Tempo: 6,
    Placar: 7,
    Outros: 8,
  };

  return ranks[category] || 99;
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
      createOption({
        key: "home",
        code: "1",
        label: homeName,
        probability: home,
        source: "estimate",
      }),
      createOption({
        key: "draw",
        code: "X",
        label: "Empate",
        probability: draw,
        source: "estimate",
      }),
      createOption({
        key: "away",
        code: "2",
        label: awayName,
        probability: away,
        source: "estimate",
      }),
    ]),
    "Modelo Bubles"
  );
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

const buildBetMarketsFromBookmakers = (entry) => {
  const markets = new Map();

  for (const bookmaker of entry?.bookmakers ?? []) {
    for (const bet of bookmaker?.bets ?? []) {
      const values = (bet?.values ?? [])
        .map((value) => ({
          label: String(value?.value ?? "").trim(),
          odd: toNumber(value?.odd),
        }))
        .filter((value) => value.label && value.odd > 1);

      if (values.length < 2) {
        continue;
      }

      const totalImplied = values.reduce((sum, value) => sum + 1 / value.odd, 0);

      if (!(totalImplied > 0)) {
        continue;
      }

      const marketKey = `${bet?.id || ""}-${normalizeText(bet?.name)}`;
      const market =
        markets.get(marketKey) || {
          id: bet?.id || marketKey,
          name: bet?.name || "Mercado",
          category: getBetCategory(bet?.name),
          options: new Map(),
          bookmakers: new Set(),
        };

      market.bookmakers.add(bookmaker?.name || "bookmaker");

      for (const value of values) {
        const optionKey = normalizeText(value.label);
        const option =
          market.options.get(optionKey) || {
            label: value.label,
            probabilities: [],
            bestOdd: 0,
            bookmaker: "",
          };

        option.probabilities.push((1 / value.odd) / totalImplied);

        if (value.odd > option.bestOdd) {
          option.bestOdd = value.odd;
          option.bookmaker = bookmaker?.name || "bookmaker";
        }

        market.options.set(optionKey, option);
      }

      markets.set(marketKey, market);
    }
  }

  return [...markets.values()]
    .map((market) => {
      const options = [...market.options.values()]
        .map((option) => {
          const probability = average(option.probabilities);
          const fairOdd = probability > 0 ? 1 / probability : 0;

          return {
            label: option.label,
            probability,
            odd: option.bestOdd,
            fairOdd,
            ev: probability * option.bestOdd - 1,
            bookmaker: option.bookmaker,
          };
        })
        .filter((option) => option.probability > 0 && option.odd > 1)
        .sort((left, right) => right.probability - left.probability)
        .slice(0, OPTIONS_PER_MARKET_LIMIT);

      const leader = options[0];
      const second = options[1];

      if (!leader) {
        return null;
      }

      return {
        id: market.id,
        name: market.name,
        category: market.category,
        bookmakersCount: market.bookmakers.size,
        leader: {
          label: leader.label,
          probability: leader.probability,
          odd: leader.odd,
          fairOdd: leader.fairOdd,
          ev: leader.ev,
          bookmaker: leader.bookmaker,
        },
        confidence: leader.probability - (second?.probability || 0),
        options,
      };
    })
    .filter(Boolean)
    .sort((left, right) => {
      const rankDiff = getCategoryRank(left.category) - getCategoryRank(right.category);

      if (rankDiff !== 0) {
        return rankDiff;
      }

      return (right.leader?.probability || 0) - (left.leader?.probability || 0);
    })
    .slice(0, MARKETS_PER_GAME_LIMIT);
};

const createAiInsights = (market, betMarkets) => {
  const mainPick = market?.pickLabel || "mercado principal";
  const goalsPick = betMarkets.find((item) => item.category === "Gols")?.leader;
  const cornersPick = betMarkets.find((item) => item.category === "Escanteios")?.leader;
  const cardsPick = betMarkets.find((item) => item.category === "Cartoes")?.leader;

  return {
    headline: market?.confidence === "odds"
      ? `IA aponta ${mainPick} como leitura principal`
      : `IA estimou vantagem para ${mainPick}`,
    goals: goalsPick
      ? `Gols: ${goalsPick.label} com ${Math.round(goalsPick.probability * 100)}%`
      : "Gols: mercado nao retornado pela API",
    corners: cornersPick
      ? `Escanteios: ${cornersPick.label} com ${Math.round(cornersPick.probability * 100)}%`
      : "Escanteios: mercado nao retornado pela API",
    cards: cardsPick
      ? `Cartoes: ${cardsPick.label} com ${Math.round(cardsPick.probability * 100)}%`
      : "Cartoes: mercado nao retornado pela API",
  };
};

const buildMarketFromBookmakers = (entry) => {
  const homeName = entry?.teams?.home?.name || "";
  const awayName = entry?.teams?.away?.name || "";
  const buckets = {
    home: {
      key: "home",
      code: "1",
      label: homeName,
      probabilities: [],
      bestOdd: 0,
      bookmaker: "",
    },
    draw: {
      key: "draw",
      code: "X",
      label: "Empate",
      probabilities: [],
      bestOdd: 0,
      bookmaker: "",
    },
    away: {
      key: "away",
      code: "2",
      label: awayName,
      probabilities: [],
      bestOdd: 0,
      bookmaker: "",
    },
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
    const betMarkets = buildBetMarketsFromBookmakers(entry);

    if (fixtureId && (market || betMarkets.length)) {
      map.set(fixtureId, {
        market,
        betMarkets,
      });
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

const getStage = (fixture, mode = "worldcup") => {
  if (mode === "today") {
    return fixture?.fixture?.status?.short === "NS" ? "today" : "live";
  }

  const round = normalizeText(fixture?.league?.round);

  if (round.includes("group")) {
    return "groups";
  }

  if (round.includes("final") || round.includes("round") || round.includes("semi") || round.includes("third")) {
    return "knockout";
  }

  return "worldcup";
};

const buildGame = (fixture, oddsAnalysis, mode = "worldcup") => {
  const fixtureId = fixture?.fixture?.id;
  const homeName = fixture?.teams?.home?.name || "A definir";
  const awayName = fixture?.teams?.away?.name || "A definir";
  const statusShort = fixture?.fixture?.status?.short || "NS";
  const isLive = LIVE_STATUSES.has(statusShort);
  const isFinished = FINISHED_STATUSES.has(statusShort);
  const market = oddsAnalysis?.market || buildFallbackMarket(fixture);
  const rawBetMarkets = oddsAnalysis?.betMarkets ?? [];
  const betMarkets = rawBetMarkets.length
    ? rawBetMarkets
    : [
        {
          id: "main-result",
          name: "Resultado final",
          category: "Resultado",
          bookmakersCount: market.confidence === "odds" ? 1 : 0,
          leader: {
            label: market.pickLabel,
            probability: market.probability,
            odd: market.odd,
            fairOdd: market.fairOdd,
            ev: market.ev,
            bookmaker: market.bestBookmaker,
          },
          confidence: market.leaderGap,
          options: market.marketOptions.map((option) => ({
            label: option.label,
            probability: option.probability,
            odd: option.odd,
            fairOdd: option.probability > 0 ? 1 / option.probability : 0,
            ev: option.probability * option.odd - 1,
            bookmaker: option.bookmaker,
          })),
        },
      ];
  const minute = isLive ? clamp(toNumber(fixture?.fixture?.status?.elapsed), 1, 130) : 0;
  const strongestMarket = betMarkets[0]?.leader;
  const bubbleValue = strongestMarket
    ? clamp(Math.max(market.probability, strongestMarket.probability), 0.03, 0.92)
    : market.probability;
  const aiInsights = createAiInsights(market, betMarkets);

  return {
    id: fixtureId,
    game: `${homeName} x ${awayName}`,
    homeTeam: homeName,
    awayTeam: awayName,
    league: fixture?.league?.name || "FIFA World Cup",
    country: fixture?.league?.country || "World",
    round: fixture?.league?.round || (mode === "today" ? "Jogos de hoje" : "Copa do Mundo 2026"),
    stage: getStage(fixture, mode),
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
    hasOdds: Boolean(oddsAnalysis?.market || rawBetMarkets.length),
    isPositiveEv: market.ev > 0,
    isLive,
    isFinished,
    bubbleValue,
    scoreLine: getScoreLine(fixture),
    updatedAt: new Date().toISOString(),
    commenceTime: fixture?.fixture?.date || null,
    statusShort,
    source: mode === "today" ? "API-Football Hoje" : "API-Football",
    confidence: market.confidence,
    leaderGap: market.leaderGap,
    marketOptions: market.marketOptions,
    betMarkets,
    aiInsights,
    totalMarkets: betMarkets.length,
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
    const oddsEntries = await fetchFromApi(
      `/odds?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}`
    );
    return buildOddsMap(oddsEntries);
  } catch (_error) {
    return new Map();
  }
};

const fetchTodayOdds = async (date) => {
  try {
    const oddsEntries = await fetchFromApi(
      `/odds?date=${date}&timezone=${encodeURIComponent(API_TIMEZONE)}`
    );
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
      .map((fixture) => buildGame(fixture, oddsMap.get(fixture?.fixture?.id), "worldcup"))
      .filter((game) => game?.id)
  );
};

const fetchTodayGames = async () => {
  const date = getBrazilDate();
  const [fixtures, oddsMap] = await Promise.all([
    fetchFromApi(`/fixtures?date=${date}&timezone=${encodeURIComponent(API_TIMEZONE)}`),
    fetchTodayOdds(date),
  ]);

  return {
    date,
    games: sortGames(
      fixtures
        .slice(0, TODAY_LIMIT)
        .map((fixture) => buildGame(fixture, oddsMap.get(fixture?.fixture?.id), "today"))
        .filter((game) => game?.id)
    ),
  };
};

const getMode = (request) => {
  try {
    const url = new URL(request?.url || "https://bubles.local/api/games");
    return url.searchParams.get("mode") === "today" ? "today" : "worldcup";
  } catch (_error) {
    return "worldcup";
  }
};

export async function GET(request) {
  if (!API_KEY) {
    return makeJsonResponse(
      makeEmptyPayload("API_KEY ausente", "Configure API_KEY no ambiente do servidor")
    );
  }

  const mode = getMode(request);

  try {
    if (mode === "today") {
      const { date, games } = await fetchTodayGames();
      const oddsCount = games.filter((game) => game.hasOdds).length;
      const liveCount = games.filter((game) => game.isLive).length;

      if (!games.length) {
        return makeJsonResponse(
          makeEmptyPayload(
            "Sem jogos de hoje",
            `Nenhuma fixture retornada para date=${date}`,
            {
              id: "today",
              season: new Date().getFullYear(),
              name: "Jogos de hoje",
              date,
            }
          )
        );
      }

      return makeJsonResponse({
        games,
        updatedAt: new Date().toISOString(),
        message: liveCount ? "Jogos ao vivo de hoje no radar" : "Jogos de hoje carregados",
        debug: `${games.length} jogos de hoje carregados. ${oddsCount} com odds oficiais; os demais usam estimativa visual.`,
        tournament: {
          id: "today",
          season: new Date().getFullYear(),
          name: "Jogos de hoje",
          date,
        },
      });
    }

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
      message: liveCount
        ? "Jogos ao vivo da Copa 2026 no radar"
        : "Calendario da Copa 2026 carregado",
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
