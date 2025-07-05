const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
let bubbles = [];
let category = "stocks";
let rankingVisible = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function fetchData() {
  fetch("https://brapi.dev/api/quote/list?token=5bTDfSmR2ieax6y7JUqDAD")
    .then(res => res.json())
    .then(data => {
      const stocks = data.stocks.slice(0, 50);
      bubbles = stocks.map(s => {
        const change = parseFloat(s.change ?? 0);
        const baseSize = Math.max(25, Math.min(100, Math.abs(change) * 12));
        return {
          symbol: s.stock,
          change: change.toFixed(2),
          x: random(0, canvas.width),
          y: random(0, canvas.height),
          vx: random(-0.3, 0.3),
          vy: random(-0.3, 0.3),
          size: baseSize,
          color: change >= 0 ? "#00ff00" : "#ff0000"
        };
      });
      updateRanking();
    });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    // Bolha com glow
    ctx.beginPath();
    ctx.shadowBlur = 20;
    ctx.shadowColor = b.color;
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.fill();

    // Texto
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fff";
    ctx.font = `${Math.max(12, b.size / 4)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeText(b.symbol, b.x, b.y - 5);
    ctx.strokeText(b.change + "%", b.x, b.y + 15);
    ctx.fillText(b.symbol, b.x, b.y - 5);
    ctx.fillText(b.change + "%", b.x, b.y + 15);

    // Movimento com rebote
    b.x += b.vx;
    b.y += b.vy;
    if (b.x - b.size < 0 || b.x + b.size > canvas.width) b.vx *= -1;
    if (b.y - b.size < 0 || b.y + b.size > canvas.height) b.vy *= -1;
  }

  requestAnimationFrame(draw);
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
  const top = [...bubbles].sort((a, b) => b.change - a.change).slice(0, 10);
  const panel = document.getElementById("rankingPanel");
  panel.innerHTML = top.map(b => `${b.symbol}: ${b.change}%`).join("<br>");
}

// Iniciar
fetchData();
draw();