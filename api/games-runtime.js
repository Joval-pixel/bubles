import { GET as originalGet } from "./games.js";

const API_BASE = "https://v3.football.api-sports.io";
const API_KEY =
  process.env.API_KEY ||
  process.env.APISPORTS_KEY ||
  process.env.API_FOOTBALL_KEY ||
  "";
const API_TIMEZONE = process.env.API_FOOTBALL_TIMEZONE || "America/Sao_Paulo";
const WORLD_CUP_LEAGUE_ID = Number.parseInt(process.env.WORLD_CUP_LEAGUE_ID || "1", 10) || 1;
const WORLD_CUP_SEASON = Number.parseInt(process.env.WORLD_CUP_SEASON || "2026", 10) || 2026;

const LIVE_STATUSES = new Set(["1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE"]);
const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);

const WORLD_CUP_FALLBACK_GROUPS = [
  { group: "A", teams: ["Mexico", "South Korea", "South Africa", "Czechia"] },
  { group: "B", teams: ["Canada", "Switzerland", "Qatar", "Bosnia and Herzegovina"] },
  { group: "C", teams: ["Brazil", "Morocco", "Scotland", "Haiti"] },
  { group: "D", teams: ["USA", "Paraguay", "Australia", "Turkiye"] },
  { group: "E", teams: ["Germany", "Ecuador", "Cote d'Ivoire", "Curacao"] },
  { group: "F", teams: ["Netherlands", "Japan", "Sweden", "Tunisia"] },
  { group: "G", teams: ["Belgium", "Iran", "Egypt", "New Zealand"] },
  { group: "H", teams: ["Spain", "Uruguay", "Saudi Arabia", "Cape Verde"] },
  { group: "I", teams: ["France", "Senegal", "Norway", "Iraq"] },
  { group: "J", teams: ["Argentina", "Austria", "Algeria", "Jordan"] },
  { group: "K", teams: ["Portugal", "Colombia", "Uzbekistan", "DR Congo"] },
  { group: "L", teams: ["England", "Croatia", "Panama", "Ghana"] },
];

const WORLD_CUP_FALLBACK_HOSTS = [
  { city: "Mexico City", venue: "Mexico City Stadium" },
  { city: "Guadalajara", venue: "Guadalajara Stadium" },
  { city: "Monterrey", venue: "Monterrey Stadium" },
  { city: "Toronto", venue: "Toronto Stadium" },
  { city: "Vancouver", venue: "Vancouver Stadium" },
  { city: "Los Angeles", venue: "Los Angeles Stadium" },
  { city: "Seattle", venue: "Seattle Stadium" },
  { city: "San Francisco Bay Area", venue: "Bay Area Stadium" },
  { city: "Dallas", venue: "Dallas Stadium" },
  { city: "Houston", venue: "Houston Stadium" },
  { city: "Kansas City", venue: "Kansas City Stadium" },
  { city: "Miami", venue: "Miami Stadium" },
  { city: "Atlanta", venue: "Atlanta Stadium" },
  { city: "Boston", venue: "Boston Stadium" },
  { city: "Philadelphia", venue: "Philadelphia Stadium" },
  { city: "New York / New Jersey", venue: "New York New Jersey Stadium" },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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

const getMode = (request) => {
  try {
    const url = new URL(request?.url || "https://bubles.local/api/games");
    return url.searchParams.get("mode") === "today" ? "today" : "worldcup";
  } catch (_error) {
    return "worldcup";
  }
};

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch (_error) {
    return {};
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

  if (text.includes("KEY")) {
    return "Chave da API-Football invalida ou inativa";
  }

  return text || "Falha ao carregar Copa 2026";
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

const createOption = (code, label, probability) => ({
  code,
  label,
  probability: clamp(probability, 0.03, 0.94),
  odd: probability > 0 ? 1 / probability : 0,
  bookmaker: "Modelo Bubles",
  source: "estimate",
});

const buildEstimatedMarkets = (fixtureId, homeTeam, awayTeam) => {
  const seed = stableSeed(`${fixtureId}-${homeTeam}-${awayTeam}`);
  const drawBase = 0.27 + (stableSeed(`${fixtureId}-draw`) - 0.5) * 0.04;
  const homeBase = 0.365 + (seed - 0.5) * 0.16;
  const awayBase = 1 - drawBase - homeBase;
  const resultOptions = normalizeOptions([
    createOption("1", homeTeam, homeBase),
    createOption("X", "Empate", drawBase),
    createOption("2", awayTeam, awayBase),
  ]).sort((left, right) => right.probability - left.probability);
  const overBase = clamp(0.46 + (stableSeed(`${fixtureId}-goals`) - 0.5) * 0.22, 0.31, 0.76);
  const bttsBase = clamp(0.44 + (stableSeed(`${fixtureId}-btts`) - 0.5) * 0.2, 0.28, 0.78);
  const goalsOptions = normalizeOptions([
    createOption("O2.5", "Mais de 2.5 gols", overBase),
    createOption("U2.5", "Menos de 2.5 gols", 1 - overBase),
  ]).sort((left, right) => right.probability - left.probability);
  const bttsOptions = normalizeOptions([
    createOption("BTTS-S", "Ambas marcam - Sim", bttsBase),
    createOption("BTTS-N", "Um dos times nao marca", 1 - bttsBase),
  ]).sort((left, right) => right.probability - left.probability);

  const resultLeader = resultOptions[0];
  const goalsLeader = goalsOptions[0];
  const bttsLeader = bttsOptions[0];

  return {
    resultOptions,
    betMarkets: [
      {
        id: `result-${fixtureId}`,
        name: "Resultado final",
        category: "Resultado",
        bookmakersCount: 0,
        confidence: Math.max(0, resultOptions[0].probability - (resultOptions[1]?.probability || 0)),
        leader: resultLeader,
        options: resultOptions,
      },
      {
        id: `goals-${fixtureId}`,
        name: "Total de gols 2.5",
        category: "Gols",
        bookmakersCount: 0,
        confidence: Math.max(0, goalsOptions[0].probability - (goalsOptions[1]?.probability || 0)),
        leader: goalsLeader,
        options: goalsOptions,
      },
      {
        id: `btts-${fixtureId}`,
        name: "Ambas as equipes marcam",
        category: "Gols",
        bookmakersCount: 0,
        confidence: Math.max(0, bttsOptions[0].probability - (bttsOptions[1]?.probability || 0)),
        leader: bttsLeader,
        options: bttsOptions,
      },
    ],
    aiInsights: {
      headline: `Melhor palpite: ${resultLeader.label}`,
      main: `Chance estimada: ${Math.round(resultLeader.probability * 100)}% | Odd atual: ${resultLeader.odd.toFixed(2).replace(".", ",")}.`,
      confidence: "Estimativa local do Bubles",
      result: `Resultado: ${resultLeader.label} em destaque.`,
      goals: `Gols: ${goalsLeader.label} aparece como melhor linha.`,
      btts: `Ambas marcam: ${bttsLeader.label}.`,
      combo: "Combinada: aguarde odds oficiais para validar entradas mais agressivas.",
      action: "Use como apoio visual ate a API oficial voltar a responder.",
      risk: "Risco medio: mercado exibido com estimativa local.",
      score: Math.round(resultLeader.probability * 100),
      warning: "Use como apoio para analise. Nao existe aposta garantida.",
      why: [
        "Calendario mantido ativo mesmo sem odds oficiais.",
        "A leitura considera mandante, visitante e distribuicao neutra de empate.",
        "Quando a API voltar, o radar retoma os mercados completos automaticamente.",
      ],
      checklist: [
        "Confirme data e horario antes de apostar.",
        "Veja se as odds oficiais ja voltaram para o jogo.",
        "Evite entradas fortes enquanto a API estiver em modo local.",
      ],
      avoidIf: [
        "Evite se a API oficial ainda estiver sem atualizar o confronto.",
        "Evite se o mercado oficial divergir muito da estimativa local.",
      ],
      bestMarkets: [
        {
          category: "Resultado",
          family: "Vitoria simples",
          market: "Resultado final",
          pick: resultLeader.label,
          probability: resultLeader.probability,
          odd: resultLeader.odd,
          note: "Estimativa local do Bubles",
        },
        {
          category: "Gols",
          family: "Over gols",
          market: "Total de gols 2.5",
          pick: goalsLeader.label,
          probability: goalsLeader.probability,
          odd: goalsLeader.odd,
          note: "Estimativa local do Bubles",
        },
      ],
    },
  };
};

const getFixtureCommenceTime = (fixture) => {
  if (fixture?.fixture?.date) {
    return fixture.fixture.date;
  }

  if (fixture?.fixture?.timestamp) {
    return new Date(fixture.fixture.timestamp * 1000).toISOString();
  }

  return null;
};

const getScoreLine = (fixture) => {
  const home = fixture?.goals?.home;
  const away = fixture?.goals?.away;

  if (home === null || home === undefined || away === null || away === undefined) {
    return "Pre-jogo";
  }

  return `${home} x ${away}`;
};

const buildCompactGame = (fixture) => {
  const fixtureId = fixture?.fixture?.id;
  const homeTeam = fixture?.teams?.home?.name || "A definir";
  const awayTeam = fixture?.teams?.away?.name || "A definir";
  const statusShort = fixture?.fixture?.status?.short || "NS";
  const isLive = LIVE_STATUSES.has(statusShort);
  const isFinished = FINISHED_STATUSES.has(statusShort);
  const minute = isLive ? clamp(Number(fixture?.fixture?.status?.elapsed || 0), 1, 130) : 0;
  const commenceTime = getFixtureCommenceTime(fixture);
  const estimates = buildEstimatedMarkets(fixtureId, homeTeam, awayTeam);
  const primary = estimates.resultOptions[0];

  return {
    id: fixtureId,
    game: `${homeTeam} x ${awayTeam}`,
    homeTeam,
    awayTeam,
    homeTeamId: fixture?.teams?.home?.id || null,
    awayTeamId: fixture?.teams?.away?.id || null,
    homeLogo: fixture?.teams?.home?.logo || "",
    awayLogo: fixture?.teams?.away?.logo || "",
    leagueId: fixture?.league?.id || WORLD_CUP_LEAGUE_ID,
    season: fixture?.league?.season || WORLD_CUP_SEASON,
    league: fixture?.league?.name || "FIFA World Cup 2026",
    country: fixture?.league?.country || "World",
    round: fixture?.league?.round || "Copa do Mundo 2026",
    stage: String(fixture?.league?.round || "").toLowerCase().includes("group") ? "groups" : "worldcup",
    venue: fixture?.fixture?.venue?.name || "",
    city: fixture?.fixture?.venue?.city || "",
    minute,
    minuteLabel: isLive ? "ao vivo" : isFinished ? "encerrado" : "pre",
    ev: 0,
    oddHome: Number(primary.odd.toFixed(2)),
    probability: Number(primary.probability.toFixed(4)),
    marketProbability: Number(primary.probability.toFixed(4)),
    fairOdd: Number((1 / primary.probability).toFixed(2)),
    marketEdge: 0,
    bestBookmaker: "Modelo Bubles",
    pickCode: primary.code,
    pickLabel: primary.label,
    hasOdds: false,
    allowedBookmakers: [],
    hasTargetBookmaker: false,
    isPositiveEv: false,
    isLive,
    isFinished,
    bubbleValue: Number(primary.probability.toFixed(4)),
    scoreLine: getScoreLine(fixture),
    updatedAt: new Date().toISOString(),
    commenceTime,
    statusShort,
    source: "Bubles fallback runtime",
    confidence: "estimate",
    leaderGap: Number(
      Math.max(0, primary.probability - (estimates.resultOptions[1]?.probability || 0)).toFixed(4)
    ),
    marketOptions: estimates.resultOptions.map((option) => ({
      ...option,
      odd: Number(option.odd.toFixed(2)),
      probability: Number(option.probability.toFixed(4)),
    })),
    betMarkets: estimates.betMarkets.map((market) => ({
      ...market,
      confidence: Number(market.confidence.toFixed(4)),
      leader: {
        ...market.leader,
        odd: Number(market.leader.odd.toFixed(2)),
        probability: Number(market.leader.probability.toFixed(4)),
      },
      options: market.options.map((option) => ({
        ...option,
        odd: Number(option.odd.toFixed(2)),
        probability: Number(option.probability.toFixed(4)),
      })),
    })),
    aiInsights: estimates.aiInsights,
    totalMarkets: estimates.betMarkets.length,
    displayMarketCategory: "Resultado",
    displayMarketName: "Resultado final",
    displayPickLabel: primary.label,
    displayProbability: Number(primary.probability.toFixed(4)),
    displayOdd: Number(primary.odd.toFixed(2)),
  };
};

const sortGames = (games) =>
  [...games].sort((left, right) => {
    if (Number(right.isLive) !== Number(left.isLive)) {
      return Number(right.isLive) - Number(left.isLive);
    }

    return new Date(left.commenceTime || 0).getTime() - new Date(right.commenceTime || 0).getTime();
  });

const buildFallbackFixtures = () => {
  const teamIds = new Map();
  let nextTeamId = 2026001;
  let nextFixtureId = 2026101;

  const getTeamId = (name) => {
    if (!teamIds.has(name)) {
      teamIds.set(name, nextTeamId);
      nextTeamId += 1;
    }

    return teamIds.get(name);
  };

  return WORLD_CUP_FALLBACK_GROUPS.flatMap((groupData, groupIndex) => {
    const pairs = [
      [0, 2],
      [1, 3],
    ];

    return pairs.map(([homeIndex, awayIndex], pairIndex) => {
      const host = WORLD_CUP_FALLBACK_HOSTS[(groupIndex * pairs.length + pairIndex) % WORLD_CUP_FALLBACK_HOSTS.length];
      const matchNumber = groupIndex * pairs.length + pairIndex;
      const kickoffDate = new Date(Date.UTC(2026, 5, 11 + Math.floor(matchNumber / 2), 17 + pairIndex * 3, 0, 0));
      const homeTeam = groupData.teams[homeIndex];
      const awayTeam = groupData.teams[awayIndex];

      return {
        fixture: {
          id: nextFixtureId++,
          date: kickoffDate.toISOString(),
          timestamp: Math.floor(kickoffDate.getTime() / 1000),
          status: {
            short: "NS",
            elapsed: null,
          },
          venue: {
            name: host.venue,
            city: host.city,
          },
        },
        league: {
          id: WORLD_CUP_LEAGUE_ID,
          season: WORLD_CUP_SEASON,
          name: "FIFA World Cup 2026",
          country: "World",
          round: `Group ${groupData.group}`,
        },
        teams: {
          home: {
            id: getTeamId(homeTeam),
            name: homeTeam,
            logo: "",
          },
          away: {
            id: getTeamId(awayTeam),
            name: awayTeam,
            logo: "",
          },
        },
        goals: {
          home: null,
          away: null,
        },
      };
    });
  });
};

const buildWorldCupPayload = (games, message, debug) => ({
  games,
  updatedAt: new Date().toISOString(),
  message,
  debug,
  tournament: {
    id: WORLD_CUP_LEAGUE_ID,
    season: WORLD_CUP_SEASON,
    name: "FIFA World Cup 2026",
  },
});

const buildLocalFallbackPayload = (reason) =>
  buildWorldCupPayload(
    sortGames(buildFallbackFixtures().map(buildCompactGame)),
    "Calendario local da Copa 2026 carregado",
    reason
  );

const buildApiFallbackPayload = (fixtures, reason) =>
  buildWorldCupPayload(
    sortGames(fixtures.map(buildCompactGame)),
    "Calendario da Copa 2026 carregado com estimativa local",
    reason
  );

export async function GET(request) {
  const mode = getMode(request);

  if (mode === "today") {
    return originalGet(request);
  }

  if (!API_KEY) {
    return makeJsonResponse(
      buildLocalFallbackPayload(
        "API_KEY ausente no servidor. Exibindo um calendario local de emergencia para manter jogos, selecoes e tabela funcionando."
      )
    );
  }

  const originalResponse = await originalGet(request);
  const cacheControl =
    originalResponse.headers.get("Cache-Control") || "s-maxage=240, stale-while-revalidate=600";
  const originalPayload = await safeJson(originalResponse);

  if (Array.isArray(originalPayload?.games) && originalPayload.games.length) {
    return makeJsonResponse(originalPayload, originalResponse.status, cacheControl);
  }

  try {
    const fixtures = await fetchFromApi(
      `/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}&timezone=${encodeURIComponent(API_TIMEZONE)}`
    );

    if (fixtures.length) {
      return makeJsonResponse(
        buildApiFallbackPayload(
          fixtures,
          "A API-Football retornou o calendario da Copa 2026 sem odds oficiais suficientes. O site entrou em modo de estimativa local para nao deixar jogos e tabela vazios."
        ),
        200,
        cacheControl
      );
    }
  } catch (error) {
    return makeJsonResponse(
      buildLocalFallbackPayload(
        `A API-Football falhou e o site entrou no modo local da Copa 2026: ${humanizeApiError(error?.message)}`
      ),
      200,
      cacheControl
    );
  }

  return makeJsonResponse(
    buildLocalFallbackPayload(
      originalPayload?.debug ||
        originalPayload?.message ||
        "A API-Football nao retornou fixtures da Copa 2026. Exibindo um calendario local de emergencia."
    ),
    200,
    cacheControl
  );
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
