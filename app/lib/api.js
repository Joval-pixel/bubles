export async function getJogos() {
  const res = await fetch("https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all", {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "80f66ec27fd8c6e19f32bf661be443697e561810556491ebc6c2897109448d67",
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
    },
    cache: "no-store"
  });

  const data = await res.json();

  return data.response;
}
