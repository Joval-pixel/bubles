const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let bubbles = [];
let logos = {}; // opcional para logos

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createBubbles() {
  bubbles = [];
  for (let i = 0; i < 80; i++) {
    const radius = Math.random() * 40 + 20;
    bubbles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: radius,
      color: Math.random() > 0.5 ? "#00ff00" : "#ff0000",
      alpha: 0.9,
      text: ["PETR4", "VALE3", "ITUB4", "BBAS3", "BBDC4"][i % 5],
      change: (Math.random() * 5 - 2.5).toFixed(2) + "%",
      dx: Math.random() * 0.6 - 0.3,
      dy: Math.random() * 0.6 - 0.3,
    });
  }
}

createBubbles();

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    // sombra/glow
    ctx.beginPath();
    ctx.shadowBlur = 25;
    ctx.shadowColor = b.color;
    ctx.fillStyle = b.color;
    ctx.globalAlpha = b.alpha;
    ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();

    // texto
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.fillStyle = "white";
    ctx.font = `bold ${Math.max(12, b.r / 3)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(b.text, b.x, b.y - 5);
    ctx.fillText(b.change, b.x, b.y + 15);
  }
  update();
  requestAnimationFrame(draw);
}

function update() {
  for (let b of bubbles) {
    b.x += b.dx;
    b.y += b.dy;

    // colisão com bordas
    if (b.x - b.r < 0 || b.x + b.r > canvas.width) b.dx *= -1;
    if (b.y - b.r < 0 || b.y + b.r > canvas.height) b.dy *= -1;
  }
}

draw();