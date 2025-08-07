const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];

function getColor(change) {
  if (change > 0) return "#00ff00";
  if (change < 0) return "#ff3333";
  return "#888";
}

function setCategory(cat) {
  // Trocar categoria no futuro se necessário
  loadData();
}

function loadData() {
  fetch(`https://brapi.dev/api/quote/list?token=5bTDfSmR2ieax6y7JUqDAD&limit=100`)
    .then(res => res.json())
    .then(data => {
      bubbles = data.stocks.slice(0, 100).map(stock => {
        const change = parseFloat(stock.change) || 0;
        const radius = 28 + Math.min(Math.abs(change) * 1.5, 40); // tamanho mínimo maior
        return {
          symbol: stock.stock,
          price: stock.close || 0,
          change: change,
          x: Math.random() * (canvas.width - radius * 2) + radius,
          y: Math.random() * (canvas.height - radius * 2) + radius,
          r: radius,
          dx: (Math.random() - 0.5) * 0.5,
          dy: (Math.random() - 0.5) * 0.5,
          color: getColor(change)
        };
      });
    });
}

function detectCollisions() {
  for (let i = 0; i < bubbles.length; i++) {
    for (let j = i + 1; j < bubbles.length; j++) {
      const a = bubbles[i];
      const b = bubbles[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDist = a.r + b.r;
      if (distance < minDist) {
        const angle = Math.atan2(dy, dx);
        const overlap = 0.5 * (minDist - distance);
        a.x -= Math.cos(angle) * overlap;
        a.y -= Math.sin(angle) * overlap;
        b.x += Math.cos(angle) * overlap;
        b.y += Math.sin(angle) * overlap;
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "bold 12px Arial";
    ctx.fillText(b.symbol, b.x, b.y - 8);
    ctx.font = "12px Arial";
    ctx.fillText(`R$${b.price.toFixed(2)}`, b.x, b.y + 6);
    ctx.fillText(`${b.change.toFixed(2)}%`, b.x, b.y + 20);
  }
}

function update() {
  for (let b of bubbles) {
    b.x += b.dx;
    b.y += b.dy;
    // Limitar os movimentos
    if (b.x < b.r || b.x > canvas.width - b.r) b.dx *= -1;
    if (b.y < b.r || b.y > canvas.height - b.r) b.dy *= -1;
  }
  detectCollisions();
}

canvas.addEventListener("click", function (e) {
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
  const modal = document.getElementById("chartModal");
  const iframe = document.getElementById("tradingview-frame");
  iframe.src = `https://s.tradingview.com/widgetembed/?symbol=BMFBOVESPA:${symbol}&interval=1&theme=dark&style=1&locale=br#`;
  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("chartModal").style.display = "none";
}

function loop() {
  draw();
  update();
  requestAnimationFrame(loop);
}

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

loadData();
loop();
