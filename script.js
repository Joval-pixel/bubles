const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];

function getColor(change) {
  if (change > 0) return 'rgba(0,255,0,0.8)';
  if (change < 0) return 'rgba(255,0,0,0.8)';
  return 'gray';
}

function getGlow(change) {
  if (change > 0) return 'lime';
  if (change < 0) return 'red';
  return 'white';
}

async function fetchData() {
  const res = await fetch('https://brapi.dev/api/quote/list?token=5bTDfSmR2ieax6y7JUqDAD');
  const data = await res.json();
  bubbles = data.stocks.slice(0, 50).map(stock => {
    const size = Math.min(120, Math.abs(stock.change || 0) * 90 + 30); // tamanho máximo limitado
    return {
      symbol: stock.stock,
      price: stock.close,
      change: stock.change,
      x: Math.random() * (canvas.width - size * 2) + size,
      y: Math.random() * (canvas.height - size * 2) + size,
      dx: (Math.random() - 0.5) * 1.5,
      dy: (Math.random() - 0.5) * 1.5,
      radius: size,
    };
  });
}

function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    ctx.beginPath();
    ctx.shadowBlur = 25;
    ctx.shadowColor = getGlow(b.change);
    ctx.fillStyle = getColor(b.change);
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();

    // texto
    ctx.shadowBlur = 0;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    const fontSize = Math.max(10, b.radius / 4);
    ctx.font = `bold ${fontSize}px Arial`;

    ctx.fillText(`${b.symbol}`, b.x, b.y - fontSize / 3);
    ctx.fillText(`${b.change.toFixed(2)}%`, b.x, b.y + fontSize / 1.3);
  }
}

function update() {
  for (let b of bubbles) {
    b.x += b.dx;
    b.y += b.dy;

    // rebote
    if (b.x - b.radius < 0 || b.x + b.radius > canvas.width) b.dx *= -1;
    if (b.y - b.radius < 0 || b.y + b.radius > canvas.height) b.dy *= -1;
  }
}

function animate() {
  update();
  drawBubbles();
  requestAnimationFrame(animate);
}

function showCategory(cat) {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  // categoria ativa (marcar visualmente, sem mudar os dados ainda)
  tabs.forEach(tab => {
    if (tab.textContent.toLowerCase().includes(cat)) tab.classList.add('active');
  });
}

fetchData().then(() => {
  animate();
});