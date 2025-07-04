
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];

async function fetchData() {
  const res = await fetch("https://brapi.dev/api/quote/list?limit=30&token=5bTDfSmR2ieax6y7JUqDAD");
  const data = await res.json();
  bubbles = data.stocks.map(stock => {
    const change = stock.regularMarketChangePercent || 0;
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
      r: 30 + Math.abs(change) * 2,
      color: change >= 0 ? "lime" : "red",
      label: stock.stock + "\n" + (change > 0 ? "+" : "") + change.toFixed(2) + "%"
    };
  });
}

function drawBubble(b) {
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fillStyle = b.color;
  ctx.shadowColor = b.color;
  ctx.shadowBlur = 20;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "white";
  ctx.font = `${Math.max(12, b.r / 3)}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const [line1, line2] = b.label.split("\n");
  ctx.fillText(line1, b.x, b.y - 10);
  ctx.fillText(line2, b.x, b.y + 10);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bubbles.forEach(b => {
    b.x += b.dx;
    b.y += b.dy;
    if (b.x - b.r < 0 || b.x + b.r > canvas.width) b.dx *= -1;
    if (b.y - b.r < 0 || b.y + b.r > canvas.height) b.dy *= -1;
    drawBubble(b);
  });
  requestAnimationFrame(animate);
}

fetchData().then(animate);
