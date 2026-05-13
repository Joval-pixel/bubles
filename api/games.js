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
const MARKETS_PER_GAME_LIMIT = Math.max(
  8,
  Math.min(80, Number.parseInt(process.env.MARKETS_PER_GAME_LIMIT || "32", 10) || 32)
);
const RESPONSE_MARKETS_LIMIT = Math.max(
  4,
  Math.min(12, Number.parseInt(process.env.RESPONSE_MARKETS_LIMIT || "4", 10) || 4)
);
const RESPONSE_OPTIONS_LIMIT = Math.max(
  2,
  Math.min(8, Number.parseInt(process.env.RESPONSE_OPTIONS_LIMIT || "2", 10) || 2)
);
const RESPONSE_RICH_GAMES_LIMIT = Math.max(
  20,
  Math.min(160, Number.parseInt(process.env.RESPONSE_RICH_GAMES_LIMIT || "80", 10) || 80)
);
const OPTIONS_PER_MARKET_LIMIT = Math.max(
  4,
  Math.min(30, Number.parseInt(process.env.OPTIONS_PER_MARKET_LIMIT || "16", 10) || 16)
);
const MAX_ODDS_PAGES = Math.max(
  1,
  Math.min(30, Number.parseInt(process.env.MAX_ODDS_PAGES || "20", 10) || 20)
);
const API_TIMEZONE = process.env.API_FOOTBALL_TIMEZONE || "America/Sao_Paulo";
const TARGET_BOOKMAKERS = String(process.env.TARGET_BOOKMAKERS || "Bet365,Betano")
  .split(",")
  .map((name) => name.trim())
  .filter(Boolean);
const STRICT_TARGET_BOOKMAKERS =
  String(process.env.STRICT_TARGET_BOOKMAKERS || "true").toLowerCase() !== "false";
const BUILTIN_FIXTURE_DATE_OVERRIDES = {
  // API-Football is currently returning this fixture one day early.
  // Keep this small and use FIXTURE_DATE_OVERRIDES in Vercel for future corrections.
  1465114: "2026-05-09T12:00:00-03:00",
};

const LIVE_STATUSES = new Set(["1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE"]);
const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);
const BLOCKED_MARKET_TERMS = [
  "card",
  "booking",
  "handicap",
  "asian",
  "offside",
  "penalty",
  "own goal",
  "throw",
  "substitution",
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const normalizeText = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const normalizeBookmakerKey = (value) => normalizeText(value).replace(/[^a-z0-9]/g, "");

const TARGET_BOOKMAKER_KEYS = TARGET_BOOKMAKERS.map(normalizeBookmakerKey).filter(Boolean);

const isTargetBookmaker = (name) => {
  const key = normalizeBookmakerKey(name);

  if (!key) {
    return false;
  }

  return TARGET_BOOKMAKER_KEYS.some((target) => key.includes(target) || target.includes(key));
};

const getTargetBookmakerNames = (entry) => {
  const names = new Set();

  for (const bookmaker of entry?.bookmakers ?? []) {
    if (isTargetBookmaker(bookmaker?.name)) {
      names.add(bookmaker?.name || "Casa parceira");
    }
  }

  return [...names];
};

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

const makeJsonResponse = (
  payload,
  status = 200,
  cacheControl = "s-maxage=240, stale-while-revalidate=600"
) =>
  Response.json(payload, {
    status,
    headers: {
      "Cache-Control": cacheControl,
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

const parseFixtureDateOverrides = () => {
  const raw = String(process.env.FIXTURE_DATE_OVERRIDES || "").trim();

  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch (_error) {
    // Also support a simple Vercel value like:
    // 123=2026-05-09T12:00:00-03:00;456=2026-05-10T15:30:00-03:00
  }

  return raw.split(/[;\n]+/).reduce((overrides, item) => {
    const [id, ...dateParts] = item.split("=");
    const value = dateParts.join("=").trim();

    if (id?.trim() && value) {
      overrides[id.trim()] = value;
    }

    return overrides;
  }, {});
};

const FIXTURE_DATE_OVERRIDES = {
  ...BUILTIN_FIXTURE_DATE_OVERRIDES,
  ...parseFixtureDateOverrides(),
};

const getDateKeyInTimezone = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: API_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return year && month && day ? `${year}-${month}-${day}` : "";
};

const getFixtureCommenceTime = (fixture) => {
  const fixtureId = fixture?.fixture?.id;
  const override = FIXTURE_DATE_OVERRIDES[String(fixtureId)];

  if (override) {
    return override;
  }

  if (fixture?.fixture?.date) {
    return fixture.fixture.date;
  }

  if (fixture?.fixture?.timestamp) {
    return new Date(fixture.fixture.timestamp * 1000).toISOString();
  }

  return null;
};

const isFixtureOnRequestedDate = (fixture, requestedDate) =>
  getDateKeyInTimezone(getFixtureCommenceTime(fixture)) === requestedDate;

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

const fetchPayloadFromApi = async (path) => {
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

  return payload || {};
};

const fetchFromApi = async (path) => {
  const payload = await fetchPayloadFromApi(path);
  return Array.isArray(payload?.response) ? payload.response : [];
};

const withPageParam = (path, page) => {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}page=${page}`;
};

const fetchPagedFromApi = async (path, maxPages = MAX_ODDS_PAGES) => {
  const firstPayload = await fetchPayloadFromApi(path);
  const firstResponse = Array.isArray(firstPayload?.response) ? firstPayload.response : [];
  const totalPages = Math.max(1, Math.min(maxPages, Number(firstPayload?.paging?.total || 1)));

  if (totalPages <= 1) {
    return firstResponse;
  }

  const nextPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchPayloadFromApi(withPageParam(path, index + 2)).then((payload) =>
        Array.isArray(payload?.response) ? payload.response : []
      )
    )
  );

  return firstResponse.concat(...nextPages);
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

  if (name.includes("corner") || name.includes("escanteio")) {
    return "Escanteios";
  }

  if (
    (name.includes("winner") && name.includes("both teams")) ||
    (name.includes("result") && name.includes("both teams")) ||
    (name.includes("both teams") && name.includes("over")) ||
    (name.includes("both teams") && name.includes("2.5"))
  ) {
    return "Resultado + Gols";
  }

  if (
    name.includes("winner") ||
    name === "1x2" ||
    name.includes("double chance") ||
    name.includes("draw no bet") ||
    name.includes("empate anula")
  ) {
    return "Resultado";
  }

  if (
    name.includes("btts") ||
    name.includes("goal") ||
    name.includes("over") ||
    name.includes("under") ||
    name.includes("both teams") ||
    name.includes("clean sheet")
  ) {
    return "Gols";
  }

  return "Outros";
};

const getCategoryRank = (category) => {
  const ranks = {
    Resultado: 1,
    "Resultado + Gols": 2,
    Gols: 3,
    Escanteios: 4,
    Outros: 8,
  };

  return ranks[category] || 99;
};

const isAllowedPredictionMarket = (betName) => {
  const name = normalizeText(betName);

  if (!name || BLOCKED_MARKET_TERMS.some((term) => name.includes(term))) {
    return false;
  }

  return (
    name.includes("match winner") ||
    name === "winner" ||
    name === "1x2" ||
    name.includes("double chance") ||
    name.includes("draw no bet") ||
    name.includes("empate anula") ||
    name.includes("both teams") ||
    name.includes("btts") ||
    name.includes("corner") ||
    name.includes("escanteio") ||
    name.includes("goal") ||
    name.includes("over") ||
    name.includes("under") ||
    name.includes("result")
  );
};

const isNegativeOpenGameCombo = (marketName, label) => {
  const text = normalizeText(`${marketName || ""} ${label || ""}`);
  const hasBothTeams =
    text.includes("both teams") ||
    text.includes("btts") ||
    text.includes("ambas marcam") ||
    text.includes("ambos marcam");
  const hasOver25 =
    text.includes("over 2.5") ||
    text.includes("mais de 2.5") ||
    text.includes("mais de 2,5") ||
    text.includes("+ mais de 2.5") ||
    text.includes("+ mais de 2,5") ||
    text.includes("+2.5") ||
    text.includes("+2,5");
  const isNegative = /(^|\s|:|-)(no|nao|not)(\s|:|-|$)/.test(text);

  return hasBothTeams && hasOver25 && isNegative;
};

const isLowLineUnderOption = (marketName, label) => {
  const text = normalizeText(`${marketName || ""} ${label || ""}`);

  return (
    (text.includes("under") || text.includes("menos de")) &&
    /(?:under|menos de)\s*0[,.]?5/.test(text)
  );
};

const isRiskyUnderOption = (marketName, label) => {
  const text = normalizeText(`${marketName || ""} ${label || ""}`);

  return (
    (text.includes("under") || text.includes("menos de")) &&
    /(?:under|menos de)\s*1[,.]?5/.test(text)
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

const buildBetMarket = ({ id, name, category, options, bookmaker = "Modelo Bubles" }) => {
  const normalizedOptions = normalizeOptions(options)
    .sort((left, right) => right.probability - left.probability)
    .map((option) => ({
      label: option.label,
      probability: option.probability,
      odd: option.odd,
      fairOdd: option.probability > 0 ? 1 / option.probability : 0,
      ev: option.probability * option.odd - 1,
      bookmaker: option.bookmaker || bookmaker,
      source: option.source || "estimate",
    }));
  const leader = normalizedOptions[0];
  const second = normalizedOptions[1];

  return {
    id,
    name,
    category,
    bookmakersCount: bookmaker === "Modelo Bubles" ? 0 : 1,
    leader: {
      label: leader?.label || "Aguardando mercado",
      probability: leader?.probability || 0,
      odd: leader?.odd || 0,
      fairOdd: leader?.fairOdd || 0,
      ev: leader?.ev || 0,
      bookmaker,
    },
    confidence: Math.max(0, (leader?.probability || 0) - (second?.probability || 0)),
    options: normalizedOptions,
  };
};

const getFixtureScore = (fixture) => {
  const home = toNumber(fixture?.goals?.home);
  const away = toNumber(fixture?.goals?.away);

  return {
    home,
    away,
    total: home + away,
    bothScored: home > 0 && away > 0,
  };
};

const buildFallbackBetMarkets = (fixture, mainMarket) => {
  const fixtureId = fixture?.fixture?.id || `${fixture?.teams?.home?.name}-${fixture?.teams?.away?.name}`;
  const homeName = fixture?.teams?.home?.name || "Mandante";
  const awayName = fixture?.teams?.away?.name || "Visitante";
  const score = getFixtureScore(fixture);
  const statusShort = fixture?.fixture?.status?.short || "NS";
  const isLive = LIVE_STATUSES.has(statusShort);
  const minute = isLive ? clamp(toNumber(fixture?.fixture?.status?.elapsed), 1, 130) : 0;
  const favoriteChance = mainMarket?.probability || 0.45;
  const goalSeed = stableSeed(`${fixtureId}-goals`);
  const bttsSeed = stableSeed(`${fixtureId}-btts`);
  const comboSeed = stableSeed(`${fixtureId}-combo`);
  const paceBoost = isLive ? clamp((score.total * 0.08) + (minute < 35 && score.total ? 0.04 : 0), 0, 0.22) : 0;
  const over25 = clamp(0.46 + (goalSeed - 0.5) * 0.22 + paceBoost, 0.31, 0.76);
  const over15 = clamp(over25 + 0.18, 0.5, 0.86);
  const bttsYes = clamp(0.44 + (bttsSeed - 0.5) * 0.2 + (score.bothScored ? 0.34 : score.total ? 0.06 : 0), 0.28, 0.78);
  const favoriteAndBtts = clamp((favoriteChance * bttsYes) + 0.08 + (comboSeed - 0.5) * 0.08, 0.18, 0.62);
  const bttsAndOver25 = clamp((bttsYes * over25) + 0.12 + (comboSeed - 0.5) * 0.08, 0.2, 0.66);
  const favoriteLabel =
    mainMarket?.pickLabel && mainMarket.pickLabel !== "Favorito"
      ? mainMarket.pickLabel
      : mainMarket?.pickCode === "2"
        ? awayName
        : mainMarket?.pickCode === "X"
          ? "Empate"
          : homeName;

  return [
    buildBetMarket({
      id: "modelo-dupla-chance",
      name: "Dupla chance",
      category: "Resultado",
      options: [
        createOption({
          code: "DC",
          label: `${favoriteLabel} ou empate`,
          probability: clamp(favoriteChance + 0.26, 0.48, 0.88),
          source: "estimate",
        }),
        createOption({
          code: "FORA",
          label: "Resultado contrario",
          probability: clamp(0.74 - favoriteChance, 0.12, 0.52),
          source: "estimate",
        }),
      ],
    }),
    buildBetMarket({
      id: "modelo-gols-15",
      name: "Total de gols 1.5",
      category: "Gols",
      options: [
        createOption({ code: "O1.5", label: "Mais de 1.5 gols", probability: over15, source: "estimate" }),
        createOption({ code: "U1.5", label: "Menos de 1.5 gols", probability: 1 - over15, source: "estimate" }),
      ],
    }),
    buildBetMarket({
      id: "modelo-gols-25",
      name: "Total de gols 2.5",
      category: "Gols",
      options: [
        createOption({ code: "O2.5", label: "Mais de 2.5 gols", probability: over25, source: "estimate" }),
        createOption({ code: "U2.5", label: "Menos de 2.5 gols", probability: 1 - over25, source: "estimate" }),
      ],
    }),
    buildBetMarket({
      id: "modelo-ambas-marcam",
      name: "Ambas as equipes marcam",
      category: "Gols",
      options: [
        createOption({ code: "BTTS-S", label: "Ambas marcam - Sim", probability: bttsYes, source: "estimate" }),
        createOption({ code: "BTTS-N", label: "Um dos times nao marca", probability: 1 - bttsYes, source: "estimate" }),
      ],
    }),
    buildBetMarket({
      id: "modelo-vencedor-ambas",
      name: "Vencedor do jogo e ambas marcam",
      category: "Resultado + Gols",
      options: [
        createOption({
          code: "WIN-BTTS-S",
          label: `${favoriteLabel} vence e ambas marcam`,
          probability: favoriteAndBtts,
          source: "estimate",
        }),
        createOption({
          code: "WIN-BTTS-N",
          label: `${favoriteLabel} vence e ambas nao marcam`,
          probability: clamp(favoriteChance - favoriteAndBtts + 0.08, 0.16, 0.58),
          source: "estimate",
        }),
      ],
    }),
    buildBetMarket({
      id: "modelo-ambas-over-25",
      name: "Ambas marcam e mais de 2.5 gols",
      category: "Resultado + Gols",
      options: [
        createOption({
          code: "BTTS-O2.5-S",
          label: "Ambas marcam + mais de 2.5 gols",
          probability: bttsAndOver25,
          source: "estimate",
        }),
        createOption({
          code: "BTTS-O2.5-N",
          label: "Nao: ambas marcam + mais de 2.5 gols",
          probability: clamp(1 - bttsAndOver25, 0.22, 0.74),
          source: "estimate",
        }),
      ],
    }),
  ].filter((market) => !isNegativeOpenGameCombo(market?.name, market?.leader?.label));
};

const mergeMissingBetMarkets = (fixture, mainMarket, officialMarkets) => {
  const fallbackMarkets = buildFallbackBetMarkets(fixture, mainMarket);
  const cleanOfficialMarkets = officialMarkets.filter(
    (market) => !isNegativeOpenGameCombo(market?.name, market?.leader?.label)
  );
  const byName = new Set(cleanOfficialMarkets.map((market) => normalizeText(`${market.category}-${market.name}`)));
  const categoryCounts = cleanOfficialMarkets.reduce((counts, market) => {
    counts[market.category] = (counts[market.category] || 0) + 1;
    return counts;
  }, {});
  const neededFallbacks = fallbackMarkets.filter((market) => {
    const key = normalizeText(`${market.category}-${market.name}`);

    if (byName.has(key)) {
      return false;
    }

    return (categoryCounts[market.category] || 0) < 2;
  });

  return [...cleanOfficialMarkets, ...neededFallbacks]
    .sort((left, right) => {
      const rankDiff = getCategoryRank(left.category) - getCategoryRank(right.category);

      if (rankDiff !== 0) {
        return rankDiff;
      }

      return (right.leader?.probability || 0) - (left.leader?.probability || 0);
    })
    .slice(0, MARKETS_PER_GAME_LIMIT);
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
    if (!isTargetBookmaker(bookmaker?.name)) {
      continue;
    }

    for (const bet of bookmaker?.bets ?? []) {
      if (!isAllowedPredictionMarket(bet?.name)) {
        continue;
      }

      const values = (bet?.values ?? [])
        .map((value) => ({
          label: String(value?.value ?? "").trim(),
          odd: toNumber(value?.odd),
        }))
        .filter(
          (value) =>
            value.label &&
            value.odd > 1 &&
            !isLowLineUnderOption(bet?.name, value.label)
        );

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

const formatInsightPercent = (value) => `${Math.round((value || 0) * 100)}%`;

const formatInsightOdd = (value) =>
  value && Number.isFinite(value) && value > 1 ? value.toFixed(2).replace(".", ",") : "--";

const translatePickLabel = (label) => {
  const text = String(label || "").trim();

  if (!text) {
    return "mercado principal";
  }

  return text
    .replace(/Nao combina ambas marcam com mais de 2\.5 gols/gi, "Um dos times nao marca")
    .replace(/Nao: ambas marcam \+ mais de 2\.5 gols/gi, "Um dos times nao marca")
    .replace(/Ambas marcam - Nao/gi, "Um dos times nao marca")
    .replace(/Ambas marcam e mais de 2\.5 gols/gi, "Jogo aberto com gols dos dois times")
    .replace(/Ambas marcam \+ mais de 2\.5 gols/gi, "Jogo aberto com gols dos dois times")
    .replace(/vence e ambas nao marcam/gi, "vence e ambas NAO marcam")
    .replace(/\bHome Team Score a Goal\b/gi, "Mandante marca gol")
    .replace(/\bAway Team Score a Goal\b/gi, "Visitante marca gol")
    .replace(/\bMandante Team Score a Goal\b/gi, "Mandante marca gol")
    .replace(/\bVisitante Team Score a Goal\b/gi, "Visitante marca gol")
    .replace(/\bTeam Score a Goal\b/gi, "Time marca gol")
    .replace(/\bTeam To Score\b/gi, "Time marca gol")
    .replace(/\bOwn Goal\b/gi, "Gol contra")
    .replace(/\bDraw No Bet\b/gi, "Empate anula")
    .replace(/\bCorners\b/gi, "Escanteios")
    .replace(/\bCorner\b/gi, "Escanteio")
    .replace(/\bOver\b/gi, "Mais de")
    .replace(/\bUnder\b/gi, "Menos de")
    .replace(/\bYes\b/gi, "Sim")
    .replace(/\bNo\b/gi, "Nao")
    .replace(/\bDraw\b/gi, "Empate")
    .replace(/\bHome\b/gi, "Mandante")
    .replace(/\bAway\b/gi, "Visitante")
    .replace(/\bBoth Teams To Score\b/gi, "Ambas marcam")
    .replace(/\bClean Sheet\b/gi, "Sem sofrer gol")
    .replace(/\bOdd\b/gi, "Impar")
    .replace(/\bEven\b/gi, "Par");
};

const getInsightMarketText = (market) =>
  normalizeText(`${market?.category || ""} ${market?.name || ""} ${market?.leader?.label || ""}`);

const isLowLineUnderMarket = (market) =>
  isLowLineUnderOption(market?.name, market?.leader?.label);

const isRiskyUnderMarket = (market) =>
  isRiskyUnderOption(market?.name, market?.leader?.label);

const getMarketFamily = (market) => {
  const text = getInsightMarketText(market);

  if (text.includes("corner") || text.includes("escanteio")) {
    return "Escanteios";
  }

  if (text.includes("draw no bet") || text.includes("empate anula")) {
    return "Empate anula";
  }

  if (
    text.includes("double chance") ||
    text.includes("dupla chance") ||
    text.includes(" ou empate")
  ) {
    return "Dupla chance";
  }

  if (
    text.includes("both teams") ||
    text.includes("btts") ||
    text.includes("ambas marcam") ||
    text.includes("ambos marcam") ||
    text.includes("dois times")
  ) {
    return "Ambas marcam";
  }

  if (
    (text.includes("over") || text.includes("mais de")) &&
    (text.includes("goal") || text.includes("gol"))
  ) {
    return "Over gols";
  }

  if (
    (text.includes("under") || text.includes("menos de")) &&
    (text.includes("goal") || text.includes("gol"))
  ) {
    return "Under gols";
  }

  if (market?.category === "Resultado + Gols") {
    return "Combinada";
  }

  if (market?.category === "Resultado") {
    return "Vitoria simples";
  }

  return market?.category || "Outros";
};

const isDefensiveOrRepetitiveMarket = (market) => {
  const text = getInsightMarketText(market);

  return (
    isRiskyUnderMarket(market) ||
    isNegativeOpenGameCombo(market?.name, market?.leader?.label) ||
    text.includes("um dos times nao marca") ||
    text.includes("ambas marcam - nao") ||
    text.includes("clean sheet") ||
    text.includes("sem sofrer gol") ||
    text.includes("own goal") ||
    text.includes("gol contra")
  );
};

const getRecentFamilyPenalty = (family, recentFamilies = []) => {
  if (!family || !recentFamilies.length) {
    return 0;
  }

  const lastThree = recentFamilies.slice(-3);
  const repeatedThree = lastThree.length === 3 && lastThree.every((item) => item === family);
  const repeatedTwo = lastThree.slice(-2).length === 2 && lastThree.slice(-2).every((item) => item === family);

  if (repeatedThree) {
    return 0.52;
  }

  if (repeatedTwo) {
    return 0.3;
  }

  return lastThree.includes(family) ? 0.12 : 0;
};

const getInsightMarketScore = (market, recentFamilies = []) => {
  const text = getInsightMarketText(market);
  const family = getMarketFamily(market);
  let score = (market?.leader?.probability || 0) + (market?.confidence || 0) * 0.2;

  if (family === "Vitoria simples") score += 0.12;
  if (family === "Dupla chance") score += 0.16;
  if (family === "Empate anula") score += 0.14;
  if (family === "Over gols") score += 0.13;
  if (family === "Ambas marcam") score += 0.09;
  if (family === "Escanteios") score += 0.06;
  if (family === "Combinada") score += 0.02;
  if (family === "Under gols") score -= 0.08;
  if (isDefensiveOrRepetitiveMarket(market)) score -= 0.24;
  if ((market?.leader?.probability || 0) < 0.54) score -= 0.12;
  if ((market?.leader?.odd || 0) > 0 && (market?.leader?.odd || 0) < 1.15) score -= 0.1;
  if (isLowLineUnderMarket(market)) score -= 1;
  score -= getRecentFamilyPenalty(family, recentFamilies);

  return score;
};

const sortInsightMarkets = (markets, recentFamilies = []) =>
  [...markets].sort(
    (left, right) =>
      getInsightMarketScore(right, recentFamilies) - getInsightMarketScore(left, recentFamilies) ||
      (right.leader?.probability || 0) - (left.leader?.probability || 0)
  );

const resolveFixturePickLabel = (label, pickCode, homeName, awayName) => {
  const text = String(label || "").trim();
  const normalized = normalizeText(text);
  const code = String(pickCode || "").toUpperCase();

  if (!text || normalized === "favorito" || normalized === "home" || normalized === "mandante") {
    if (code === "2") {
      return awayName;
    }

    if (code === "X") {
      return "Empate";
    }

    return homeName;
  }

  if (normalized === "away" || normalized === "visitante") {
    return awayName;
  }

  if (normalized === "draw" || normalized === "empate") {
    return "Empate";
  }

  return text;
};

const getConfidenceLevel = (market) => {
  const probability = market?.probability || 0;
  const gap = market?.leaderGap || 0;

  if (market?.confidence !== "odds") {
    return "media";
  }

  if (probability >= 0.68 || gap >= 0.18) {
    return "alta";
  }

  if (probability >= 0.54 || gap >= 0.1) {
    return "media";
  }

  return "baixa";
};

const getConfidenceText = (market) => {
  const level = getConfidenceLevel(market);

  if (market?.confidence !== "odds") {
    return "Confianca media: a IA esta usando estimativa visual porque ainda nao ha odds oficiais suficientes.";
  }

  if (level === "alta") {
    return "Confianca alta: as odds mostram uma vantagem clara para este palpite.";
  }

  if (level === "media") {
    return "Confianca media: existe vantagem, mas o jogo ainda pede cuidado.";
  }

  return "Confianca baixa: jogo equilibrado, melhor usar como observacao e nao como entrada forte.";
};

const getReadableChanceText = (value) => {
  if (value >= 0.68) {
    return "chance forte";
  }

  if (value >= 0.54) {
    return "chance boa";
  }

  return "chance moderada";
};

const makeInsightLine = (category, pick) => {
  if (!pick) {
    return `${category}: sem dados suficientes neste momento.`;
  }

  const chance = formatInsightPercent(pick.probability);
  const level = getReadableChanceText(pick.probability);

  return `${category}: ${translatePickLabel(pick.label)} aparece como melhor opcao, com ${chance} de chance (${level}).`;
};

const getActionText = (market) => {
  const probability = market?.probability || 0;
  const gap = market?.leaderGap || 0;

  if (market?.confidence !== "odds") {
    return "Aguardar odds oficiais";
  }

  if (probability >= 0.66 && gap >= 0.14) {
    return "Entrada para verificar";
  }

  if (probability >= 0.54) {
    return "Verificar com cautela";
  }

  return "Apenas acompanhar";
};

const getRiskText = (market) => {
  const probability = market?.probability || 0;
  const gap = market?.leaderGap || 0;

  if (market?.confidence !== "odds") {
    return "Risco medio: ainda e estimativa visual.";
  }

  if (probability >= 0.66 && gap >= 0.14) {
    return "Risco menor: leitura forte nas odds.";
  }

  if (probability >= 0.54) {
    return "Risco medio: existe vantagem, mas precisa confirmar.";
  }

  return "Risco alto: jogo equilibrado.";
};

const getAiScore = (market) => {
  const probability = market?.probability || 0;
  const gap = market?.leaderGap || 0;
  const oddsBonus = market?.confidence === "odds" ? 10 : 0;

  return clamp(Math.round(probability * 68 + gap * 110 + oddsBonus), 1, 99);
};

const getWhyList = (market, betMarkets) => {
  const reasons = [
    `Palpite principal com ${formatInsightPercent(market?.probability)} de chance.`,
  ];

  if (market?.confidence === "odds") {
    reasons.push("A leitura usa odds oficiais retornadas pela API.");
  } else {
    reasons.push("A leitura e uma estimativa enquanto as odds oficiais nao vierem completas.");
  }

  if ((market?.leaderGap || 0) >= 0.14) {
    reasons.push("Existe boa distancia para a segunda opcao do mercado.");
  } else {
    reasons.push("A vantagem para a segunda opcao ainda e curta.");
  }

  if (betMarkets.length > 1) {
    reasons.push(`${betMarkets.length} mercados foram encontrados para comparacao.`);
  }

  return reasons;
};

const getChecklist = (market) => {
  const items = [
    "Compare a odd atual com a odd mostrada no radar.",
    "Confirme se o placar, minuto e status do jogo nao mudaram.",
    "Confira os ultimos 10 jogos antes de apostar contra um time em boa fase.",
    "Veja se a chance ainda faz sentido antes de entrar.",
  ];

  if (market?.confidence === "odds") {
    items.push("Priorize mercados com odds oficiais e chance acima de 54%.");
  } else {
    items.push("Se aparecer apenas estimativa, use como observacao e aguarde odds oficiais.");
  }

  return items;
};

const getAvoidList = (market) => {
  const items = [
    "Evite se a odd cair muito abaixo da odd mostrada.",
    "Evite se houver noticia, escalacao ou expulsao que mude o jogo.",
  ];

  if ((market?.probability || 0) < 0.54) {
    items.push("Evite entrada forte quando a chance estiver abaixo de 54%.");
  }

  if (market?.confidence !== "odds") {
    items.push("Evite apostar forte quando a API ainda nao trouxe odds oficiais.");
  }

  return items;
};

const getBestMarkets = (betMarkets, recentFamilies = []) =>
  sortInsightMarkets(
    betMarkets.filter((market) => market?.leader && !isLowLineUnderMarket(market)),
    recentFamilies
  )
    .slice(0, 3)
    .map((market) => ({
      category: market.category,
      family: getMarketFamily(market),
      market: market.name,
      pick: translatePickLabel(market.leader.label),
      probability: market.leader.probability,
      odd: market.leader.odd,
      note: `${market.bookmakersCount ? "Odd oficial" : "Estimativa Bubles"}: ${translatePickLabel(
        market.leader.label
      )} com ${formatInsightPercent(
        market.leader.probability
      )} de chance.`,
    }));

const getHeadlinePickText = (market, translatedPick) => {
  const code = String(market?.pickCode || "").toUpperCase();
  const pick = translatedPick || "mercado principal";
  const normalized = normalizeText(pick);

  if (code === "X" || normalized === "empate") {
    return "Empate";
  }

  if ((code === "1" || code === "2") && !normalized.includes("vence")) {
    return `${pick} vence`;
  }

  return pick;
};

const createAiInsights = (market, betMarkets, recentFamilies = []) => {
  const mainPick = translatePickLabel(market?.pickLabel || "mercado principal");
  const headlinePick = getHeadlinePickText(market, mainPick);
  const resultPick = betMarkets.find((item) => item.category === "Resultado")?.leader;
  const goalsPick = sortInsightMarkets(
    betMarkets.filter((item) => item.category === "Gols" && item?.leader && !isLowLineUnderMarket(item)),
    recentFamilies
  )[0]?.leader;
  const bttsPick = betMarkets.find((item) => {
    const text = normalizeText(`${item?.name || ""} ${item?.leader?.label || ""}`);
    return text.includes("ambas") || text.includes("both teams") || text.includes("btts");
  })?.leader;
  const comboPick = betMarkets.find((item) => item.category === "Resultado + Gols")?.leader;

  return {
    headline: `Melhor palpite: ${headlinePick}`,
    main: `Chance estimada: ${formatInsightPercent(market?.probability)} | Odd atual: ${formatInsightOdd(
      market?.odd
    )}.`,
    confidence: getConfidenceText(market),
    result: makeInsightLine("Resultado", resultPick),
    goals: makeInsightLine("Gols", goalsPick),
    btts: makeInsightLine("Ambas marcam", bttsPick),
    combo: makeInsightLine("Combinada", comboPick),
    action: getActionText(market),
    risk: getRiskText(market),
    score: getAiScore(market),
    why: getWhyList(market, betMarkets),
    checklist: getChecklist(market),
    avoidIf: getAvoidList(market),
    bestMarkets: getBestMarkets(betMarkets, recentFamilies),
    warning: "Use como apoio para analise. Nao existe aposta garantida.",
  };
};

const getPickCodeFromBetLabel = (label, homeName, awayName) => {
  const text = normalizeText(label);
  const home = normalizeText(homeName);
  const away = normalizeText(awayName);
  const hasHome = Boolean(home && text.includes(home));
  const hasAway = Boolean(away && text.includes(away));
  const hasDraw = text === "x" || text.includes("empate") || text.includes("draw");

  if (text.includes("1x") || (hasHome && hasDraw)) {
    return "1X";
  }

  if (text.includes("x2") || (hasAway && hasDraw)) {
    return "X2";
  }

  if (text === "1" || text === "home" || hasHome) {
    return "1";
  }

  if (text === "2" || text === "away" || hasAway) {
    return "2";
  }

  if (text === "x" || text === "draw" || text === "empate") {
    return "X";
  }

  return "";
};

const buildPrimaryMarketFromBetMarket = (game, market) => {
  const leader = market?.leader;

  if (!leader) {
    return null;
  }

  const probability = clamp(leader.probability || 0, 0.03, 0.94);
  const odd = leader.odd > 1 ? leader.odd : probability > 0 ? 1 / probability : game.oddHome;
  const fairOdd = probability > 0 ? 1 / probability : 0;

  return {
    pickCode: getPickCodeFromBetLabel(leader.label, game.homeTeam, game.awayTeam),
    pickLabel: translatePickLabel(leader.label),
    bestBookmaker: leader.bookmaker || game.bestBookmaker,
    odd,
    probability,
    fairOdd,
    marketEdge: odd - fairOdd,
    ev: probability * odd - 1,
    leaderGap: market.confidence || 0,
    confidence: market.bookmakersCount ? "odds" : game.confidence || "estimate",
    marketOptions: (market.options || []).map((option) => ({
      code: getPickCodeFromBetLabel(option.label, game.homeTeam, game.awayTeam),
      label: translatePickLabel(option.label),
      probability: option.probability,
      odd: option.odd,
      bookmaker: option.bookmaker || leader.bookmaker,
      source: option.source || (market.bookmakersCount ? "odds" : "estimate"),
    })),
  };
};

const applyMarketVarietyToGames = (games) => {
  const recentFamilies = [];

  return games.map((game) => {
    const rankedMarkets = sortInsightMarkets(
      (game.betMarkets || []).filter((market) => market?.leader && !isLowLineUnderMarket(market)),
      recentFamilies
    );
    const selectedMarket = rankedMarkets[0];

    if (!selectedMarket?.leader) {
      return game;
    }

    const family = getMarketFamily(selectedMarket);
    const primaryMarket = buildPrimaryMarketFromBetMarket(game, selectedMarket);

    if (!primaryMarket) {
      return game;
    }

    recentFamilies.push(family);

    const bubbleValue = clamp(
      Math.max(game.bubbleValue || 0, primaryMarket.probability || 0),
      0.03,
      0.92
    );
    const selectedGame = {
      ...game,
      pickCode: primaryMarket.pickCode || game.pickCode,
      pickLabel: primaryMarket.pickLabel,
      bestBookmaker: primaryMarket.bestBookmaker,
      oddHome: primaryMarket.odd,
      probability: primaryMarket.probability,
      marketProbability: primaryMarket.probability,
      fairOdd: primaryMarket.fairOdd,
      marketEdge: primaryMarket.marketEdge,
      ev: primaryMarket.ev,
      confidence: primaryMarket.confidence,
      leaderGap: primaryMarket.leaderGap,
      marketOptions: primaryMarket.marketOptions,
      displayMarketCategory: selectedMarket.category,
      displayMarketName: selectedMarket.name,
      displayPickLabel: primaryMarket.pickLabel,
      displayProbability: primaryMarket.probability,
      displayOdd: primaryMarket.odd,
      selectedMarketFamily: family,
      bubbleValue,
      betMarkets: rankedMarkets.length ? rankedMarkets : game.betMarkets,
    };

    return {
      ...selectedGame,
      aiInsights: createAiInsights(primaryMarket, selectedGame.betMarkets, recentFamilies),
      aiMarketRank: getBestMarkets(selectedGame.betMarkets, recentFamilies),
    };
  });
};

const compactNumber = (value, digits = 4) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return value;
  }

  return Number(number.toFixed(digits));
};

const compactOptionForResponse = (option = {}) => ({
  code: option.code || "",
  label: translatePickLabel(option.label || ""),
  probability: compactNumber(option.probability || 0),
  odd: compactNumber(option.odd || 0, 2),
  bookmaker: option.bookmaker || "",
  source: option.source || "",
});

const compactMarketForResponse = (market = {}) => ({
  id: market.id,
  name: market.name,
  category: market.category,
  family: getMarketFamily(market),
  bookmakersCount: market.bookmakersCount || 0,
  confidence: compactNumber(market.confidence || 0),
  leader: market.leader
    ? {
        label: translatePickLabel(market.leader.label || ""),
        probability: compactNumber(market.leader.probability || 0),
        odd: compactNumber(market.leader.odd || 0, 2),
        bookmaker: market.leader.bookmaker || "",
      }
    : null,
  options: (market.options || [])
    .slice(0, RESPONSE_OPTIONS_LIMIT)
    .map(compactOptionForResponse),
});

const compactBestMarketForResponse = (market = {}) => ({
  category: market.category || "",
  family: market.family || "",
  market: market.market || "",
  pick: translatePickLabel(market.pick || ""),
  probability: compactNumber(market.probability || 0),
  odd: compactNumber(market.odd || 0, 2),
  note: market.note || "",
});

const compactAiInsightsForResponse = (insights = {}) => ({
  headline: insights.headline || "",
  main: insights.main || "",
  confidence: insights.confidence || "",
  result: insights.result || "",
  goals: insights.goals || "",
  btts: insights.btts || "",
  combo: insights.combo || "",
  action: insights.action || "",
  risk: insights.risk || "",
  score: insights.score || 0,
  warning: insights.warning || "",
  why: (insights.why || []).slice(0, 3),
  checklist: (insights.checklist || []).slice(0, 4),
  avoidIf: (insights.avoidIf || []).slice(0, 3),
  bestMarkets: (insights.bestMarkets || [])
    .slice(0, 3)
    .map(compactBestMarketForResponse),
});

const compactGameForResponse = (game = {}, includeRichDetails = true) => {
  const {
    fairOdd,
    isPositiveEv,
    aiInsights,
    aiMarketRank,
    betMarkets,
    marketOptions,
    ...rest
  } = game;

  const compactGame = {
    ...rest,
    ev: compactNumber(game.ev || 0),
    oddHome: compactNumber(game.oddHome || 0, 2),
    probability: compactNumber(game.probability || 0),
    marketProbability: compactNumber(game.marketProbability || 0),
    marketEdge: compactNumber(game.marketEdge || 0),
    bubbleValue: compactNumber(game.bubbleValue || 0),
    leaderGap: compactNumber(game.leaderGap || 0),
    displayProbability: compactNumber(game.displayProbability || game.probability || 0),
    displayOdd: compactNumber(game.displayOdd || game.oddHome || 0, 2),
  };

  if (!includeRichDetails) {
    return compactGame;
  }

  return {
    ...compactGame,
    marketOptions: (marketOptions || [])
      .slice(0, RESPONSE_OPTIONS_LIMIT)
      .map(compactOptionForResponse),
    betMarkets: (betMarkets || [])
      .slice(0, RESPONSE_MARKETS_LIMIT)
      .map(compactMarketForResponse),
    aiInsights: compactAiInsightsForResponse(aiInsights),
    aiMarketRank: (aiMarketRank || [])
      .slice(0, 3)
      .map(compactBestMarketForResponse),
  };
};

const compactGamesForResponse = (games) =>
  games.map((game, index) => compactGameForResponse(game, index < RESPONSE_RICH_GAMES_LIMIT));

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
    if (!isTargetBookmaker(bookmaker?.name)) {
      continue;
    }

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
    const bookmakerNames = getTargetBookmakerNames(entry);

    if (!bookmakerNames.length) {
      continue;
    }

    const market = buildMarketFromBookmakers(entry);
    const betMarkets = buildBetMarketsFromBookmakers(entry);

    if (fixtureId && (market || betMarkets.length)) {
      map.set(fixtureId, {
        market,
        betMarkets,
        bookmakerNames,
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
  const commenceTime = getFixtureCommenceTime(fixture);
  const baseMarket = oddsAnalysis?.market || buildFallbackMarket(fixture);
  const market = {
    ...baseMarket,
    pickLabel: resolveFixturePickLabel(baseMarket.pickLabel, baseMarket.pickCode, homeName, awayName),
    marketOptions: (baseMarket.marketOptions || []).map((option) => ({
      ...option,
      label: resolveFixturePickLabel(option.label, option.code, homeName, awayName),
    })),
  };
  const rawBetMarkets = oddsAnalysis?.betMarkets ?? [];
  const resultMarket = {
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
      source: option.source,
    })),
  };
  const betMarkets = mergeMissingBetMarkets(
    fixture,
    market,
    rawBetMarkets.length ? rawBetMarkets : [resultMarket]
  );
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
    homeTeamId: fixture?.teams?.home?.id || null,
    awayTeamId: fixture?.teams?.away?.id || null,
    homeLogo: fixture?.teams?.home?.logo || "",
    awayLogo: fixture?.teams?.away?.logo || "",
    leagueId: fixture?.league?.id || null,
    season: fixture?.league?.season || (mode === "worldcup" ? WORLD_CUP_SEASON : new Date().getFullYear()),
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
    allowedBookmakers: oddsAnalysis?.bookmakerNames ?? [],
    hasTargetBookmaker: Boolean(oddsAnalysis?.bookmakerNames?.length),
    isPositiveEv: market.ev > 0,
    isLive,
    isFinished,
    bubbleValue,
    scoreLine: getScoreLine(fixture),
    updatedAt: new Date().toISOString(),
    commenceTime,
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
    const oddsEntries = await fetchPagedFromApi(
      `/odds?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}`
    );
    return buildOddsMap(oddsEntries);
  } catch (_error) {
    return new Map();
  }
};

const fetchTodayOdds = async (date) => {
  try {
    const oddsEntries = await fetchPagedFromApi(
      `/odds?date=${date}&timezone=${encodeURIComponent(API_TIMEZONE)}`
    );
    return buildOddsMap(oddsEntries);
  } catch (_error) {
    return new Map();
  }
};

const fetchLiveFixtures = async () => {
  try {
    return await fetchFromApi(`/fixtures?live=all&timezone=${encodeURIComponent(API_TIMEZONE)}`);
  } catch (_error) {
    return [];
  }
};

const mergeFixturesById = (...fixtureGroups) => {
  const map = new Map();

  fixtureGroups.flat().forEach((fixture) => {
    const id = fixture?.fixture?.id;

    if (!id) {
      return;
    }

    map.set(id, fixture);
  });

  return [...map.values()];
};

const buildGamesWithBookmakerFallback = (fixtures, oddsMap, source) => {
  const allGames = fixtures
    .map((fixture) => buildGame(fixture, oddsMap.get(fixture?.fixture?.id), source))
    .filter((game) => game?.id);
  const partnerGames = allGames.filter((game) => game.hasTargetBookmaker);
  const games = STRICT_TARGET_BOOKMAKERS
    ? partnerGames
    : partnerGames.length
      ? partnerGames
      : allGames;

  return {
    games,
    partnerCount: partnerGames.length,
    totalCount: allGames.length,
    usingFallback: !STRICT_TARGET_BOOKMAKERS && !partnerGames.length && allGames.length > 0,
  };
};

const fetchWorldCupGames = async () => {
  const [fixtures, oddsMap] = await Promise.all([
    fetchFromApi(`/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}`),
    fetchWorldCupOdds(),
  ]);

  const result = buildGamesWithBookmakerFallback(fixtures.slice(0, WORLD_CUP_LIMIT), oddsMap, "worldcup");

  return {
    ...result,
    games: applyMarketVarietyToGames(sortGames(result.games)),
  };
};

const fetchTodayGames = async () => {
  const date = getBrazilDate();
  const [todayFixtures, liveFixtures, oddsMap] = await Promise.all([
    fetchFromApi(`/fixtures?date=${date}&timezone=${encodeURIComponent(API_TIMEZONE)}`),
    fetchLiveFixtures(),
    fetchTodayOdds(date),
  ]);
  const fixtures = mergeFixturesById(liveFixtures, todayFixtures).filter((fixture) => {
    const statusShort = fixture?.fixture?.status?.short || "NS";

    if (LIVE_STATUSES.has(statusShort)) {
      return true;
    }

    return isFixtureOnRequestedDate(fixture, date);
  });
  const result = buildGamesWithBookmakerFallback(fixtures, oddsMap, "today");
  const games = result.games;
  const liveGames = games.filter((game) => game.isLive);
  const otherGames = sortGames(games.filter((game) => !game.isLive));

  return {
    date,
    partnerCount: result.partnerCount,
    totalCount: result.totalCount,
    usingFallback: result.usingFallback,
    games: applyMarketVarietyToGames(sortGames([...liveGames, ...otherGames])),
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
      const { date, games, usingFallback, partnerCount, totalCount } = await fetchTodayGames();
      const oddsCount = games.filter((game) => game.hasOdds).length;
      const liveCount = games.filter((game) => game.isLive).length;
      const bookmakerLabel = TARGET_BOOKMAKERS.join(" ou ");

      if (!games.length) {
        const hasGamesWithoutTargetBookmakers = totalCount > 0 && partnerCount === 0;

        return makeJsonResponse(
          makeEmptyPayload(
            hasGamesWithoutTargetBookmakers
              ? `Sem jogos de hoje com odds oficiais de ${bookmakerLabel}`
              : "Sem jogos de hoje retornados",
            hasGamesWithoutTargetBookmakers
              ? `A API-Football retornou ${totalCount} jogos para date=${date}, mas 0 com odds oficiais de ${bookmakerLabel}. O filtro de casas esta ativo.`
              : `Nenhum fixture retornado pela API-Football para date=${date}`,
            {
              id: "today",
              season: new Date().getFullYear(),
              name: "Jogos de hoje",
              date,
            }
          ),
          200,
          "s-maxage=45, stale-while-revalidate=90"
        );
      }

      const responseGames = compactGamesForResponse(games);

      return makeJsonResponse({
        games: responseGames,
        updatedAt: new Date().toISOString(),
        message: usingFallback
          ? "Jogos de hoje carregados sem filtro de casas"
          : liveCount
            ? "Jogos ao vivo de hoje no radar"
            : "Jogos de hoje carregados",
        debug: usingFallback
          ? `${games.length} jogos de hoje carregados. A API-Football retornou ${partnerCount} de ${totalCount} jogos com odds oficiais de ${bookmakerLabel}; exibindo todos os jogos do dia para nao zerar o radar.`
          : `${games.length} jogos de hoje carregados com odds oficiais de ${bookmakerLabel}.`,
        tournament: {
          id: "today",
          season: new Date().getFullYear(),
          name: "Jogos de hoje",
          date,
        },
      }, 200, "s-maxage=45, stale-while-revalidate=90");
    }

    const { games, usingFallback, partnerCount, totalCount } = await fetchWorldCupGames();
    const oddsCount = games.filter((game) => game.hasOdds).length;
    const liveCount = games.filter((game) => game.isLive).length;
    const bookmakerLabel = TARGET_BOOKMAKERS.join(" ou ");

    if (!games.length) {
      const hasGamesWithoutTargetBookmakers = totalCount > 0 && partnerCount === 0;

      return makeJsonResponse(
        makeEmptyPayload(
          hasGamesWithoutTargetBookmakers
            ? `Sem jogos da Copa com odds oficiais de ${bookmakerLabel}`
            : "Sem jogos da Copa retornados",
          hasGamesWithoutTargetBookmakers
            ? `A API-Football retornou ${totalCount} jogos da Copa 2026, mas 0 com odds oficiais de ${bookmakerLabel}. O filtro de casas esta ativo.`
            : "Nenhum fixture da Copa 2026 retornado pela API-Football"
        )
      );
    }

    const responseGames = compactGamesForResponse(games);

    return makeJsonResponse({
      games: responseGames,
      updatedAt: new Date().toISOString(),
      message: liveCount
        ? "Jogos ao vivo da Copa 2026 no radar"
        : usingFallback
          ? "Calendario da Copa 2026 carregado sem filtro de casas"
          : "Calendario da Copa 2026 carregado",
      debug: usingFallback
        ? `${games.length} jogos da Copa 2026 carregados. A API-Football retornou ${partnerCount} de ${totalCount} jogos com odds oficiais de ${bookmakerLabel}; exibindo a tabela para nao zerar o radar.`
        : `${games.length} jogos da Copa 2026 carregados com odds oficiais de ${bookmakerLabel}.`,
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
