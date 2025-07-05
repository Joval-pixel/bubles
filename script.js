const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');

let bubbles = [];
let tick = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 120;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function generateColor(change) {
  const base = change >= 0 ? [0, 255, 0] : [255, 0, 0];
  const intensity = Math.min(Math.abs(change) * 40, 255);
  return `rgba(${base[0]}, ${base[1]}, ${base[2]}, 0.8)`;
}

function createBubbles() {
  const symbols = [
    { symbol: 'PETR4', change: -0.47 },
    { symbol: 'VALE3', change: 0.24 },
    { symbol: 'ITUB4', change: 0.21 },
    { symbol: 'BBAS3', change: 2.12 },
    { symbol: 'MGLU3', change: 0.93 },
    { symbol: 'BBDC4', change: -0.48 },
    { symbol: 'RADL3', change: 1.04 },
    { symbol: 'LWSA3', change: 1.10 },
    { symbol: 'AZUL4', change: 0.00 },
    { symbol: 'USIM5', change: -0.33 },
    { symbol: 'CSNA3', change: -0.24 },
    { symbol: 'WEGE3', change: 0.68 },
    { symbol: 'RENT3', change: -0.18 },
    { symbol: 'BRFS3', change: -0.44 },
    { symbol: 'GGBR4', change: 0.88 },
    { symbol: 'SUZB3', change: -1.20 },
    { symbol: 'HAPV3', change: 2.91 },
    { symbol: 'YDUQ3', change: 1.15 },
    { symbol: 'ABEV3', change: 0.30 },
    { symbol: 'VBBR3', change: 2.68 },
  ];

  const used = new Set();
  while (bubbles.length < 20 && used.size < symbols.length) {
    const i = Math.floor(Math.random() * symbols.length);
    const data = symbols[i];
    if (used.has(data.symbol)) continue;
    used.add(data.symbol);

    const radius = 30 + Math.abs(data.change) * 15;
    const x = Math.random() * (canvas.width - radius * 2) + radius;
    const y = Math.random() * (canvas.height - radius * 2) + radius;
    const dx = (Math.random() - 0.5) * 0.5;
    const dy = (Math.random() - 0.5) * 0.5;

    bubbles.push({ ...data, x, y, dx, dy, radius });
  }
}
createBubbles();

function drawBubble(b) {
  ctx.beginPath();
  const gradient = ctx.createRadialGradient(b.x, b.y, b.radius * 0.2, b.x, b.y, b.radius);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(1, generateColor(b.change));
  ctx.fillStyle = gradient;
  ctx.shadowColor = generateColor(b.change);
  ctx.shadowBlur = 30;
  ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#000';
  ctx.font = `${Math.max(10, b.radius / 3)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'white';
  ctx.fillText(`${b.symbol}\n${b.change.toFixed(2)}%`, b.x, b.y);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bubbles.forEach(b => {
    b.x += b.dx;
    b.y += b.dy;

    if (b.x - b.radius < 0 || b.x + b.radius > canvas.width) b.dx *= -1;
    if (b.y - b.radius < 0 || b.y + b.radius > canvas.height) b.dy *= -1;

    bubbles.forEach(other => {
      if (b === other) return;
      const dx = other.x - b.x;
      const dy = other.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < b.radius + other.radius) {
        const angle = Math.atan2(dy, dx);
        const overlap = b.radius + other.radius - dist;
        b.x -= Math.cos(angle) * overlap / 2;
        b.y -= Math.sin(angle) * overlap / 2;
        other.x += Math.cos(angle) * overlap / 2;
        other.y += Math.sin(angle) * overlap / 2;
      }
    });

    drawBubble(b);
  });

  tick++;
  requestAnimationFrame(animate);
}
animate();

function showTab(name) {
  document.querySelectorAll('button.tab').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`button.tab[onclick*="${name}"]`).classList.add('active');
  // Aqui você pode trocar os dados das bolhas dependendo da aba clicada
} 