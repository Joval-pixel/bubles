const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const apiKey = "5bTDfSmR2ieax6y7JUqDAD";
const tickers = ["PETR3", "VALE3", "ITUB4", "BBDC3", "BBAS3", "MGLU3", "LREN3", "WEGE3", "B3SA3", "ABEV3", "HAPV3", "MRFG3", "TIMS3", "PDGR3"];

let bubbles = [];

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function createBubble(data) {
  const variation = data.changePercent || 0;
  const color = variation > 0 ? "lime" : variation < 0 ? "red" : "gray";
  const radius = Math.min(160, Math.max(40, Math.abs(variation) * 40));

  return {
    ticker: data.symbol,
    variation: variation.toFixed(2),
    radius,
    x: getRandom(radius, canvas.width - radius),
    y: getRandom(radius, canvas.height - radius),
    vx: getRandom(-0.3, 0.3),
    vy: getRandom(-0.3, 0.3),
    color,
  };
}

function drawBubble(bubble) {
  ctx.beginPath();
  const gradient = ctx.createRadialGradient(bubble.x, bubble.y, bubble.radius * 0.1, bubble.x, bubble.y, bubble.radius);
  gradient.addColorStop(0, "white");
  gradient.addColorStop(1, bubble.color);
  ctx.fillStyle = gradient;
  ctx.shadowBlur = 30;
  ctx.shadowColor = bubble.color;
  ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#fff";
  ctx.font = `${Math.max(12, bubble.radius / 5)}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText(bubble.ticker, bubble.x, bubble.y - 5);
  ctx.fillText(`${bubble.variation}%`, bubble.x, bubble.y + 15);
}

function updateBubbles() {
  for (const b of bubbles) {
    b.x += b.vx;
    b.y += b.vy;

    if (b.x < b.radius || b.x > canvas.width - b.radius) b.vx *= -1;
    if (b.y < b.radius || b.y > canvas.height - b.radius) b.vy *= -1;

    for (const other of bubbles) {
      if (b === other) continue;
      const dx = other.x - b.x;
      const dy = other.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = b.radius + other.radius;

      if (dist < minDist) {
        const angle = Math.atan2(dy, dx);
        const overlap = (minDist - dist) / 2;
        b.x -= Math.cos(angle) * overlap;
        b.y -= Math.sin(angle) * overlap;
        other.x += Math.cos(angle) * overlap;
        other.y += Math.sin(angle) * overlap;
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateBubbles();
  for (const bubble of bubbles) drawBubble(bubble);
  requestAnimationFrame(animate);
}

async function fetchData() {
  const url = `https://brapi.dev/api/quote/list?sortBy=volume&limit=25&token=${apiKey}`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    bubbles = json.stocks
      .filter(stock => tickers.includes(stock.symbol))
      .map(createBubble);
    animate();
  } catch (err) {
    console.error("Erro ao buscar dados:", err);
  }
}

fetchData();