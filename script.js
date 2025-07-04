const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = innerWidth;
canvas.height = innerHeight;

let bubbles = [];

function fetchData() {
  fetch('https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=100&token=5bTDfSmR2ieax6y7JUqDAD')
    .then(res => res.json())
    .then(data => {
      bubbles = data.stocks.map(stock => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        r: 20 + Math.abs(stock.change) * 50,
        color: stock.change > 0 ? 'lime' : stock.change < 0 ? 'red' : 'gray',
        symbol: stock.stock,
        change: stock.change.toFixed(2)
      }));
    });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    b.x += b.vx;
    b.y += b.vy;

    if (b.x - b.r < 0 || b.x + b.r > canvas.width) b.vx *= -1;
    if (b.y - b.r < 0 || b.y + b.r > canvas.height) b.vy *= -1;

    const gradient = ctx.createRadialGradient(b.x, b.y, b.r * 0.1, b.x, b.y, b.r);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, b.color);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = `${Math.min(b.r * 0.5, 18)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(b.symbol, b.x, b.y - 5);
    ctx.fillText(`${b.change}%`, b.x, b.y + 12);
  }

  requestAnimationFrame(draw);
}

function showCategory(category) {
  console.log('Categoria:', category);
  // Implementar filtros no futuro
}

fetchData();
draw();
setInterval(fetchData, 15000);