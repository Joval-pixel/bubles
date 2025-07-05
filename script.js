const container = document.getElementById('bubble-container');
const modal = document.getElementById('modal-chart');
const modalClose = document.getElementById('modal-close');
const modalFrame = document.getElementById('tradingview');
const rankingPanel = document.getElementById('ranking-panel');
const rankingContent = document.getElementById('ranking-content');
const apiKey = '5bTDfSmR2ieax6y7JUqDAD';
let currentCategory = 'stocks';

modalClose.onclick = () => modal.classList.add('hidden');

function setCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('#menu button').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`#menu button[onclick="setCategory('${cat}')"]`).classList.add('active');
  loadData();
}

function toggleRanking() {
  rankingPanel.classList.toggle('hidden');
}

function moveBubble(bubble) {
  setInterval(() => {
    const x = Math.random() * (window.innerWidth - bubble.offsetWidth);
    const y = Math.random() * (window.innerHeight - bubble.offsetHeight);
    bubble.style.transform = `translate(${x}px, ${y}px)`;
  }, 8000);
}

function openChart(symbol) {
  modal.classList.remove('hidden');
  modalFrame.src = `https://s.tradingview.com/widgetembed/?symbol=BMFBOVESPA:${symbol}&theme=dark&style=1`;
}

function createBubble(item) {
  const change = item.change || 0;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const size = Math.min(160, 40 + Math.abs(change) * 10);
  const fontSize = Math.max(size * 0.2, 12);
  const subFont = Math.max(size * 0.15, 10);
  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;
  bubble.style.background = change >= 0
    ? 'radial-gradient(circle, #00ff00, #007700)'
    : 'radial-gradient(circle, #ff0000, #770000)';
  bubble.style.boxShadow = change >= 0
    ? '0 0 12px #00ff00, 0 0 24px #00ff00'
    : '0 0 12px #ff0000, 0 0 24px #ff0000';
  bubble.innerHTML = `
    <div style="font-size:${fontSize}px">${item.stock || item.coin || item.name}</div>
    <div style="font-size:${subFont}px">${change.toFixed(2)}%</div>
  `;
  bubble.onclick = () => openChart(item.stock || item.coin || item.name);
  bubble.style.left = `${Math.random() * (window.innerWidth - size)}px`;
  bubble.style.top = `${Math.random() * (window.innerHeight - size)}px`;
  moveBubble(bubble);
  container.appendChild(bubble);
}

function loadCorretoras() {
  container.innerHTML = '';
  rankingContent.innerHTML = '';

  const corretoras = [
    { nome: 'Morgan Stanley', saldo: 3200, volume: 55000 },
    { nome: 'JP Morgan', saldo: -2100, volume: 48000 },
    { nome: 'UBS', saldo: 1500, volume: 39000 },
    { nome: 'Merrill Lynch', saldo: -800, volume: 31000 },
  ];

  corretoras.forEach(cor => {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const size = Math.min(160, 60 + Math.abs(cor.saldo) / 20);
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    const isPositive = cor.saldo >= 0;
    bubble.style.background = isPositive
      ? 'radial-gradient(circle, #00ffcc, #005544)'
      : 'radial-gradient(circle, #ff0066, #550022)';
    bubble.style.boxShadow = isPositive
      ? '0 0 12px #00ffee, 0 0 24px #00ffee'
      : '0 0 12px #ff0055, 0 0 24px #ff0055';
    bubble.innerHTML = `
      <div style="font-size:${Math.max(size * 0.2, 14)}px">${cor.nome}</div>
      <div style="font-size:${Math.max(size * 0.14, 10)}px">Saldo: ${cor.saldo}</div>
    `;
    bubble.onclick = () => alert(`${cor.nome}\\nSaldo: ${cor.saldo}\\nVolume: ${cor.volume}`);
    bubble.style.left = `${Math.random() * (window.innerWidth - size)}px`;
    bubble.style.top = `${Math.random() * (window.innerHeight - size)}px`;
    moveBubble(bubble);
    container.appendChild(bubble);
  });
}

async function loadData() {
  if (currentCategory === 'corretoras') {
    loadCorretoras();
    return;
  }

  container.innerHTML = '';
  rankingContent.innerHTML = 'Carregando...';

  let url = '';
  if (currentCategory === 'stocks') {
    url = `https://brapi.dev/api/quote/list?token=${apiKey}&limit=30`;
  } else if (currentCategory === 'crypto') {
    url = `https://brapi.dev/api/crypto?token=${apiKey}&limit=30`;
  } else {
    url = `https://brapi.dev/api/quote/list?token=${apiKey}&limit=30`;
  }

  const res = await fetch(url);
  const data = await res.json();
  const items = data.stocks || data.coins || [];

  items.forEach(createBubble);

  const sorted = [...items].sort((a, b) => (b.change || 0) - (a.change || 0));
  rankingContent.innerHTML = sorted.slice(0, 10).map(item =>
    `<div>${item.stock || item.coin || item.name}: ${item.change?.toFixed(2) || '0.00'}%</div>`
  ).join('');
}

loadData();
