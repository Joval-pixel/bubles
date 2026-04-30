const API_BASE = "https://api.opticodds.com/api/v3";

const API_KEY =
  process.env.OPTICODDS_API_KEY ||
  process.env.API_KEY ||
  process.env.OPTICODDS_KEY ||
  "";

const SPORT = process.env.OPTICODDS_SPORT || "soccer";
const LEAGUES = splitEnv(process.env.OPTICODDS_LEAGUES || "");
const WORLD_CUP_LEAGUES = splitEnv(
  process.env.OPTICODDS_WORLD_CUP_LEAGUES ||
    process.env.WORLD_CUP_LEAGUES ||
    process.env.OPTICODDS_LEAGUES ||
    ""
);

const SPORTSBOOKS = splitEnv(
  process.env.OPTICODDS_SPORTSBOOKS || "bet365,betmgm,draftkings,fanduel,caesars"
).slice(0, 5);

const MARKETS = splitEnv(process.env.OPTICODDS_MARKETS || "");
const API_TIMEZONE = process.env.API_TIMEZONE || "America/Sao_Paulo";
const TODAY_DAYS = toInt(process.env.OPTICODDS_DAYS, 3, 1, 14);
const LIMIT = toInt(process.env.OPTICODDS_LIMIT, 120, 24, 500);
const MAX_PAGES = toInt(process.env.OPTICODDS_MAX_PAGES, 3, 1, 10);
const ODDS_BATCH_SIZE = toInt(process.env.OPTICODDS_ODDS_BATCH_SIZE, 20, 5, 40);
const WORLD_CUP_SEASON = toInt(process.env.WORLD_CUP_SEASON, 2026, 2026, 2026);

const LIVE_STATUSES = new Set(["live", "inprogress", "in_progress", "started"]);
const FINISHED_STATUSES = new Set(["completed", "complete", "final", "finished"]);

function splitEnv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toInt(value, fallback, min, max) {
  const parsed = Number.parseInt(value || "", 10);
  const safe = Number.isFinite(parsed) ? parsed : fallback;
  return Math.min(max, Math.max(min, safe));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function makeJsonResponse(payload, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "s-maxage=120, stale-while-revalidate=300",
    },
  });
}

function makeEmptyPayload(message, debug = "", tournament = null) {
  return {
    games: [],
    updatedAt: new Date().toISOString(),
    message,
    debug,
    tournament: tournament || {
      id: SPORT,
      season: new Date().getFullYear(),
      name: "OpticOdds",
    },
  };
}

function getBrazilDate() {
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
}

function addDaysToBrazilDate(date, days) {
  const base = new Date(`${date}T03:00:00.000Z`);
  base.setUTCDate(base.getUTCDate() + days);

  return base.toISOString().slice(0, 10);
}

function buildDateWindow(mode) {
  if (mode === "worldcup") {
    return {
      after: `${WORLD_CUP_SEASON}-06-01T00:00:00Z`,
      before: `${WORLD_CUP_SEASON}-08-01T00:00:00Z`,
      date: `${WORLD_CUP_SEASON}`,
    };
  }

  const today = getBrazilDate();
  const beforeDate = addDaysToBrazilDate(today, TODAY_DAYS);

  return {
    after: `${today}T00:00:00-03:00`,
    before: `${beforeDate}T23:59:59-03:00`,
    date: today,
  };
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch (_error) {
    return {};
  }
}

function getErrorMessage(payload, status) {
  const message =
    payload?.message ||
    payload?.error ||
    payload?.errors?.[0]?.message ||
    payload?.errors?.message ||
    "";

  if (message) return String(message);
  if (status === 401 || status === 403) return "Chave OpticOdds invalida ou sem permissao";
  if (status === 429) return "Limite da OpticOdds atingido";
  return `OpticOdds HTTP ${status}`;
}

async function fetchFromOpticOdds(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((item) => url.searchParams.append(key, item));
      return;
    }

    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    headers: {
      "X-Api-Key": API_KEY,
      Accept: "application/json",
    },
  });

  const payload = await safeJson(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, response.status));
  }

  return payload;
}

function stableSeed(input) {
  let hash = 2166136261;
  const text = String(input ?? "");

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash >>> 0) / 4294967295;
}

function toDecimalOdd(value) {
  const number = Number.parseFloat(String(value ?? "").replace(",", "."));

  if (!Number.isFinite(number) || number === 0) return 0;

  if (number < 0) return 1 + 100 / Math.abs(number);
  if (number >= 20) return 1 + number / 100;

  return number;
}

function getCompetitorName(list, fallback) {
  return list?.[0]?.name || list?.[0]?.abbreviation || fallback;
}

function getScoreLine(fixture) {
  const result = fixture?.result;

  if (!result) return "Pre-jogo";

  const home =
    result?.home_score ??
    result?.home_points ??
    result?.scores?.home ??
    result?.home?.score ??
    result?.home?.points;

  const away =
    result?.away_score ??
    result?.away_points ??
    result?.scores?.away ??
    result?.away?.score ??
    result?.away?.points;

  if (home === null || home === undefined || away === null || away === undefined) {
    return "Pre-jogo";
  }

  return `${home} x ${away}`;
}

function getMinute(fixture) {
  const value =
    fixture?.clock?.minute ??
    fixture?.game_clock?.minute ??
    fixture?.period_time?.minute ??
    fixture?.result?.elapsed;

  const parsed = Number.parseInt(value || "", 10);

  if (Number.isFinite(parsed) && parsed > 0) return parsed;

  return fixture?.is_live ? 1 : 0;
}

function getOptionCode(optionLabel, homeName, awayName) {
  const label = normalizeText(optionLabel);
  const home = normalizeText(homeName);
  const away = normalizeText(awayName);

  if (label === home || label.includes(home)) return "1";
  if (label === away || label.includes(away)) return "2";
  if (label === "draw" || label === "tie" || label === "empate" || label === "x") return "X";
  if (label.includes("over")) return "O";
  if (label.includes("under")) return "U";

  return String(optionLabel || "?").slice(0, 3).toUpperCase();
}

function getBetCategory(marketName, marketId) {
  const text = normalizeText(`${marketName} ${marketId}`);

  if (text.includes("corner")) return "Escanteios";
  if (text.includes("card") || text.includes("booking")) return "Cartoes";
  if (text.includes("goal") || text.includes("total") || text.includes("over") || text.includes("under")) return "Gols";
  if (text.includes("spread") || text.includes("handicap") || text.includes("line")) return "Handicap";
  if (text.includes("half") || text.includes("1st") || text.includes("2nd")) return "Tempo";
  if (text.includes("score")) return "Placar";
  if (text.includes("moneyline") || text.includes("winner") || text.includes("1x2")) return "Resultado";

  return "Outros";
}

function getCategoryRank(category) {
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
}

function buildFallbackMarket(fixture) {
  const homeName = getCompetitorName(fixture?.home_competitors, "Mandante");
  const awayName = getCompetitorName(fixture?.away_competitors, "Visitante");
  const seed = stableSeed(`${fixture?.id}-${homeName}-${awayName}`);
  const lean = (seed - 0.5) * 0.16;
  const draw = 0.27 + (stableSeed(`${fixture?.id}-draw`) - 0.5) * 0.04;
  const home = 0.365 + lean;
  const away = 1 - draw - home;

  return buildMainMarketFromOptions(
    [
      { label: homeName, code: "1", probability: home, odd: 1 / home, sportsbook: "Modelo Bubles" },
      { label: "Empate", code: "X", probability: draw, odd: 1 / draw, sportsbook: "Modelo Bubles" },
      { label: awayName, code: "2", probability: away, odd: 1 / away, sportsbook: "Modelo Bubles" },
    ],
    "estimate"
  );
}

function buildMainMarketFromOptions(options, confidence = "odds") {
  const total = options.reduce((sum, option) => sum + option.probability, 0) || 1;
  const normalized = options
    .map((option) => ({
      ...option,
      probability: option.probability / total,
    }))
    .sort((left, right) => right.probability - left.probability);

  const selected = normalized[0];
  const second = normalized[1];
  const probability = clamp(selected?.probability || 0.33, 0.03, 0.94);
  const odd = selected?.odd > 1 ? selected.odd : probability > 0 ? 1 / probability : 0;
  const fairOdd = probability > 0 ? 1 / probability : 0;

  return {
    pickCode: selected?.code || "1",
    pickLabel: selected?.label || "Favorito",
    bestBookmaker: selected?.sportsbook || "OpticOdds",
    odd,
    probability,
    fairOdd,
    marketEdge: odd - fairOdd,
    ev: probability * odd - 1,
    leaderGap: Math.max(0, probability - (second?.probability || 0)),
    confidence,
    marketOptions: normalized.map((option) => ({
      code: option.code,
      label: option.label,
      probability: option.probability,
      odd: option.odd,
      bookmaker: option.sportsbook || "OpticOdds",
      source: confidence,
    })),
  };
}

function buildBetMarketsFromOdds(fixtureWithOdds) {
  const homeName = getCompetitorName(fixtureWithOdds?.home_competitors, "Mandante");
  const awayName = getCompetitorName(fixtureWithOdds?.away_competitors, "Visitante");
  const groups = new Map();

  for (const odd of fixtureWithOdds?.odds ?? []) {
    const decimalOdd = toDecimalOdd(odd?.price);

    if (!(decimalOdd > 1)) continue;

    const marketId = odd?.market_id || normalizeText(odd?.market || "market");
    const groupKey = odd?.grouping_key || "default";
    const key = `${marketId}|${groupKey}`;
    const sportsbook = odd?.sportsbook || "OpticOdds";
    const optionLabel = odd?.name || odd?.selection || "Opcao";
    const category = getBetCategory(odd?.market, odd?.market_id);

    const group =
      groups.get(key) || {
        id: marketId,
        name: odd?.market || marketId,
        category,
        optionsBySportsbook: new Map(),
      };

    const bookOptions = group.optionsBySportsbook.get(sportsbook) || [];
    bookOptions.push({
      label: optionLabel,
      code: getOptionCode(optionLabel, homeName, awayName),
      odd: decimalOdd,
      sportsbook,
      points: odd?.points ?? null,
      selectionLine: odd?.selection_line || "",
    });

    group.optionsBySportsbook.set(sportsbook, bookOptions);
    groups.set(key, group);
  }

  return [...groups.values()]
    .map((group) => {
      const optionMap = new Map();

      for (const [sportsbook, bookOptions] of group.optionsBySportsbook.entries()) {
        const totalImplied = bookOptions.reduce((sum, option) => sum + 1 / option.odd, 0);

        if (!(totalImplied > 0)) continue;

        for (const option of bookOptions) {
          const optionKey = normalizeText(option.label);
          const saved =
            optionMap.get(optionKey) || {
              label: option.label,
              code: option.code,
              probabilities: [],
              bestOdd: 0,
              sportsbook,
            };

          saved.probabilities.push((1 / option.odd) / totalImplied);

          if (option.odd > saved.bestOdd) {
            saved.bestOdd = option.odd;
            saved.sportsbook = sportsbook;
          }

          optionMap.set(optionKey, saved);
        }
      }

      const options = [...optionMap.values()]
        .map((option) => {
          const probability = average(option.probabilities);
          const fairOdd = probability > 0 ? 1 / probability : 0;

          return {
            label: option.label,
            code: option.code,
            probability,
            odd: option.bestOdd,
            fairOdd,
            ev: probability * option.bestOdd - 1,
            bookmaker: option.sportsbook,
          };
        })
        .filter((option) => option.probability > 0 && option.odd > 1)
        .sort((left, right) => right.probability - left.probability)
        .slice(0, 16);

      const leader = options[0];
      const second = options[1];

      if (!leader) return null;

      return {
        id: group.id,
        name: group.name,
        category: group.category,
        bookmakersCount: group.optionsBySportsbook.size,
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

      if (rankDiff !== 0) return rankDiff;

      return (right.leader?.probability || 0) - (left.leader?.probability || 0);
    })
    .slice(0, 80);
}

function createAiInsights(market, betMarkets) {
  const mainPick = market?.pickLabel || "mercado principal";
  const goalsPick = betMarkets.find((item) => item.category === "Gols")?.leader;
  const cornersPick = betMarkets.find((item) => item.category === "Escanteios")?.leader;
  const cardsPick = betMarkets.find((item) => item.category === "Cartoes")?.leader;

  return {
    headline:
      market?.confidence === "odds"
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
}

function getMainMarketFromBetMarkets(fixture, betMarkets) {
  const homeName = getCompetitorName(fixture?.home_competitors, "Mandante");
  const awayName = getCompetitorName(fixture?.away_competitors, "Visitante");

  const resultMarket =
    betMarkets.find((market) => normalizeText(market.id).includes("moneyline")) ||
    betMarkets.find((market) => market.category === "Resultado") ||
    betMarkets[0];

  if (!resultMarket?.options?.length) return null;

  return buildMainMarketFromOptions(
    resultMarket.options.map((option) => ({
      label: option.label,
      code: option.code || getOptionCode(option.label, homeName, awayName),
      probability: option.probability,
      odd: option.odd,
      sportsbook: option.bookmaker,
    })),
    "odds"
  );
}

function buildFallbackBetMarket(market) {
  return {
    id: "modelo-bubles",
    name: "Resultado principal",
    category: "Resultado",
    bookmakersCount: 0,
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
  };
}

function buildGame(fixture, oddsFixture, mode) {
  const homeName = getCompetitorName(fixture?.home_competitors, "Mandante");
  const awayName = getCompetitorName(fixture?.away_competitors, "Visitante");
  const status = normalizeText(fixture?.status || "unplayed");
  const isLive = Boolean(fixture?.is_live) || LIVE_STATUSES.has(status);
  const isFinished = FINISHED_STATUSES.has(status);

  const betMarkets = buildBetMarketsFromOdds(oddsFixture);
  const market = getMainMarketFromBetMarkets(fixture, betMarkets) || buildFallbackMarket(fixture);
  const safeBetMarkets = betMarkets.length ? betMarkets : [buildFallbackBetMarket(market)];
  const strongestMarket = safeBetMarkets[0]?.leader;
  const bubbleValue = strongestMarket
    ? clamp(Math.max(market.probability, strongestMarket.probability), 0.03, 0.92)
    : market.probability;

  return {
    id: fixture?.id,
    game: `${homeName} x ${awayName}`,
    homeTeam: homeName,
    awayTeam: awayName,
    league: fixture?.league?.name || fixture?.league?.id || "Soccer",
    country: fixture?.league?.region || fixture?.league?.region_code || "",
    round: fixture?.season_type || fixture?.season_week || (mode === "today" ? "Jogos de hoje" : "Copa 2026"),
    stage: mode === "worldcup" ? "groups" : fixture?.status || "today",
    venue: fixture?.venue_name || "",
    city: fixture?.venue_location || "",
    minute: getMinute(fixture),
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
    hasOdds: Boolean(oddsFixture?.odds?.length),
    isPositiveEv: market.ev > 0,
    isLive,
    isFinished,
    bubbleValue,
    scoreLine: getScoreLine(fixture),
    updatedAt: new Date().toISOString(),
    commenceTime: fixture?.start_date || null,
    statusShort: fixture?.status || "unplayed",
    source: "OpticOdds",
    confidence: market.confidence,
    leaderGap: market.leaderGap,
    marketOptions: market.marketOptions,
    betMarkets: safeBetMarkets,
    aiInsights: createAiInsights(market, safeBetMarkets),
    totalMarkets: safeBetMarkets.length,
  };
}

function sortGames(games) {
  return [...games].sort((left, right) => {
    if (Number(right.isLive) !== Number(left.isLive)) {
      return Number(right.isLive) - Number(left.isLive);
    }

    const leftTime = new Date(left.commenceTime || 0).getTime();
    const rightTime = new Date(right.commenceTime || 0).getTime();

    if (leftTime !== rightTime) return leftTime - rightTime;

    return (right.bubbleValue || 0) - (left.bubbleValue || 0);
  });
}

async function fetchFixtures(mode) {
  const window = buildDateWindow(mode);
  const leagues = mode === "worldcup" ? WORLD_CUP_LEAGUES : LEAGUES;
  const fixtures = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const payload = await fetchFromOpticOdds("/fixtures", {
      sport: SPORT,
      league: leagues,
      page,
      start_date_after: window.after,
      start_date_before: window.before,
      status: mode === "today" ? ["unplayed", "live", "completed"] : ["unplayed", "live"],
    });

    const data = Array.isArray(payload?.data) ? payload.data : [];
    fixtures.push(...data);

    if (!data.length || page >= Number(payload?.total_pages || 1) || fixtures.length >= LIMIT) {
      break;
    }
  }

  return {
    date: window.date,
    fixtures: fixtures.slice(0, LIMIT),
  };
}

async function fetchOddsForFixtures(fixtures) {
  if (!fixtures.length || !SPORTSBOOKS.length) {
    return new Map();
  }

  const ids = fixtures
    .filter((fixture) => fixture?.id && fixture?.has_odds !== false)
    .map((fixture) => fixture.id);

  const oddsMap = new Map();

  for (let index = 0; index < ids.length; index += ODDS_BATCH_SIZE) {
    const batch = ids.slice(index, index + ODDS_BATCH_SIZE);

    try {
      const payload = await fetchFromOpticOdds("/fixtures/odds", {
        fixture_id: batch,
        sportsbook: SPORTSBOOKS,
        market: MARKETS,
        is_main: "true",
        odds_format: "DECIMAL",
      });

      const data = Array.isArray(payload?.data) ? payload.data : [];

      for (const fixture of data) {
        if (fixture?.id) {
          oddsMap.set(fixture.id, fixture);
        }
      }
    } catch (_error) {
      continue;
    }
  }

  return oddsMap;
}

function getMode(request) {
  try {
    const url = new URL(request?.url || "https://bubles.local/api/games");
    return url.searchParams.get("mode") === "worldcup" ? "worldcup" : "today";
  } catch (_error) {
    return "today";
  }
}

export async function GET(request) {
  if (!API_KEY) {
    return makeJsonResponse(
      makeEmptyPayload("OPTICODDS_API_KEY ausente", "Configure OPTICODDS_API_KEY no ambiente do servidor")
    );
  }

  if (!SPORTSBOOKS.length) {
    return makeJsonResponse(
      makeEmptyPayload("Sportsbooks ausentes", "Configure OPTICODDS_SPORTSBOOKS com ate 5 casas")
    );
  }

  const mode = getMode(request);

  try {
    const { date, fixtures } = await fetchFixtures(mode);
    const oddsMap = await fetchOddsForFixtures(fixtures);

    const games = sortGames(
      fixtures
        .map((fixture) => buildGame(fixture, oddsMap.get(fixture?.id), mode))
        .filter((game) => game?.id)
    );

    const liveCount = games.filter((game) => game.isLive).length;
    const oddsCount = games.filter((game) => game.hasOdds).length;

    if (!games.length) {
      return makeJsonResponse(
        makeEmptyPayload(
          mode === "worldcup" ? "Sem jogos da Copa 2026" : "Sem jogos de hoje",
          `Nenhuma fixture retornada pela OpticOdds para sport=${SPORT}`,
          {
            id: mode,
            season: mode === "worldcup" ? WORLD_CUP_SEASON : new Date().getFullYear(),
            name: mode === "worldcup" ? "Copa 2026" : "Jogos de hoje",
            date,
          }
        )
      );
    }

    return makeJsonResponse({
      games,
      updatedAt: new Date().toISOString(),
      message: liveCount ? "Jogos ao vivo no radar OpticOdds" : "Jogos carregados pela OpticOdds",
      debug: `${games.length} jogos carregados. ${oddsCount} com odds oficiais OpticOdds.`,
      tournament: {
        id: mode,
        season: mode === "worldcup" ? WORLD_CUP_SEASON : new Date().getFullYear(),
        name: mode === "worldcup" ? "Copa 2026" : "Jogos de hoje",
        date,
      },
    });
  } catch (error) {
    return makeJsonResponse(
      makeEmptyPayload(
        mode === "worldcup" ? "Falha ao carregar Copa 2026" : "Falha ao carregar jogos de hoje",
        error?.message || "Falha inesperada na OpticOdds"
      )
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
