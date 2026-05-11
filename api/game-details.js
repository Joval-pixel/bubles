const API_BASE = "https://v3.football.api-sports.io";
const API_KEY =
  process.env.API_KEY ||
  process.env.APISPORTS_KEY ||
  process.env.API_FOOTBALL_KEY ||
  "";
const API_TIMEZONE = process.env.API_FOOTBALL_TIMEZONE || "America/Sao_Paulo";

const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);

const toNumber = (value) => {
  if (value === null || value === undefined || value === "" || value === "null") {
    return 0;
  }

  const parsed = Number.parseFloat(String(value).replace("%", "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch (_error) {
    return { response: [], errors: {} };
  }
};

const makeJsonResponse = (
  payload,
  status = 200,
  cacheControl = "s-maxage=900, stale-while-revalidate=1800"
) =>
  Response.json(payload, {
    status,
    headers: {
      "Cache-Control": cacheControl,
    },
  });

const humanizeApiError = (message) => {
  const text = String(message ?? "");

  if (text.includes("REQUESTS")) {
    return "Limite diario da API-Football atingido no plano atual";
  }

  if (text.includes("PLAN")) {
    return "Seu plano atual da API-Football nao cobre este detalhe";
  }

  if (text.includes("KEY")) {
    return "Chave da API-Football invalida ou inativa";
  }

  return text || "Falha ao carregar detalhes do jogo";
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

const flattenStandings = (standingsResponse) =>
  standingsResponse.flatMap((entry) => {
    const groups = entry?.league?.standings;

    if (!Array.isArray(groups)) {
      return [];
    }

    return groups.flatMap((group) => (Array.isArray(group) ? group : [group]));
  });

const normalizeStanding = (row) => {
  if (!row) {
    return null;
  }

  return {
    rank: row.rank || null,
    group: row.group || "",
    form: row.form || "",
    points: toNumber(row.points),
    played: toNumber(row.all?.played),
    wins: toNumber(row.all?.win),
    draws: toNumber(row.all?.draw),
    losses: toNumber(row.all?.lose),
    goalsFor: toNumber(row.all?.goals?.for),
    goalsAgainst: toNumber(row.all?.goals?.against),
    goalsDiff: toNumber(row.goalsDiff),
  };
};

const getTeamGoals = (fixture, teamId) => {
  const isHome = Number(fixture?.teams?.home?.id) === Number(teamId);
  const teamGoals = isHome ? fixture?.goals?.home : fixture?.goals?.away;
  const opponentGoals = isHome ? fixture?.goals?.away : fixture?.goals?.home;

  return {
    isHome,
    teamGoals: toNumber(teamGoals),
    opponentGoals: toNumber(opponentGoals),
  };
};

const normalizeLastFixture = (fixture, teamId) => {
  const { isHome, teamGoals, opponentGoals } = getTeamGoals(fixture, teamId);
  const statusShort = fixture?.fixture?.status?.short || "";
  const isFinished = FINISHED_STATUSES.has(statusShort);
  const opponent = isHome ? fixture?.teams?.away?.name : fixture?.teams?.home?.name;
  let result = "P";
  let resultKey = "pending";

  if (isFinished) {
    if (teamGoals > opponentGoals) {
      result = "V";
      resultKey = "win";
    } else if (teamGoals < opponentGoals) {
      result = "D";
      resultKey = "loss";
    } else {
      result = "E";
      resultKey = "draw";
    }
  }

  return {
    id: fixture?.fixture?.id,
    date: fixture?.fixture?.date || "",
    league: fixture?.league?.name || "",
    opponent: opponent || "Adversario",
    homeTeam: fixture?.teams?.home?.name || "",
    awayTeam: fixture?.teams?.away?.name || "",
    score: `${fixture?.goals?.home ?? "-"} x ${fixture?.goals?.away ?? "-"}`,
    result,
    resultKey,
    isHome,
    status: statusShort,
  };
};

const summarizeLastMatches = (matches) =>
  matches.reduce(
    (summary, match) => {
      const [homeGoals, awayGoals] = String(match.score)
        .split("x")
        .map((value) => toNumber(value.trim()));
      const teamGoals = match.isHome ? homeGoals : awayGoals;
      const opponentGoals = match.isHome ? awayGoals : homeGoals;

      summary.played += match.resultKey === "pending" ? 0 : 1;
      summary.goalsFor += teamGoals;
      summary.goalsAgainst += opponentGoals;

      if (match.resultKey === "win") {
        summary.wins += 1;
      } else if (match.resultKey === "loss") {
        summary.losses += 1;
      } else if (match.resultKey === "draw") {
        summary.draws += 1;
      }

      return summary;
    },
    { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 }
  );

const buildRecentForm = (summary) => {
  const played = Number(summary?.played || 0);
  const wins = Number(summary?.wins || 0);
  const draws = Number(summary?.draws || 0);
  const losses = Number(summary?.losses || 0);
  const goalsFor = Number(summary?.goalsFor || 0);
  const goalsAgainst = Number(summary?.goalsAgainst || 0);
  const points = wins * 3 + draws;
  const pointsPerGame = played ? points / played : 0;
  const goalsDiff = goalsFor - goalsAgainst;
  const unbeaten = wins + draws;
  const isStrong =
    played >= 5 &&
    losses <= 2 &&
    goalsDiff >= 0 &&
    (wins >= 5 || pointsPerGame >= 1.8 || unbeaten >= 8);
  const isWeak = played >= 5 && wins <= 2 && (losses >= 5 || pointsPerGame <= 0.9);

  return {
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalsDiff,
    points,
    pointsPerGame: Number(pointsPerGame.toFixed(2)),
    unbeaten,
    level: isStrong ? "strong" : isWeak ? "weak" : "neutral",
    isStrong,
    isWeak,
  };
};

const makeTeamDetails = (teamId, teamName, standing, fixtures) => {
  const last10 = fixtures.slice(0, 10).map((fixture) => normalizeLastFixture(fixture, teamId));
  const recentSummary = summarizeLastMatches(last10);
  const recentForm = buildRecentForm(recentSummary);
  const fixtureName =
    fixtures.find((fixture) => Number(fixture?.teams?.home?.id) === Number(teamId))?.teams?.home?.name ||
    fixtures.find((fixture) => Number(fixture?.teams?.away?.id) === Number(teamId))?.teams?.away?.name ||
    "";

  return {
    id: Number(teamId),
    name: teamName || fixtureName,
    standing,
    last10,
    recentSummary,
    recentForm,
    summary: {
      played: standing?.played || recentSummary.played,
      wins: standing?.wins || recentSummary.wins,
      draws: standing?.draws || recentSummary.draws,
      losses: standing?.losses || recentSummary.losses,
      goalsFor: standing?.goalsFor || recentSummary.goalsFor,
      goalsAgainst: standing?.goalsAgainst || recentSummary.goalsAgainst,
    },
  };
};

const getSearchParams = (request) => {
  const url = new URL(request?.url || "https://bubles.local/api/game-details");

  return {
    home: Number.parseInt(url.searchParams.get("home") || "", 10),
    away: Number.parseInt(url.searchParams.get("away") || "", 10),
    league: Number.parseInt(url.searchParams.get("league") || "", 10),
    season: Number.parseInt(url.searchParams.get("season") || "", 10),
  };
};

export async function GET(request) {
  if (!API_KEY) {
    return makeJsonResponse(
      { message: "API_KEY ausente", debug: "Configure API_KEY no ambiente do servidor" },
      200,
      "no-store"
    );
  }

  const { home, away, league, season } = getSearchParams(request);

  if (!home || !away) {
    return makeJsonResponse(
      { message: "Times ausentes", debug: "Informe home e away na URL" },
      400,
      "no-store"
    );
  }

  try {
    const standingsPromise =
      league && season
        ? fetchFromApi(`/standings?league=${league}&season=${season}`).catch((error) => ({
            error: humanizeApiError(error?.message),
            response: [],
          }))
        : Promise.resolve([]);
    const [standingsRaw, homeFixtures, awayFixtures] = await Promise.all([
      standingsPromise,
      fetchFromApi(`/fixtures?team=${home}&last=10&timezone=${encodeURIComponent(API_TIMEZONE)}`),
      fetchFromApi(`/fixtures?team=${away}&last=10&timezone=${encodeURIComponent(API_TIMEZONE)}`),
    ]);
    const standingsResponse = Array.isArray(standingsRaw) ? standingsRaw : standingsRaw.response || [];
    const standingsError = Array.isArray(standingsRaw) ? "" : standingsRaw.error || "";
    const rows = flattenStandings(standingsResponse);
    const homeStanding = normalizeStanding(rows.find((row) => Number(row?.team?.id) === home));
    const awayStanding = normalizeStanding(rows.find((row) => Number(row?.team?.id) === away));

    return makeJsonResponse({
      updatedAt: new Date().toISOString(),
      message: standingsError || "Detalhes do jogo carregados",
      teams: {
        home: makeTeamDetails(home, rows.find((row) => Number(row?.team?.id) === home)?.team?.name, homeStanding, homeFixtures),
        away: makeTeamDetails(away, rows.find((row) => Number(row?.team?.id) === away)?.team?.name, awayStanding, awayFixtures),
      },
    });
  } catch (error) {
    return makeJsonResponse(
      {
        message: humanizeApiError(error?.message),
        debug: error?.message || "Falha ao carregar detalhes",
      },
      200,
      "s-maxage=120, stale-while-revalidate=240"
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
