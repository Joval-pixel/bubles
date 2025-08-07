let canvas = document.getElementById('bubbleCanvas');
let ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];
let category = 'acoes';

function setCategory(cat) {
  category = cat;
  loadData();
}

function getColor(change) {
  if (change > 0) return '#006400'; // verde escuro
  if (change < 0) return '#8B0000'; // vermelho escuro
  return '#444'; // cinza escuro
}

function loadData() {
  fetch(`https://brapi.dev/api/quote/list?token=5bTDfSmR2ieax6y7JUqDAD&limit=100`)
    .then(res => res.json())
    .then(json => {
      bubbles = json.stocks.slice(0, 80).map(stock => {
        let change = parseFloat(stock.change) || 0;
        return {
          symbol: stock.stock,
          price: stock.close || 0,
          change,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: 30 + Math.min(Math.abs(change) * 2, 40),
          dx: (Math.random() - 0.5) * 1.2,
          dy: (Math.random() - 0.5) * 1.2,
          color: getColor(change)
        }
      });
    });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = b.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(b.symbol, b.x, b.y - 10);
    ctx.font = '12px Arial';
    ctx.fillText(`R$${b.price.toFixed(2)}`, b.x, b.y + 6);
    ctx.fillText(`${b.change.toFixed(2)}%`, b.x, b.y + 20);
  }
}

function update() {
  for (let b of bubbles) {
    b.x += b.dx;
    b.y += b.dy;
    if (b.x < b.r || b.x > canvas.width - b.r) b.dx *= -1;
    if (b.y < b.r || b.y > canvas.height - b.r) b.dy *= -1;
  }
}

canvas.addEventListener('click', function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  for (let b of bubbles) {
    const dx = mouseX - b.x;
    const dy = mouseY - b.y;
    if (Math.sqrt(dx * dx + dy * dy) < b.r) {
      openModal(b.symbol);
      break;
    }
  }
});

// ✅ Corrigido: TradingView com BMFBOVESPA
function openModal(symbol) {
  const modal = document.getElementById('chartModal');
  const iframe = document.getElementById('tradingview-frame');
  iframe.src = `https://s.tradingview.com/widgetembed/?symbol=${symbol}:BMFBOVESPA&interval=1&theme=dark&style=1&locale=br#`;
  modal.style.display = 'block';
}

function closeModal() {
  document.getElementById('chartModal').style.display = 'none';
}

function loop() {
  draw();
  update();
  requestAnimationFrame(loop);
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

loadData();
loop();