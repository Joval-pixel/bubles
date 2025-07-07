const canvas = document.getElementById("bubble-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

async function getStockData() {
  const response = await fetch("https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=60&token=5bTDfSmR2ieax6y7JUqDAD");
  const data = await response.json();
  return data.stocks.map(stock => ({
    ticker: stock.stock,
    change: stock.changePercent,
    price: stock.price,
  }));
}

function createBubble(stock) {
  const radius = Math.max(30, Math.min(90, Math.abs(stock.change) * 10));
  return {
    ...stock,
    x: Math.random() * (canvas.width - radius * 2) + radius,
    y: Math.random() * (canvas.height - radius * 2) + radius,
    r: radius,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
  };
}

function drawBubble(bubble) {
  ctx.beginPath();
  ctx.arc(bubble.x, bubble.y, bubble.r, 0, 2 * Math.PI);

  const color = bubble.change >= 0 ? "#006400" : "#ff0000"; // Verde escuro ou vermelho vivo
  ctx.fillStyle = color;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = `${Math.max(12, bubble.r / 4)}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const label = `${bubble.ticker}\n${bubble.change.toFixed(2)}%`;
  const lines = label.split("\n");
  lines.forEach((line, index) => {
    ctx.fillText(line, bubble.x, bubble.y - (lines.length - 1) * 8 + index * 16);
  });
}

function updateBubble(bubble) {
  bubble.x += bubble.vx;
  bubble.y += bubble.vy;

  if (bubble.x - bubble.r < 0 || bubble.x + bubble.r > canvas.width) bubble.vx *= -1;
  if (bubble.y - bubble.r < 0 || bubble.y + bubble.r > canvas.height) bubble.vy *= -1;
}

function avoidOverlap(bubbles) {
  for (let i = 0; i < bubbles.length; i++) {
    for (let j = i + 1; j < bubbles.length; j++) {
      const dx = bubbles[j].x - bubbles[i].x;
      const dy = bubbles[j].y - bubbles[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = bubbles[i].r + bubbles[j].r + 4;
      if (dist < minDist) {
        const angle = Math.atan2(dy, dx);
        const move = (minDist - dist) / 2;
        bubbles[i].x -= move * Math.cos(angle);
        bubbles[i].y -= move * Math.sin(angle);
        bubbles[j].x += move * Math.cos(angle);
        bubbles[j].y += move * Math.sin(angle);
      }
    }
  }
}

async function init() {
  const stocks = await getStockData();
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