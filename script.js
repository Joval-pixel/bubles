const canvas = document.getElementById("bubble-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

async function fetchStocks() {
  try {
    const res = await fetch("https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=60&token=5bTDfSmR2ieax6y7JUqDAD");
    const data = await res.json();
    return data.stocks.map(s => ({
      ticker: s.stock,
      change: s.changePercent,
    }));
  } catch (err) {
    console.error("Erro ao buscar ações:", err);
    return [];
  }
}

function createBubble(stock) {
  const radius = Math.max(25, Math.min(80, Math.abs(stock.change) * 10));
  return {
    ...stock,
    x: Math.random() * (canvas.width - 100) + 50,
    y: Math.random() * (canvas.height - 100) + 50,
    r: radius,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
  };
}

function drawBubble(b) {
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fillStyle = b.change >= 0 ? "#006400" : "#B22222";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font = `${Math.max(10, b.r / 3)}px Arial`;
  ctx.fillText(b.ticker, b.x, b.y - 10);
  ctx.font = `${Math.max(10, b.r / 4)}px Arial`;
  ctx.fillText(`${b.change.toFixed(2)}%`, b.x, b.y + 12);
}

function updateBubble(b) {
  b.x += b.vx;
  b.y += b.vy;
  if (b.x - b.r < 0 || b.x + b.r > canvas.width) b.vx *= -1;
  if (b.y - b.r < 0 || b.y + b.r > canvas.height) b.vy *= -1;
}

function avoidOverlap(bubbles) {
  for (let i = 0; i < bubbles.length; i++) {
    for (let j = i + 1; j < bubbles.length; j++) {
      const dx = bubbles[j].x - bubbles[i].x;
      const dy = bubbles[j].y - bubbles[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = bubbles[i].r + bubbles[j].r + 2;
      if (dist < minDist) {
        const angle = Math.atan2(dy, dx);
        const overlap = (minDist - dist) / 2;
        bubbles[i].x -= overlap * Math.cos(angle);
        bubbles[i].y -= overlap * Math.sin(angle);
        bubbles[j].x += overlap * Math.cos(angle);
        bubbles[j].y += overlap * Math.sin(angle);
      }
    }
  }
}

async function init() {
  const stocks = await fetchStocks();
  const bubbles = stocks.map(createBubble);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    avoidOverlap(bubbles);
    bubbles.forEach(b => {
      updateBubble(b);
      drawBubble(b);
    });
    requestAnimationFrame(animate);
  }

  animate();
}

init();