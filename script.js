const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const bubbles = [];
const tickers = [
  'PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'BBAS3', 'ABEV3', 'MGLU3', 'RENT3',
  'LREN3', 'WEGE3', 'B3SA3', 'EGIE3', 'SUZB3', 'HAPV3', 'NTCO3', 'RAIZ4'
];

function random(min, max) {
  return Math.random() * (max - min) + min;
}

tickers.forEach((ticker, index) => {
  const x = random(100, canvas.width - 100);
  const y = random(150, canvas.height - 100);
  const size = random(40, 100);
  bubbles.push({ x, y, r: size, color: 'green', text: ticker });
});

function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    const gradient = ctx.createRadialGradient(b.x, b.y, b.r * 0.2, b.x, b.y, b.r);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, '#00ff00');       // verde claro
    gradient.addColorStop(1, '#006400');         // verde escuro

    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 20;
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = 'white';
    ctx.font = `${b.r * 0.3}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(b.text, b.x, b.y + 5);
  }
}

setInterval(drawBubbles, 1000 / 30);

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});