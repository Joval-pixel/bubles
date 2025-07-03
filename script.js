const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');
let bubbles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth - 220;
  canvas.height = window.innerHeight - 90;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function createBubble(data, i) {
  const radius = Math.max(20, Math.abs(data.change) * 8 + Math.log10(data.volume + 1));
  const color = data.change >= 0 ? 'limegreen' : 'red';
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.7,
    vy: (Math.random() - 0.5) * 0.7,
    r: radius,
    color,
    text: `${data.stock} ${data.change.toFixed(2)}%`
  };
}

function drawBubble(b) {
  ctx.beginPath();
  const gradient = ctx.createRadialGradient(b.x, b.y, b.r * 0.3, b.x, b.y, b.r);
  gradient.addColorStop(0, b.color);
  gradient.addColorStop(1, 'black');
  ctx.fillStyle = gradient;
  ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = 'white';
  ctx.font = `${Math.min(14, b.r / 2)}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(b.text, b.x, b.y + 4);
}

function updateBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    b.x += b.vx;
    b.y += b.vy;
    if (b.x < b.r || b.x > canvas.width - b.r) b.vx *= -1;
    if (b.y < b.r || b.y > canvas.height - b.r) b.vy *= -1;
    drawBubble(b);
  }
  requestAnimationFrame(updateBubbles);
}

function updateRanking(data) {
  const sorted = [...data].sort((a, b) => b.change - a.change);
  const highest = sorted.slice(0, 3);
  const lowest = sorted.slice(-3).reverse();
  const volumeTop = [...data].sort((a, b) => b.volume - a.volume).slice(0, 3);

  document.getElementById('highest').innerHTML = highest.map(s => `<li>${s.stock} <span>+${s.change.toFixed(2)}%</span></li>`).join('');
  document.getElementById('lowest').innerHTML = lowest.map(s => `<li>${s.stock} <span>${s.change.toFixed(2)}%</span></li>`).join('');
  document.getElementById('volume').innerHTML = volumeTop.map(s => `<li>${s.stock} <span>+${s.change.toFixed(2)}%</span></li>`).join('');
}

async function fetchData() {
  try {
    const res = await fetch('https://brapi.dev/api/quote/list?token=5bTDfSmR2ieax6y7JUqDAD&sortBy=volume&sortOrder=desc&limit=100');
    const json = await res.json();
    const data = json.stocks.map(s => ({
      stock: s.stock,
      change: parseFloat(s.change),
      volume: s.volume || 0
    })).filter(s => !isNaN(s.change));

    bubbles = data.map(createBubble);
    updateRanking(data);
  } catch (e) {
    console.error('Erro ao buscar dados:', e);
  }
}

fetchData();
updateBubbles();
setInterval(fetchData, 60000);