const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
let bubbles = [];
let category = "stocks";
let rankingVisible = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.onresize = resizeCanvas;

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function fetchData() {
  fetch(`https://brapi.dev/api/quote/list?token=5bTDfSmR2ieax6y7JUqDAD`)
    .then(res => res.json())
    .then(data => {
      const stocks = data.stocks.slice(0, 40);
      bubbles = stocks.map((stock, i) => {
        const change = stock.change ?? 0;
        const size = Math.max(30, Math.min(200, Math.abs(change) * 50));
        return {
          symbol: stock.stock,
          change: change.toFixed(2),
          x: random(0, canvas.width),
          y: random(0, canvas.height),
          vx: random(-0.3, 0.3),
          vy: random(-0.3, 0.3),
          size: size,
          color: change >= 0 ? "green" : "red",
        };
      });
      updateRanking();
    });
}

function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bubbles.forEach(b => {
    // glow
    ctx.shadowBlur = 40;
    ctx.shadowColor = b.color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, 2 * Math.PI);
    ctx.fillStyle = b.color;
    ctx.fill();

    // text
    ctx.shadowBlur = 0;
    ctx.fillStyle = "white";
    ctx.font = `${Math.max(12, b.size / 5)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(b.symbol, b.x, b.y - 5);
    ctx.fillText(b.change + "%", b.x, b.y + 15);

    // move
    b.x += b.vx;
    b.y += b.vy;

    // bounce
    if (b.x - b.size < 0 || b.x + b.size > canvas.width) b.vx *= -1;
    if (b.y - b.size < 0 || b.y + b.size > canvas.height) b.vy *= -1;
  });

  requestAnimationFrame(drawBubbles);
}

function selectCategory(cat) {
  category = cat;
  document.querySelectorAll(".menu button").forEach(btn => btn.classList.remove("active"));
  document.querySelector(`.menu button[onclick*="${cat}"]`).classList.add("active");
  fetchData();
}

function toggleRanking() {
  rankingVisible = !rankingVisible;
  document.getElementById("rankingPanel").classList.toggle("hidden", !rankingVisible);
  updateRanking();
}

function updateRanking() {
  if (!rankingVisible) return;
  const sorted = [...bubbles].sort((a, b) => b.change - a.change).slice(0, 10);
  const panel = document.getElementById("rankingPanel");
  panel.innerHTML = sorted.map(b => `${b.symbol}: ${b.change}%`).join("<br>");
}

// Inicialização
fetchData();
drawBubbles();