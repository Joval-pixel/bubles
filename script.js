const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function createBubble(name, price, change) {
  const radius = Math.max(30, Math.abs(change) * 8 + 20);
  const x = getRandom(radius, canvas.width - radius);
  const y = getRandom(radius, canvas.height - radius);
  const dx = getRandom(-0.3, 0.3);
  const dy = getRandom(-0.3, 0.3);
  return { name, price, change, x, y, dx, dy, radius };
}

function drawBubble(b) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);

  // Glow externo
  ctx.shadowBlur = 20;
  ctx.shadowColor =
    b.change > 0
      ? "rgba(0,255,0,0.6)"
      : b.change < 0
      ? "rgba(255,0,0,0.6)"
      : "rgba(180,180,180,0.5)";
  ctx.fillStyle =
    b.change > 0
      ? "rgb(0,150,0)"
      : b.change < 0
      ? "rgb(200,0,0)"
      : "rgb(150,150,150)";
  ctx.fill();

  // Contorno branco
  ctx.lineWidth = 2;
  ctx.strokeStyle = "white";
  ctx.stroke();
  ctx.closePath();
  ctx.restore();

  // Brilho deslocado (efeito 3D)
  ctx.save();
  const grad = ctx.createRadialGradient(
    b.x - b.radius * 0.3,
    b.y - b.radius * 0.3,
    5,
    b.x,
    b.y,
    b.radius
  );
  grad.addColorStop(0, "rgba(255,255,255,0.4)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.closePath();
  ctx.restore();

  // Texto
  ctx.save();
  ctx.fillStyle = "white";
  ctx.font = `${Math.max(12, b.radius / 3)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(b.name, b.x, b.y - 10);
  ctx.fillText(`R$${b.price.toFixed(2)}`, b.x, b.y + 10);
  ctx.fillText(`${b.change.toFixed(2)}%`, b.x, b.y + 28);
  ctx.restore();
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    b.x += b.dx;
    b.y += b.dy;

    // Rebote
    if (b.x < b.radius || b.x > canvas.width - b.radius) b.dx *= -1;
    if (b.y < b.radius || b.y > canvas.height - b.radius) b.dy *= -1;

    drawBubble(b);
  }
  requestAnimationFrame(animate);
}

function loadBubbles(tipo) {
  bubbles = [];
  for (let i = 0; i < 80; i++) {
    const change = getRandom(-10, 10);
    const price = getRandom(5, 60);
    const nome =
      tipo === "acoes"
        ? `ABC${i}`
        : tipo === "criptos"
        ? `BTC${i}`
        : tipo === "commodities"
        ? `PET${i}`
        : tipo === "opcoes"
        ? `OPC${i}`
        : `FRE${i}`;
    bubbles.push(createBubble(nome, price, change));
  }
}

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

loadBubbles("acoes");
animate();
