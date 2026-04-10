const API_KEY = "SUA_API_KEY_AQUI";

let jogos = [];

async function carregarJogos() {

  const res = await fetch("https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all", {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
    }
  });

  const data = await res.json();
  jogos = data.response;

  let select = document.getElementById("listaJogos");
  select.innerHTML = "";

  jogos.forEach((jogo, index) => {
    let option = document.createElement("option");
    option.value = index;
    option.text = jogo.teams.home.name + " x " + jogo.teams.away.name;
    select.appendChild(option);
  });

  atualizar();
}

async function pegarStats(id) {

  const res = await fetch(`https://api-football-v1.p.rapidapi.com/v3/fixtures/statistics?fixture=${id}`, {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": API_KEY,
      "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
    }
  });

  const data = await res.json();

  let home = data.response[0].statistics;
  let away = data.response[1].statistics;

  function pegarValor(stats, nome) {
    let item = stats.find(s => s.type === nome);
    return item ? parseFloat(item.value) || 0 : 0;
  }

  return {
    ataques:
      pegarValor(home, "Dangerous Attacks") +
      pegarValor(away, "Dangerous Attacks"),

    chutes:
      pegarValor(home, "Shots on Goal") +
      pegarValor(away, "Shots on Goal"),

    escanteios:
      pegarValor(home, "Corner Kicks") +
      pegarValor(away, "Corner Kicks"),

    posse:
      (pegarValor(home, "Ball Possession") +
        pegarValor(away, "Ball Possession")) / 2
  };
}

function calcular(stats) {
  return (
    stats.ataques * 0.3 +
    stats.chutes * 0.25 +
    stats.escanteios * 0.2 +
    stats.posse * 0.25
  );
}

function verificar(stats, score) {
  if (score > 70 && stats.ataques > 20 && stats.chutes >= 5) {
    return "🔥 ENTRAR OVER 1.5";
  }
  return "⏳ AGUARDAR";
}

async function atualizar() {

  let index = document.getElementById("listaJogos").value || 0;

  if (!jogos[index]) return;

  let jogo = jogos[index];

  document.getElementById("jogo").innerHTML =
    jogo.teams.home.name + " x " + jogo.teams.away.name;

  let stats = await pegarStats(jogo.fixture.id);

  let score = calcular(stats);
  let sinal = verificar(stats, score);

  let el = document.getElementById("sinal");
  el.innerHTML = sinal;

  if (sinal.includes("ENTRAR")) {
    el.className = "entrar alerta";
  } else {
    el.className = "aguardar";
  }

  let data = [
    { categoria: "Pressão", valor: score },
    { categoria: "Over 1.5", valor: score - 10 },
    { categoria: "Over 2.5", valor: score - 20 },
    { categoria: "BTTS", valor: score - 15 }
  ];

  xAxis.data.setAll(data);
  series.data.setAll(data);
}

setInterval(atualizar, 15000);
carregarJogos();
