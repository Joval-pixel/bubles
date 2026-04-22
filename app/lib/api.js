export async function getJogos() {
  try {
    const hoje = new Date().toISOString().split("T")[0];

    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${hoje}`,
      {
        headers: {
          "x-apisports-key": process.env.API_KEY,
        },
        cache: "no-store",
      }
    );

    const data = await res.json();

    console.log(data); // ajuda debug

    return data.response || [];
  } catch (e) {
    console.log("ERRO API:", e);
    return [];
  }
}
