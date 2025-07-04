const apiKey = '5bTDfSmR2ieax6y7JUqDAD'; // sua chave da Brapi
const container = document.getElementById('bubble-container');

async function getStocks() {
  const res = await fetch(`https://brapi.dev/api/quote/list?token=${apiKey}&limit=40`);
  const data = await res.json();
  return data.stocks;
}

function createBubble(stock) {
  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  const change = stock.change || 0;
  const size = Math.min(160, 40 + Math.abs(change) * 10);
  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;

  const color = change >= 0 ? '#00ff00' : '#ff0000';
  const glow = change >= 0 ? '0 0 30px #00ff00' : '0 0 30px #ff0000';
  bubble.style.backgroundColor = color;
  bubble.style.boxShadow = glow;
  bubble.innerHTML = `${stock.stock}<br>${change.toFixed(2)}%`;

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
  }, 4000);
}

async function start() {
  const stocks = await getStocks();
  stocks.forEach(createBubble);
}

start();

function filterBubbles(type) {
  alert(`Filtro ${type} ainda não implementado.`);
}

function toggleRanking() {
  alert("Ranking em breve");
}

function toggleCorretoras() {
  alert("Corretoras em breve");
}