const toggleBtn = document.getElementById("toggleBtn");
const sidebar = document.getElementById("sidebar");
const closeBtn = document.getElementById("closeBtn");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.add("show");
});

closeBtn.addEventListener("click", () => {
  sidebar.classList.remove("show");
});

// Dados mockados (pode substituir pela API da Brapi)
const data = [
  { ticker: "ARML3", change: 26.44, volume: 99999 },
  { ticker: "SEQL3", change: 7.21, volume: 55555 },
  { ticker: "EMET11", change: 6.67, volume: 44444 },
  { ticker: "PDGR3", change: -6.69, volume: 22222 },
  { ticker: "MRVE3", change: -3.96, volume: 88888 },
  { ticker: "AZEV4", change: -1.82, volume: 11111 },
  { ticker: "VALE3", change: 0.47, volume: 1000000 },
  { ticker: "PETR4", change: 0.04, volume: 800000 },
  { ticker: "ITUB4", change: 2.55, volume: 600000 },
];

// Função para preencher listas
function preencherListas() {
  const highs = data
    .filter(d => d.change > 0)
    .sort((a, b) => b.change - a.change)
    .slice(0, 3);
  const lows = data
    .filter(d => d.change < 0)
    .sort((a, b) => a.change - b.change)
    .slice(0, 3);
  const volumes = [...data].sort((a, b) => b.volume - a.volume).slice(0, 3);

  const highsList = document.getElementById("highs");
  const lowsList = document.getElementById("lows");
  const volumesList = document.getElementById("volumes");

  highs.forEach(d => {
    const li = document.createElement("li");
    li.innerHTML = `${d.ticker} <b>+${d.change.toFixed(2)}%</b>`;
    highsList.appendChild(li);
  });

  lows.forEach(d => {
    const li = document.createElement("li");
    li.innerHTML = `${d.ticker} <b>${d.change.toFixed(2)}%</b>`;
    lowsList.appendChild(li);
  });

  volumes.forEach(d => {
    const li = document.createElement("li");
    li.innerHTML = `${d.ticker} <b>${d.change > 0 ? "+" : ""}${d.change.toFixed(2)}%</b>`;
    volumesList.appendChild(li);
  });
}

preencherListas();