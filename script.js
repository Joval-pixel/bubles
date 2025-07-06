const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];

const apiKey = '5bTDfSmR2ieax6y7JUqDAD';
fetch(`https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=60&token=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    const stocks = data.stocks || [];
    bubbles = stocks.map((stock, i) => createBubble(stock, i));
    animate();
  });

function createBubble(stock, index) {
  const radius = Math.max(20, Math.min(80, Math.abs(stock.changePercent) * 3));
  const color = stock.changePercent >= 0 ? 'rgba(0,180,0,0.8)' : 'rgba(220,0,0,0.8)';
  const borderColor = 'white';

  return {
    x: Math.random() * (canvas.width - 2 * radius) + radius,
    y: Math.random() * (canvas.height - 2 * radius) + radius,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    radius,
    color,
    borderColor,
    symbol: stock.stock,
    price: stock.price.toFixed(2),
    change: stock.changePercent.toFixed(2)
  };
}

function drawBubble(b) {
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
  ctx.fillStyle = b.color;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = b.borderColor;
  ctx.stroke();
  ctx.closePath();

  ctx.fillStyle = 'white';
  ctx.font = `${Math.max(10, b.radius / 3)}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(b.symbol, b.x, b.y - 5);
  ctx.fillText(`${b.price} | ${b.change}%`, b.x, b.y + 15);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < bubbles.length; i++) {
    let b = bubbles[i];
    b.x += b.vx;
    b.y += b.vy;

    if (b.x + b.radius > canvas.width || b.x - b.radius < 0) b.vx *= -1;
    if (b.y + b.radius > canvas.height || b.y - b.radius < 0) b.vy *= -1;

    for (let j = i + 1; j < bubbles.length; j++) {
      const b2 = bubbles[j];
      const dx = b.x - b2.x;
      const dy = b.y - b2.y;
      const dist = Math.hypot(dx, dy);
      if (dist < b.radius + b2.radius) {
        // Simples colisão de rebote
        b.vx *= -1;
        b.vy *= -1;
        b2.vx *= -1;
        b2.vy *= -1;
      }
    }

    drawBubble(b);
  }

  requestAnimationFrame(animate);
}