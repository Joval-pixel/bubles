const apiKey = '5bTDfSmR2ieax6y7JUqDAD'; // chave da Brapi
const container = document.getElementById('bubble-container');

async function getStocks() {
  const res = await fetch(`https://brapi.dev/api/quote/list?token=${apiKey}&limit=30`);
  const data = await res.json();
  return data.stocks || [];
}

function createBubble(stock) {
  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  const change = stock.change || 0;
  const size = Math.min(160, 40 + Math.abs(change) * 10);
  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;

  const gradient = change >= 0
    ? 'radial-gradient(circle at center, #00ff00, #007700)'
    : 'radial-gradient(circle at center, #ff0000, #770000)';
  bubble.style.background = gradient;
  bubble.style.boxShadow = change >= 0
    ? '0 0 12px #00ff00, 0 0 24px #00ff00'
    : '0 0 12px #ff0000, 0 0 24px #ff0000';

  bubble.innerHTML = `
    <div style="font-size:${Math.max(size * 0.22, 12)}px">${stock.stock}</div>
    <div style="font-size:${Math.max(size * 0.18, 10)}px">${change.toFixed(2)}%</div>
  `;

  bubble.style.left = `${Math.random() * (window.innerWidth - size)}px`;
  bubble.style.top = `${Math.random() * (window.innerHeight - size)}px`;

  moveBubble(bubble);
  container.appendChild(bubble);
}

function moveBubble(bubble) {
  setInterval(() => {
    const x = Math.random() * (window.innerWidth - bubble.offsetWidth);
    const y = Math.random() * (window.innerHeight - bubble.offsetHeight);
    bubble.style.transform = `translate(${x}px, ${y}px)`;
  }, 8000); // movimento lento
}

async function start() {
  const stocks = await getStocks();
  stocks.forEach(createBubble);
}

start();

function filterBubbles(type) {
  alert(`Filtro '${type}' ainda será implementado.`);
}

function toggleRanking() {
  alert("Ranking ainda não implementado.");
}

function toggleCorretoras() {
  alert("Corretoras ainda não implementado.");
}