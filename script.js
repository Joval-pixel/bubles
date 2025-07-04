const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];

async function fetchData() {
  const url = "https://brapi.dev/api/quote/list?sortBy=volume&limit=50&token=5bTDfSmR2ieax6y7JUqDAD";
  const res = await fetch(url);
  const data = await res.json();

  bubbles = data.stocks.map((stock, i) => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.max(30, Math.abs(stock.change) * 20 + 20),
    color: stock.change >= 0 ? "lime" : "red",
    glow: stock.change >= 0 ? "0 0 25px lime" : "0 0 25px red",
    symbol: stock.stock || "N/A",
    change: stock.change || 0,
    dx: (Math.random() - 0.5) * 1.5,
    dy: (Math.random() - 0.5) * 1.5,
  }));
}

function drawBubble(b) {
  ctx.beginPath();
  ctx.fillStyle = b.color;
  ctx.shadowColor = b.color;
  ctx.shadowBlur = 20;
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "white";
  ctx.font = `${Math.max(12, b.r / 3)}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText(b.symbol, b.x, b.y - 5);
  ctx.fillText(`${b.change.toFixed(2)}%`, b.x, b.y + 15);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    b.x += b.dx;
    b.y += b.dy;

    // Colisão com bordas
    if (b.x + b.r > canvas.width || b.x - b.r < 0) b.dx *= -1;
    if (b.y + b.r > canvas.height || b.y - b.r < 0) b.dy *= -1;

    drawBubble(b);
  }
  requestAnimationFrame(animate);
}

fetchData().then(() => {
  animate();
});