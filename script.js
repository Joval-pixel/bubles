const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];

function createBubbles() {
  bubbles = [];
  const stocks = [
    { name: 'PDGR3', change: 4.17 },
    { name: 'TIMP3', change: -0.62 },
    { name: 'PETR3', change: 0.11 },
    { name: 'MRFG3', change: 1.33 },
    { name: 'BBDC3', change: -0.07 }
  ];
  for (const stock of stocks) {
    const r = Math.abs(stock.change) * 20 + 30;
    const glowColor = stock.change > 0 ? '#00ff00' : stock.change < 0 ? '#ff0000' : '#aaaaaa';
    bubbles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r,
      color: glowColor,
      name: stock.name,
      change: `${stock.change.toFixed(2)}%`,
      dx: (Math.random() - 0.5) * 1.5,
      dy: (Math.random() - 0.5) * 1.5
    });
  }
}

function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const b of bubbles) {
    // Glow de fundo
    ctx.beginPath();
    ctx.fillStyle = b.color;
    ctx.shadowColor = b.color;
    ctx.shadowBlur = 40;
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();

    // Texto
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = `${Math.max(b.r / 3.5, 14)}px sans-serif`;
    ctx.fillText(b.name, b.x, b.y - 6);
    ctx.font = `${Math.max(b.r / 4, 12)}px sans-serif`;
    ctx.fillText(b.change, b.x, b.y + 14);
  }
}

function animate() {
  drawBubbles();
  for (const b of bubbles) {
    b.x += b.dx;
    b.y += b.dy;
    if (b.x - b.r < 0 || b.x + b.r > canvas.width) b.dx *= -1;
    if (b.y - b.r < 0 || b.y + b.r > canvas.height) b.dy *= -1;
  }
  requestAnimationFrame(animate);
}

function showTab(tab) {
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  createBubbles(); // simula nova aba
}

createBubbles();
animate();