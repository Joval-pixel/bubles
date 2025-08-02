const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];

async function fetchStockData() {
  const url = 'https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=100&token=5bTDfSmR2ieax6y7JUqDAD';

  try {
    const response = await fetch(url);
    const json = await response.json();
    const stocks = json.stocks;

    let todosZerados = stocks.every(s => parseFloat(s.changePercent) === 0 || isNaN(parseFloat(s.changePercent)));

    if (todosZerados) {
      console.warn("API retornou dados zerados. Usando fallback.");
      return gerarBolhasSimuladas();
    }

    bubbles = stocks.map(stock => {
      const change = parseFloat(stock.changePercent);
      const safeChange = isNaN(change) ? 0 : change;
      const radius = Math.max(25, Math.abs(safeChange) * 3.5 + 25);
      const color = safeChange > 0 ? "#00ff4c" : (safeChange < 0 ? "#ff1e1e" : "#888");
      const glow = safeChange > 0 ? "rgba(0,255,76,0.3)" : (safeChange < 0 ? "rgba(255,30,30,0.3)" : "rgba(180,180,180,0.2)");

      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius,
        symbol: stock.stock,
        change: safeChange.toFixed(2),
        color,
        glow
      };
    });
  } catch (error) {
    console.error("Erro ao buscar dados da API. Usando fallback.", error);
    gerarBolhasSimuladas();
  }
}

function gerarBolhasSimuladas() {
  const symbols = ["PETR4", "VALE3", "ITUB4", "BBDC4", "MGLU3", "BBAS3", "WEGE3", "RADL3", "AZUL4", "RENT3"];
  bubbles = symbols.map(symbol => {
    const change = (Math.random() - 0.5) * 14; // -7% a +7%
    const radius = Math.abs(change) * 3.5 + 30;
    const color = change > 0 ? "#00ff4c" : "#ff1e1e";
    const glow = change > 0 ? "rgba(0,255,76,0.3)" : "rgba(255,30,30,0.3)";
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius,
      symbol,
      change: change.toFixed(2),
      color,
      glow
    };
  });
}

function resolveCollisions() {
  for (let i = 0; i < bubbles.length; i++) {
    for (let j = i + 1; j < bubbles.length; j++) {
      const a = bubbles[i];
      const b = bubbles[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = a.radius + b.radius + 2;

      if (dist < minDist) {
        const angle = Math.atan2(dy, dx);
        const overlap = (minDist - dist) / 2;

        a.x -= Math.cos(angle) * overlap;
        a.y -= Math.sin(angle) * overlap;
        b.x += Math.cos(angle) * overlap;
        b.y += Math.sin(angle) * overlap;
      }
    }
  }
}

function drawBubble(bubble) {
  ctx.shadowBlur = 20;
  ctx.shadowColor = bubble.glow;

  ctx.beginPath();
  ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
  ctx.fillStyle = bubble.color;
  ctx.fill();
  ctx.closePath();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fontSize = Math.max(bubble.radius / 3.2, 10);
  ctx.font = `${fontSize}px Arial`;
  ctx.fillText(bubble.symbol, bubble.x, bubble.y - fontSize / 2.5);
  ctx.fillText(`${bubble.change}%`, bubble.x, bubble.y + fontSize / 2.5);
}

function updateBubbles() {
  for (let bubble of bubbles) {
    bubble.x += bubble.vx;
    bubble.y += bubble.vy;

    if (bubble.x - bubble.radius < 0 || bubble.x + bubble.radius > canvas.width) bubble.vx *= -1;
    if (bubble.y - bubble.radius < 0 || bubble.y + bubble.radius > canvas.height) bubble.vy *= -1;
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateBubbles();
  resolveCollisions();
  for (let bubble of bubbles) drawBubble(bubble);
  requestAnimationFrame(animate);
}

canvas.addEventListener("click", function (event) {
  const rect = canvas.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const clickY = event.clientY - rect.top;

  for (let bubble of bubbles) {
    const dx = clickX - bubble.x;
    const dy = clickY - bubble.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < bubble.radius) {
      openModalWithChart(bubble.symbol);
      break;
    }
  }
});

function openModalWithChart(symbol) {
  const modal = document.getElementById("chartModal");
  modal.style.display = "block";
  document.getElementById("tradingview_chart").innerHTML = "";

  new TradingView.widget({
    width: "100%",
    height: "100%",
    symbol: `BMFBOVESPA:${symbol}`,
    interval: "D",
    timezone: "Etc/UTC",
    theme: "dark",
    style: "1",
    locale: "br",
    toolbar_bg: "#000",
    enable_publishing: false,
    allow_symbol_change: true,
    container_id: "tradingview_chart"
  });
}

function closeModal() {
  document.getElementById("chartModal").style.display = "none";
}

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

fetchStockData().then(() => animate());
setInterval(fetchStockData, 10000);