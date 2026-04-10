let chart, series, xAxis;

am5.ready(function () {

  var root = am5.Root.new("chartdiv");

  chart = root.container.children.push(
    am5xy.XYChart.new(root, {})
  );

  xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "categoria"
    })
  );

  var yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {})
  );

  series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      valueYField: "valor",
      categoryXField: "categoria",
      xAxis: xAxis,
      yAxis: yAxis
    })
  );

  atualizar();
  setInterval(atualizar, 8000);
});

function calcular(stats) {
  return (
    stats.ataques * 0.3 +
    stats.chutes * 0.25 +
    stats.escanteios * 0.2 +
    stats.posse * 0.25
  );
}

function gerarJogoFake() {
  const jogos = [
    "Flamengo x Palmeiras",
    "Real Madrid x Barcelona",
    "Manchester City x Liverpool",
    "PSG x Bayern"
  ];

  return jogos[Math.floor(Math.random() * jogos.length)];
}

function gerarStats() {
  return {
    ataques: Math.random() * 50,
    chutes: Math.random() * 10,
    escanteios: Math.random() * 10,
    posse: Math.random() * 100
  };
}

function verificarSinal(stats, score) {

  if (
    score > 70 &&
    stats.ataques > 20 &&
    stats.chutes >= 5
  ) {
    return "🔥 ENTRAR AGORA";
  }

  return "⏳ AGUARDAR";
}

function atualizar() {

  let jogo = gerarJogoFake();
  let stats = gerarStats();

  let score = calcular(stats);
  let sinal = verificarSinal(stats, score);

  document.getElementById("jogo").innerHTML = jogo;

  let el = document.getElementById("sinal");
  el.innerHTML = sinal;

  if (sinal.includes("ENTRAR")) {
    el.className = "entrar alerta";

    let audio = new Audio("https://www.soundjay.com/buttons/beep-01a.mp3");
    audio.play();
  } else {
    el.className = "aguardar";
  }

  let data = [
    { categoria: "Pressão", valor: score },
    { categoria: "Over 1.5", valor: score - 10 },
    { categoria: "Over 2.5", valor: score - 20 },
    { categoria: "BTTS", valor: score - 15 },
    { categoria: "Escanteios", valor: score - 5 }
  ];

  xAxis.data.setAll(data);
  series.data.setAll(data);
}
