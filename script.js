const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

let bubbles = [];
let currentTab = "acoes";
let showRanking = false;

function getRandomColor(value) {
  return value >= 0
    ? "rgba(0,255,0,0.5)" // verde com brilho
    : "rgba(255,0,0,0.5)"; // vermelho com brilho
}

function generateData() {
  const ativos = [
    { symbol: "AZTE3", change: 18.18 },
    { symbol: "BRFS3", change: 3.44 },
    { symbol: "SIMH3", change: -3.02 },
    { symbol: "VBBR3", change: 2.68 },
    { symbol: "USIM5", change: 1.36 },
    { symbol: "BBDC4", change: -0.48 },
    { symbol: "CMIG4", change: 1.18 },
    { symbol: "PETR4", change: 0.18 },
    { symbol: "COGN3", change: -0.34 },
    { symbol: "MGLU3", change: 0.65 },
    { symbol: "SANB11", change: -0.31 },
    { symbol: "ITUB4", change: 0.05 },
    { symbol: "CVCB3", change: 0.00 },
  ];

  return ativos.map(item => {
    const size = 40 + Math.abs(item.change) * 10;
    return {
      ...item,
      x: Math.random() * width,
      y: Math.random() * height,
      radius: size,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
      color: getRandomColor(item.change),
    };
  });
}

function drawBubble(bubble) {
  const gradient = ctx.createRadialGradient(
    bubble.x,
    bubble.y,
    bubble.radius * 0.3,
    bubble.x,
    bubble.y,
    bubble.radius
  );
  gradient.addColorStop(0, "#fff");
  gradient.addColorStop(1, bubble.color);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
  ctx.fill();

  // texto
  ctx.fillStyle = "#fff";
  ctx.font = `${Math.max(bubble.radius * 0.3, 12)}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText(bubble.symbol, bubble.x, bubble.y - 5);
  ctx.font = `${Math.max(bubble.radius * 0.25, 10)}px Arial`;
  ctx.fillText(`${bubble.change.toFixed(2)}%`, bubble.x, bubble.y + 15);
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  bubbles.forEach(b => {
    b.x += b.dx;
    b.y += b.dy;

    // colisão com bordas
    if (b.x - b.radius < 0 || b.x + b.radius > width) b.dx *= -1;
    if (b.y - b.radius < 0 || b.y + b.radius > height) b.dy *= -1;

    // colisão com outras bolhas
    bubbles.forEach(other => {
      if (b === other) return;
      const dx = b.x - other.x;
      const dy = b.y - other.y;
      const dist = Math.hypot(dx, dy);
      if (dist < b.radius + other.radius) {
        const angle = Math.atan2(dy, dx);
        const tx = other.x + Math.cos(angle) * (b.radius + other.radius);
        const ty = other.y + Math.sin(angle) * (b.radius + other.radius);
        b.x = tx;
        b.y = ty;
        b.dx *= -0.5;
        b.dy *= -0.5;
      }
    });

    drawBubble(b);
  });
  requestAnimationFrame(animate);
}

function changeTab(tab) {
  currentTab = tab;
  document.querySelectorAll(".menu button").forEach(btn => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");
  document.getElementById("rankingPanel").style.display = "none";
  bubbles = generateData(); // carrega novos dados simulados
}

function toggleRanking() {
  showRanking = !showRanking;
  const panel = document.getElementById("rankingPanel");
  if (showRanking) {
    const sorted = [...bubbles].sort((a, b) => b.change - a.change).slice(0, 10);
    panel.innerHTML = sorted.map(b => `${b.symbol}: ${b.change.toFixed(2)}%`).join("<br>");
    panel.style.display = "block";
  } else {
    panel.style.display = "none";
  }
}

window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  bubbles = generateData();
});

bubbles = generateData();
animate();