const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];

function randomColor(value) {
  return value >= 0 ? 'green' : 'red';
}

function glowColor(value) {
  return value >= 0 ? '0 0 25px #00ff00' : '0 0 25px #ff0000';
}

function createBubble(symbol, value) {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: 40 + Math.abs(value) * 100,
    dx: (Math.random() - 0.5) * 1.5,
    dy: (Math.random() - 0.5) * 1.5,
    symbol: symbol,
    value: value
  };
}

// Exemplo estático (você pode substituir por dados da API Brapi)
const symbols = [
  { symbol: 'VALE3', value: 0.29 },
  { symbol: 'MGLU3', value: 0.65 },
  { symbol: 'BBDC4', value: -0.48 },
  { symbol: 'JBSS3', value: -100.0 },
  { symbol: 'RAIZ4', value: 0.59 },
  { symbol: 'PETR4', value: -0.12 }
];

symbols.forEach(s => bubbles.push(createBubble(s.symbol, s.value)));

function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bubbles.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, 2 * Math.PI);
    ctx.fillStyle = b.value >= 0 ? '#00ff00' : '#ff0000';
    ctx.shadowColor = b.value >= 0 ? '#00ff00' : '#ff0000';
    ctx.shadowBlur = 30;
    ctx.fill();
    ctx.closePath();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.font = `${Math.max(12, b.radius / 3)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(b.symbol, b.x, b.y - 10);
    ctx.fillText(`${b.value.toFixed(2)}%`, b.x, b.y + 10);
  });
}

function moveBubbles() {
  bubbles.forEach(b => {
    b.x += b.dx;
    b.y += b.dy;
    if (b.x + b.radius > canvas.width || b.x - b.radius < 0) b.dx *= -1;
    if (b.y + b.radius > canvas.height || b.y - b.radius < 0) b.dy *= -1;
  });
}

function animate() {
  drawBubbles();
  moveBubbles();
  requestAnimationFrame(animate);
}

function showTab(tab) {
  document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.tab:contains('${tab}')`)?.classList.add('active');
}

animate();