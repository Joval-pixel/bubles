export async function getJogos() {
  const res = await fetch(
    "https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all",
    {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": process.env.API_KEY,
        "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Erro ao buscar jogos");
  }

  const data = await res.json();
  return data.response;
}
