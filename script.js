const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

function drawBubble(x, y, radius, color, text) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
  ctx.fillStyle = 'white';
  ctx.font = `${Math.max(radius / 5, 12)}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
}

function createBubbles(stocks) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const maxRadius = 100;
  const minRadius = 30;
  const maxVolume = Math.max(...stocks.map(s => s.volume || 1));
  const spacing = canvas.width / (stocks.length + 1);
  stocks.forEach((stock, index) => {
    const radius = Math.max(minRadius, (stock.volume / maxVolume) * maxRadius);
    const x = spacing * (index + 1);
    const y = canvas.height / 2;
    const color = stock.change >= 0 ? 'green' : 'red';
    const text = `${stock.name}\n${stock.change.toFixed(2)}%`;
    drawBubble(x, y, radius, color, text);
  });
}

fetch('https://brapi.dev/api/quote/list?token=5bTDfSmR2ieax6y7JUqDAD&sortBy=volume&limit=6')
  .then(res => res.json())
  .then(data => {
    const stocks = data.stocks.map(s => ({
      name: s.stock,
      change: s.change,
      volume: s.volume
    }));
    console.log('Dados recebidos:', stocks);
    createBubbles(stocks);
  })
  .catch(err => console.error('Erro ao buscar dados:', err));
