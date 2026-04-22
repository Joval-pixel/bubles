export async function getJogos() {
  const res = await fetch("https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all", {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "SUA_API_KEY_AQUI",
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
    },
    cache: "no-store"
  });

  const data = await res.json();

  return data.response;
}
