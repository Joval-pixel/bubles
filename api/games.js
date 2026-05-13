
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
        return makeJsonResponse(
          makeEmptyPayload(
            "Sem jogos de hoje retornados",
            `Nenhum fixture retornado pela API-Football para date=${date}`,
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

      return makeJsonResponse({
        games,
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
      return makeJsonResponse(
        makeEmptyPayload(
          "Sem jogos da Copa retornados",
          "Nenhum fixture da Copa 2026 retornado pela API-Football"
        )
      );
    }

    return makeJsonResponse({
      games,
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
