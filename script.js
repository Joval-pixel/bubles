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

  bubbles = stocks.map((stock, i) => {
    const change = parseFloat(stock.change.toFixed(2));
    const radius = Math.max(20, Math.min(130, Math.abs(change * 20)));
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius,
      change,
      color: change >= 0 ? 'green' : 'red',
      text: `${stock.stock}\n${change.toFixed(2)}%`
    };
  });
}

function drawBubble(bubble) {
  const gradient = ctx.createRadialGradient(
    bubble.x, bubble.y, bubble.radius * 0.2,
    bubble.x, bubble.y, bubble.radius
  );
  gradient.addColorStop(0, '#fff');
  gradient.addColorStop(1, bubble.color);

  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.shadowBlur = 50;
  ctx.shadowColor = bubble.color;
  ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#fff';
  ctx.font = `${Math.min(22, bubble.radius / 3)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = bubble.text.split('\n');
  lines.forEach((line, i) => {
    ctx.fillText(line, bubble.x, bubble.y + (i - 0.5) * 20);
  });
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    b.x += b.vx;
    b.y += b.vy;

    // Rebate nas bordas
    if (b.x - b.radius < 0 || b.x + b.radius > canvas.width) b.vx *= -1;
    if (b.y - b.radius < 0 || b.y + b.radius > canvas.height) b.vy *= -1;

    drawBubble(b);
  }

  // Evita sobreposição
  for (let i = 0; i < bubbles.length; i++) {
    for (let j = i + 1; j < bubbles.length; j++) {
      let a = bubbles[i];
      let b = bubbles[j];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      let minDist = a.radius + b.radius;
      if (dist < minDist) {
        let angle = Math.atan2(dy, dx);
        let move = (minDist - dist) / 2;
        a.x -= Math.cos(angle) * move;
        a.y -= Math.sin(angle) * move;
        b.x += Math.cos(angle) * move;
        b.y += Math.sin(angle) * move;
      }
    }
  }

  requestAnimationFrame(update);
}

loadData().then(update);