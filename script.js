const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const bubbles = [];
const totalBubbles = 80;
const stockNames = new Set();

function getRandomSymbol() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let symbol = "";
  for (let i = 0; i < 4; i++) {
    symbol += letters[Math.floor(Math.random() * letters.length)];
  }
  return symbol;
}

function createBubble() {
  let symbol;
  do {
    symbol = getRandomSymbol();
  } while (stockNames.has(symbol));
  stockNames.add(symbol);

  const value = (Math.random() * 6 - 3).toFixed(2);
  const radius = Math.max(20, Math.abs(value) * 20 + 20);
  const color = value >= 0 ? "green" : "red";

  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: radius,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    value,
    symbol,
    color
  };
}

function drawBubble(b) {
  const gradient = ctx.createRadialGradient(b.x, b.y, b.r * 0.3, b.x, b.y, b.r);
  gradient.addColorStop(0, "#fff");
  gradient.addColorStop(1, b.color === "green" ? "#00ff00" : "#ff0000");

  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.shadowBlur = 15;
  ctx.shadowColor = b.color;
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#fff";
  ctx.font = `${b.r / 3}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText(b.symbol, b.x, b.y);
  ctx.font = `${b.r / 4}px Arial`;
  ctx.fillText(`${b.value}%`, b.x, b.y + b.r / 3);
}

function updateBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  bubbles.forEach(b => {
    b.x += b.vx;
    b.y += b.vy;

    // colisão com bordas
    if (b.x - b.r < 0 || b.x + b.r > canvas.width) b.vx *= -1;
    if (b.y - b.r < 0 || b.y + b.r > canvas.height) b.vy *= -1;
  });

  // evitar sobreposição
  for (let i = 0; i < bubbles.length; i++) {
    for (let j = i + 1; j < bubbles.length; j++) {
      const dx = bubbles[j].x - bubbles[i].x;
      const dy = bubbles[j].y - bubbles[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = bubbles[i].r + bubbles[j].r;

      if (dist < minDist) {
        const angle = Math.atan2(dy, dx);
        const overlap = minDist - dist;
        const moveX = (overlap / 2) * Math.cos(angle);
        const moveY = (overlap / 2) * Math.sin(angle);

        bubbles[i].x -= moveX;
        bubbles[i].y -= moveY;
        bubbles[j].x += moveX;
        bubbles[j].y += moveY;
      }
    }
  }

  bubbles.forEach(drawBubble);
  requestAnimationFrame(updateBubbles);
}

// Início
for (let i = 0; i < totalBubbles; i++) {
  bubbles.push(createBubble());
}

updateBubbles();

function showTab(tab) {
  document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");
  // placeholder de troca de conteúdo (pode ser melhorado)
}