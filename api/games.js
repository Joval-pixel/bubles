const API_BASE = "https://v3.football.api-sports.io";
const API_KEY =
  process.env.API_KEY ||
  process.env.APISPORTS_KEY ||
  process.env.API_FOOTBALL_KEY ||
  "";

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

  const parsed = parseFloat(String(value).replace("%", "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

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
  return Array.isArray(payload.response) ? payload.response : [];
};

const getStatistic = (statistics, aliases) => {
  const wanted = aliases.map(normalizeText);

  for (const entry of statistics ?? []) {
    if (wanted.includes(normalizeText(entry?.type))) {
      return toNumber(entry?.value);
    }
  }

  return 0;
};

const extractHomeStats = (statisticsResponse, homeTeamId) => {
  const homeEntry =
    statisticsResponse.find((entry) => entry?.team?.id === homeTeamId) ?? statisticsResponse[0];

  const stats = homeEntry?.statistics ?? [];

  return {
    attacks: getStatistic(stats, ["Attacks", "Total Attacks"]),
    dangerous: getStatistic(stats, ["Dangerous Attacks", "Dangerous attacks"]),
    shots: getStatistic(stats, ["Total Shots", "Shots on Goal"]),
    corners: getStatistic(stats, ["Corner Kicks", "Corners"]),
    possession: getStatistic(stats, ["Ball Possession", "Possession"]),
  };
};

const findHomeOdd = (oddsEntries, homeName) => {
  const normalizedHome = normalizeText(homeName);

  for (const item of oddsEntries ?? []) {
    for (const bookmaker of item?.bookmakers ?? []) {
      for (const bet of bookmaker?.bets ?? []) {
        const betName = normalizeText(bet?.name);
        const isHomeMarket =
          betName.includes("match winner") ||
          betName === "winner" ||
          betName === "1x2";

        if (!isHomeMarket) {
          continue;
        }

        for (const value of bet?.values ?? []) {
          const label = normalizeText(value?.value ?? value?.label);

          if (label === "home" || label === "1" || label === normalizedHome) {
            const odd = toNumber(value?.odd);

            if (odd > 1) {
              return odd;
            }
          }
        }
      }
    }
  }

  return 0;
};

const buildOddsMap = (oddsResponse) => {
  const map = new Map();

  for (const item of oddsResponse ?? []) {
    const fixtureId = item?.fixture?.id;
    const homeName = item?.teams?.home?.name ?? "";
    const homeOdd = findHomeOdd([item], homeName);

    if (fixtureId && homeOdd > 1) {
      map.set(fixtureId, homeOdd);
    }
  }

  return map;
};

const calculateEv = ({ attacks, dangerous, shots, corners, possession, minute, oddHome }) => {
  const pressure =
    attacks * 0.03 +
    dangerous * 0.07 +
    shots * 0.06 +
    corners * 0.04 +
    possession * 0.01 +
    minute * 0.02;

  const probability = Math.min(0.85, pressure / 10);
  const ev = probability * oddHome - 1;

  return {
    pressure,
    probability,
    ev,
  };
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
      "Cache-Control": "s-maxage=15, stale-while-revalidate=30",
    },
  });

export async function GET(_request) {
  if (!API_KEY) {
    return makeJsonResponse(
      makeEmptyPayload(
        "Sem jogos ao vivo",
        "API_KEY ausente no ambiente do servidor"
      )
    );
  }

  try {
    const liveFixtures = await fetchFromApi("/fixtures?live=all");

    if (!liveFixtures.length) {
      return makeJsonResponse(
        makeEmptyPayload(
          "Sem jogos ao vivo",
          "Nenhum fixture ao vivo retornado pela API"
        )
      );
    }

    let oddsMap = new Map();

    try {
      const liveOdds = await fetchFromApi("/odds/live");
      oddsMap = buildOddsMap(liveOdds);
    } catch (_error) {
      oddsMap = new Map();
    }

    const statisticsResults = await Promise.allSettled(
      liveFixtures.map((fixture) =>
        fetchFromApi(`/fixtures/statistics?fixture=${fixture.fixture.id}`)
      )
    );

    const statisticsMap = new Map();

    statisticsResults.forEach((result, index) => {
      if (result.status === "fulfilled") {
        statisticsMap.set(liveFixtures[index].fixture.id, result.value);
      }
    });

    if (!oddsMap.size) {
      const fallbackOddsResults = await Promise.allSettled(
        liveFixtures.map((fixture) => fetchFromApi(`/odds?fixture=${fixture.fixture.id}`))
      );

      fallbackOddsResults.forEach((result, index) => {
        if (result.status !== "fulfilled") {
          return;
        }

        const fixture = liveFixtures[index];
        const oddHome = findHomeOdd(result.value, fixture?.teams?.home?.name ?? "");

        if (oddHome > 1) {
          oddsMap.set(fixture.fixture.id, oddHome);
        }
      });
    }

    const games = liveFixtures
      .map((fixture) => {
        const fixtureId = fixture?.fixture?.id;
        const minute = toNumber(fixture?.fixture?.status?.elapsed);
        const homeId = fixture?.teams?.home?.id;
        const homeName = fixture?.teams?.home?.name ?? "";
        const awayName = fixture?.teams?.away?.name ?? "";
        const leagueName = fixture?.league?.name ?? "";

        const statsPayload = statisticsMap.get(fixtureId) ?? [];
        const stats = extractHomeStats(statsPayload, homeId);
        const oddHome = oddsMap.get(fixtureId) ?? 0;

        if (!fixtureId || !homeName || !awayName || oddHome <= 1) {
          return null;
        }

        const { pressure, probability, ev } = calculateEv({
          ...stats,
          minute,
          oddHome,
        });

        if (!(ev > 0)) {
          return null;
        }

        return {
          id: fixtureId,
          game: `${homeName} x ${awayName}`,
          league: leagueName,
          minute,
          pressure,
          probability,
          ev,
          oddHome,
          attacks: stats.attacks,
          dangerous: stats.dangerous,
          shots: stats.shots,
          corners: stats.corners,
          possession: stats.possession,
        };
      })
      .filter(Boolean)
      .sort((left, right) => right.ev - left.ev);

    return makeJsonResponse({
      games,
      updatedAt: new Date().toISOString(),
      message: games.length ? "ok" : "Sem jogos ao vivo",
      debug: games.length
        ? ""
        : "Fixtures encontrados, mas sem odds validas ou sem EV positivo",
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
