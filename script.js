const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];

async function fetchStockData() {
  const url = 'https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=100&token=5bTDfSmR2ieax6y7JUqDAD';
  const response = await fetch(url);
  const json = await response.json();
  const stocks = json.stocks;

  bubbles = stocks.map(stock => {
    const change = stock.changePercent ?? 0;
    const radius = Math.max(30, Math.abs(change) * 4 + 20);
    const color = change >= 0 ? "#00ff4c" : "#ff1e1e";
    const glow = change >= 0 ? "rgba(0,255,76,0.4)" : "rgba(255,30,30,0.4)";

    return {
      x: Math.random() * (canvas.width - 100) + 50,
      y: Math.random() * (canvas.height - 100) + 50,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius,
      symbol: stock.stock,
      change: change.toFixed(2),
      color,
      glow
    };
  });
}

function drawBubble(bubble) {
  ctx.shadowBlur = 25;
  ctx.shadowColor = bubble.glow;

  ctx.beginPath();
  ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
  ctx.fillStyle = bubble.color;
  ctx.fill();
  ctx.closePath();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#fff";
  ctx.font = `${Math.max(bubble.radius / 3.2, 12)}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(bubble.symbol, bubble.x, bubble.y - bubble.radius / 5);
  ctx.fillText(`${bubble.change}%`, bubble.x, bubble.y + bubble.radius / 5);
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

  document.getElementById("tradingview_chart").innerHTML = ""; // Limpa antes de criar novo

  new TradingView.widget({
    "width": "100%",
    "height": "100%",
    "symbol": `BMFBOVESPA:${symbol}`,
    "interval": "D",
    "timezone": "Etc/UTC",
    "theme": "dark",
    "style": "1",
    "locale": "br",
    "toolbar_bg": "#000",
    "enable_publishing": false,
    "allow_symbol_change": true,
    "container_id": "tradingview_chart"
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
setInterval(fetchStockData, 10000); // Atualiza a cada 10 segundos