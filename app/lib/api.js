export async function getJogos() {
  const res = await fetch(
    "https://v3.football.api-sports.io/fixtures?date=2026-04-22&league=71&season=2024",
    {
      headers: {
        "x-apisports-key": process.env.API_KEY,
      },
    }
  );

  const data = await res.json();

  return data.response || [];
}
