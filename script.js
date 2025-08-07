const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];
let category = 'acoes';

function setCategory(cat) {
  category = cat;
  loadData();
}

function getColor(change) {
  if (change > 0) return '#00cc00'; // verde vivo
  if (change < 0) return '#cc0000'; // vermelho vivo
  return '#444444'; // cinza escuro
}

function loadData() {
  fetch(`https://brapi.dev/api/quote/list?token=5bTDfSmR2ieax6y7JUqDAD&limit=100`)
    .then(res => res.json())
    .then(json => {
      bubbles = json.stocks.slice(0, 100).map(stock => {
        const change = parseFloat(stock.change) || 0;
        return {
          symbol: stock.stock,
          price: stock.close || 0,
          change,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: 30 + Math.min(Math.abs(change) * 2, 45),
          dx: (Math.random() - 0.5) * 0.8,
          dy: (Math.random() - 0.5) * 0.8,
          color: getColor(change)
        };
      });
    });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    // Gradiente 3D
    const gradient = ctx.createRadialGradient(b.x, b.y, b.r * 0.3, b.x, b.y, b.r);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, b.color);

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.shadowBlur = 20;
    ctx.shadowColor = b.color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';
    ctx.stroke();

    // Texto
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = `bold ${Math.max(10, b.r / 3)}px Arial`;
    ctx.fillText(b.symbol, b.x, b.y - 10);
    ctx.font = `${Math.max(9, b.r / 3.5)}px Arial`;
    ctx.fillText(`R$${b.price.toFixed(2)}`, b.x, b.y + 6);
    ctx.fillText(`${b.change.toFixed(2)}%`, b.x, b.y + 20);
  }
}

function update() {
  for (let b of bubbles) {
    b.x += b.dx;
    b.y += b.dy;

    // Evitar sair da tela
    if (b.x < b.r || b.x > canvas.width - b.r) b.dx *= -1;
    if (b.y < b.r || b.y > canvas.height - b.r) b.dy *= -1;

    // Simples colisão entre bolhas
    for (let other of bubbles) {
      if (b === other) continue;
      const dx = b.x - other.x;
      const dy = b.y - other.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < b.r + other.r) {
        // Rebate
        b.dx = -b.dx;
        b.dy = -b.dy;
        other.dx = -other.dx;
        other.dy = -other.dy;
      }
    }
  }
}

canvas.addEventListener('click', function (e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  for (let b of bubbles) {
    const dx = x - b.x;
    const dy = y - b.y;
    if (Math.sqrt(dx * dx + dy * dy) < b.r) {
      openModal(b.symbol);
      break;
    }
  }
});

function openModal(symbol) {
  const modal = document.getElementById('chartModal');
  const iframe = document.getElementById('tradingview-frame');
  iframe.src = `https://s.tradingview.com/widgetembed/?symbol=BMFBOVESPA:${symbol}&interval=1&theme=dark`;
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
