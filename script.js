const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

let bubbles = [];

async function loadData() {
  const res = await fetch('https://brapi.dev/api/quote/list?sortBy=change&sortOrder=desc&limit=30&token=5bTDfSmR2ieax6y7JUqDAD');
  const json = await res.json();
  const stocks = json.stocks;

  bubbles = stocks.map(stock => {
    const change = parseFloat(stock.change.toFixed(2));
    const radius = Math.min(120, Math.max(30, Math.abs(change * 6)));
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius,
      change,
      color: change >= 0 ? 'lime' : 'red',
      label: `${stock.stock}\n${change.toFixed(2)}%`
    };
  });
}

function drawBubble(b) {
  const gradient = ctx.createRadialGradient(b.x, b.y, b.radius * 0.2, b.x, b.y, b.radius);
  gradient.addColorStop(0, 'white');
  gradient.addColorStop(1, b.color);

  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.shadowColor = b.color;
  ctx.shadowBlur = 35;
  ctx.arc(b.x, b.y, b.radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#fff";
  ctx.font = `${Math.max(10, b.radius / 3)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const lines = b.label.split('\n');
  lines.forEach((line, i) => {
    ctx.fillText(line, b.x, b.y + (i - 0.5) * 16);
  });
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let b of bubbles) {
    b.x += b.vx;
    b.y += b.vy;

    // Rebote nas bordas
    if (b.x - b.radius < 0 || b.x + b.radius > canvas.width) b.vx *= -1;
    if (b.y - b.radius < 0 || b.y + b.radius > canvas.height) b.vy *= -1;
  }

  // Colisão realista
  for (let i = 0; i < bubbles.length; i++) {
    for (let j = i + 1; j < bubbles.length; j++) {
      const a = bubbles[i];
      const b = bubbles[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = a.radius + b.radius;
      if (dist < minDist) {
        const angle = Math.atan2(dy, dx);
        const move = (minDist - dist) / 2;
        const mx = Math.cos(angle) * move;
        const my = Math.sin(angle) * move;
        a.x -= mx;
        a.y -= my;
        b.x += mx;
        b.y += my;
      }
    }
  }

  for (let b of bubbles) drawBubble(b);
  requestAnimationFrame(update);
}

loadData().then(update);