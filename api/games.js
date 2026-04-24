const API_BASE = "https://v3.football.api-sports.io";
const API_KEY =
  process.env.API_KEY ||
  process.env.APISPORTS_KEY ||
  process.env.API_FOOTBALL_KEY ||
  "";

const normalizeText = (value) =>
  String(value ?? "")
const fetchFromApi = async (path) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "x-apisports-key": process.env.API_KEY ?? "",
      "x-apisports-key": API_KEY,
    },
  });

  };
};

const makeEmptyPayload = (reason = "Sem jogos ao vivo") => ({
const makeEmptyPayload = (reason = "Sem jogos ao vivo", debug = "") => ({
  games: [],
  updatedAt: new Date().toISOString(),
  message: reason,
  debug,
});

export default async function handler(_req, res) {
  res.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=30");

  if (!process.env.API_KEY) {
    res.status(200).json(makeEmptyPayload());
  if (!API_KEY) {
    res.status(200).json(
      makeEmptyPayload(
        "Sem jogos ao vivo",
        "API_KEY ausente no ambiente do servidor"
      )
    );
    return;
  }

    const liveFixtures = await fetchFromApi("/fixtures?live=all");

    if (!liveFixtures.length) {
      res.status(200).json(makeEmptyPayload());
      res.status(200).json(
        makeEmptyPayload("Sem jogos ao vivo", "Nenhum fixture ao vivo retornado pela API")
      );
      return;
    }

      games,
      updatedAt: new Date().toISOString(),
      message: games.length ? "ok" : "Sem jogos ao vivo",
      debug: games.length
        ? ""
        : "Fixtures encontrados, mas sem odds válidas ou sem EV positivo",
    });
  } catch (_error) {
    res.status(200).json(makeEmptyPayload());
  } catch (error) {
    res.status(200).json(
      makeEmptyPayload("Sem jogos ao vivo", error?.message || "Falha inesperada")
    );
  }
}
