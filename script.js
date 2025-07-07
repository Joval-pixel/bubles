const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

let bubbles = [];
let currentType = 'stocks';

const API_KEY = '5bTDfSmR2ieax6y7JUqDAD';

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function createBubble(item) {
  const variation = parseFloat(item.changePercent || item.change || 0);
  const size = Math.min(Math.max(Math.abs(variation) * 8 + 40, 40), 120);
  const isPositive = variation >= 0;
  const colorClass = isPositive ? 'positive' : 'negative';

  const bubble = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    size,
    label: item.stock || item.symbol,
    price: item.price || item.regularMarketPrice,
    change: variation.toFixed(2),
    isPositive,
    colorClass
  };

  return bubble;
}

function drawBubble(b) {
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.size / 2, 0, Math.PI * 2);
  ctx.fillStyle = b.isPositive ? '#006622' : '#800000';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(b.size / 6, 10)}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(b.label, b.x, b.y - 5);
  ctx.font = `bold ${Math.max(b.size / 7, 9)}px Arial`;
  ctx.fillText(`${b.change}%`, b.x, b.y + 12);
}

function updateBubbles() {
  for (let i = 0; i < bubbles.length; i++) {
    let b = bubbles[i];
    b.x += b.vx;
    b.y += b.vy;

    // Bounce off edges
    if (b.x < b.size / 2 || b.x > canvas.width - b.size / 2) b.vx *= -1;
    if (b.y < b.size / 2 || b.y > canvas.height - b.size / 2) b.vy *= -1;

    // Collision with others
    for (let j = 0; j < bubbles.length; j++) {
      if (i === j) continue;
      let b2 = bubbles[j];
      let dx = b.x - b2.x;
      let dy = b.y - b2.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < (b.size + b2.size) / 2) {
        let angle = Math.atan2(dy, dx);
        let targetX = b2.x + Math.cos(angle) * (b.size + b2.size) / 2;
        let targetY = b2.y + Math.sin(angle) * (b.size + b2.size) / 2;
        let ax = (targetX - b.x) * 0.05;
        let ay = (targetY - b.y) * 0.05;
        b.vx -= ax;
        b.vy -= ay;
        b2.vx += ax;
        b2.vy += ay;
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateBubbles();
  bubbles.forEach(drawBubble);
  requestAnimationFrame(animate);
}

function loadData(type) {
  let url = type === 'crypto'
    ? `https://brapi.dev/api/crypto?sortBy=volume_desc&limit=60&token=${API_KEY}`
    : `https://brapi.dev/api/quote/list?sortBy=volume_desc&limit=60&token=${API_KEY}`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const results = data.stocks || data.coins || [];
      const unique = new Set();
      bubbles = results
        .filter(item => {
          const id = item.stock || item.symbol;
          if (!id || unique.has(id)) return false;
          unique.add(id);
          return true;
        })
        .map(createBubble);
    });
}

// Setup UI
document.getElementById('btnAcoes').addEventListener('click', () => {
  currentType = 'stocks';
  loadData('stocks');
});

document.getElementById('btnCriptos').addEventListener('click', () => {
  currentType = 'crypto';
  loadData('crypto');
});

// Start
loadData('stocks');
animate();