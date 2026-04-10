const API_KEY = "SUA_API_KEY_AQUI";

async function buscarJogadores() {

  const res = await fetch(
    "https://free-api-live-football-data.p.rapidapi.com/football-players-search?search=m",
    {
      method: "GET",
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com"
      }
    }
  );

  const data = await res.json();

  console.log(data);

  mostrarNaTela(data);
}

function mostrarNaTela(data) {

  let div = document.getElementById("resultado");
  div.innerHTML = "";

  data.response?.forEach(player => {
    let p = document.createElement("p");
    p.innerHTML = player.name;
    div.appendChild(p);
  });
}

buscarJogadores();
