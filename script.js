const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];

function loadData(tipo) {
  fetch(`https://brapi.dev/api/quote/list?token=5bTDfSmR2ieax6y7JUqDAD`)
    .then(res => res.json())
    .then(data => {
      bubbles = data.stocks.slice(0, 80).map((stock, i) => {
        const change = stock.change_percent || 0;
        const color = change > 0 ? '#006400' : change < 0 ? '#8B0000' : '#555';
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: 40 + Math.abs(change * 2),
          dx: (Math.random() - 0.5) * 0.6,
          dy: (Math.random() - 0.5) * 0.6,
          color,
          symbol: stock.symbol,
          price: stock.regularMarketPrice,
          change: change.toFixed(2)
        };
      });
    });
}

function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    // Bolha
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = b.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.closePath();

    // Texto
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = 'white';
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.fillText(b.symbol, b.x, b.y - 6);
    ctx.fillText(`R$${b.price}`, b.x, b.y + 8);
    ctx.fillText(`${b.change}%`, b.x, b.y + 22);
  }
}

function animate() {
  requestAnimationFrame(animate);
  drawBubbles();
  for (let b of bubbles) {
    b.x += b.dx;
    b.y += b.dy;

    if (b.x + b.r > canvas.width || b.x - b.r < 0) b.dx *= -1;
    if (b.y + b.r > canvas.height || b.y - b.r < 80) b.dy *= -1;
  }
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

loadData('acoes');
animate();