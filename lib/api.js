export async function getJogos() {
  try {
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

    const data = await res.json();

    return data.response || []; // 👈 ESSENCIAL
  } catch (error) {
    console.error("Erro ao buscar jogos:", error);
    return [];
  }
}
