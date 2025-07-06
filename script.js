const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let bubbles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createBubbles() {
  bubbles = [];
  for (let i = 0; i < 70; i++) {
    const radius = Math.random() * 40 + 20;
    const isUp = Math.random() > 0.5;
    bubbles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: radius,
      color: isUp ? "#00aa00" : "#cc0000",
      shadowColor: isUp ? "#00ff00" : "#ff4444",
      alpha: 0.9,
      text: ["PETR4", "VALE3", "ITUB4", "BBAS3", "BBDC4"][i % 5],
      change: (Math.random() * 5 - 2.5).toFixed(2) + "%",
      dx: Math.random() * 0.5 - 0.25,
      dy: Math.random() * 0.5 - 0.25,
    });
  }
}
createBubbles();

function update() {
  for (let i = 0; i < bubbles.length; i++) {
    let b1 = bubbles[i];
    b1.x += b1.dx;
    b1.y += b1.dy;

    // colisão com bordas
    if (b1.x - b1.r < 0 || b1.x + b1.r > canvas.width) b1.dx *= -1;
    if (b1.y - b1.r < 0 || b1.y + b1.r > canvas.height) b1.dy *= -1;

    // colisão entre bolhas
    for (let j = i + 1; j < bubbles.length; j++) {
      let b2 = bubbles[j];
      const dx = b2.x - b1.x;
      const dy = b2.y - b1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = b1.r + b2.r;

      if (dist < minDist) {
        // ajuste de posição
        const angle = Math.atan2(dy, dx);
        const overlap = 0.5 * (minDist - dist);
        b1.x -= overlap * Math.cos(angle);
        b1.y -= overlap * Math.sin(angle);
        b2.x += overlap * Math.cos(angle);
        b2.y += overlap * Math.sin(angle);
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    // bolha com sombra
    ctx.beginPath();
    ctx.shadowBlur = 30;
    ctx.shadowColor = b.shadowColor || b.color;
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

draw();