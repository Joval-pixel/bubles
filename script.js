const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const colors = {
  positive: "#00ff00",
  negative: "#ff0000"
};

const bubbles = [];

function getRandomSymbol() {
  const symbols = ["ITUB4", "PETR4", "VALE3", "BBAS3", "WEGE3", "AZUL4", "GGBR4", "MGLU3"];
  return symbols[Math.floor(Math.random() * symbols.length)];
}

function createBubble() {
  const variation = (Math.random() * 5 - 2.5).toFixed(2);
  const positive = variation >= 0;
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: 40 + Math.abs(variation) * 15,
    color: positive ? colors.positive : colors.negative,
    variation,
    symbol: getRandomSymbol(),
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5
  };
}

for (let i = 0; i < 25; i++) {
  bubbles.push(createBubble());
}

function drawBubble(b) {
  const gradient = ctx.createRadialGradient(b.x, b.y, b.radius * 0.5, b.x, b.y, b.radius);
  gradient.addColorStop(0, "#fff");
  gradient.addColorStop(1, b.color);

  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();

  ctx.fillStyle = "#fff";
  ctx.font = `${b.radius * 0.3}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText(b.symbol, b.x, b.y - 5);
  ctx.fillText(`${b.variation}%`, b.x, b.y + 15);
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let b of bubbles) {
    b.x += b.vx;
    b.y += b.vy;

    if (b.x - b.radius < 0 || b.x + b.radius > canvas.width) b.vx *= -1;
    if (b.y - b.radius < 0 || b.y + b.radius > canvas.height) b.vy *= -1;

    drawBubble(b);
  }

  requestAnimationFrame(update);
}

update();