const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];

function randomPos(size) {
  return {
    x: Math.random() * (canvas.width - size * 2) + size,
    y: Math.random() * (canvas.height - size * 2) + size,
  };
}

function getColor(percent) {
  if (percent > 0) return { fill: '#006400', border: '#fff' };       // verde escuro
  if (percent < 0) return { fill: '#8B0000', border: '#fff' };       // vermelho escuro
  return { fill: '#444', border: '#fff' };                           // cinza escuro
}

function createBubbles(data) {
  bubbles = data.map((item) => {
    const size = Math.min(100, Math.max(40, Math.abs(item.change) * 4));
    const { x, y } = randomPos(size);
    return {
      ...item,
      x,
      y,
      size,
      dx: Math.random() * 1 - 0.5,
      dy: Math.random() * 1 - 0.5,
    };
  });
}

function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const b of bubbles) {
    const { fill, border } = getColor(b.change);
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, 2 * Math.PI);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = border;
    ctx.stroke();

    // Código da ação e preço
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(b.ticker, b.x, b.y - 10);
    ctx.font = '12px Arial';
    ctx.fillText(`R$${b.price.toFixed(2)}`, b.x, b.y + 5);
    ctx.fillText(`${b.change.toFixed(2)}%`, b.x, b.y + 20);
  }
}

function animate() {
  drawBubbles();
  for (const b of bubbles) {
    b.x += b.dx;
    b.y += b.dy;

    if (b.x < b.size || b.x > canvas.width - b.size) b.dx *= -1;
    if (b.y < b.size || b.y > canvas.height - b.size) b.dy *= -1;
  }
  requestAnimationFrame(animate);
}

async function loadBubbles(tipo) {
  try {
    const response = await fetch(`https://brapi.dev/api/quote/list?token=5bTDfSmR2ieax6y7JUqDAD&limit=100`);
    const json = await response.json();
    const mapped = json.stocks.map((stock) => ({
      ticker: stock.stock,
      price: stock.close || 0,
      change: stock.change || 0,
    }));
    createBubbles(mapped);
  } catch (e) {
    console.error('Erro ao carregar dados:', e);
  }
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  createBubbles(bubbles); // Reposiciona
});

loadBubbles('acoes');
animate();