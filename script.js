const symbols = ['VALE3', 'PETR4', 'ITUB4', 'B3SA3', 'BBAS3', 'WEGE3', 'ABEV3', 'MGLU3', 'BBDC4', 'LREN3'];

const API_KEY = '5bTDfSmR2ieax6y7JUqDAD';
const container = document.getElementById('bubble-container');

async function fetchData() {
  const url = `https://brapi.dev/api/quote/${symbols.join(',')}?token=${API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  return json.results;
}

function getRandomPosition(size) {
  const padding = 100;
  const x = Math.random() * (window.innerWidth - size - padding);
  const y = Math.random() * (window.innerHeight - size - padding);
  return { x, y };
}

function renderBubbles(data) {
  container.innerHTML = '';

  data.forEach(stock => {
    const bubble = document.createElement('div');
    const change = stock.changePercent || 0;
    const color = change >= 0 ? '#3cb371' : '#ff4500';
    const volume = stock.volume || 1;
    
    // escala logarítmica para tamanho equilibrado
    const size = Math.max(60, Math.log10(volume + 1) * 20);

    const { x, y } = getRandomPosition(size);

    bubble.className = 'bubble';
    bubble.style.background = color;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;

    bubble.innerHTML = `<span>${stock.stock}<br>${change.toFixed(2)}%</span>`;
    
    container.appendChild(bubble);
  });
}

async function start() {
  const data = await fetchData();
  renderBubbles(data);
}

start();
setInterval(start, 60000); // Atualiza a cada 60 segundos

