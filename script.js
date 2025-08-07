const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let currentTab = 'acoes';
let bubbles = [];

async function fetchData(tab) {
  let url = '';
  switch (tab) {
    case 'acoes':
      url = 'https://brapi.dev/api/quote/list?token=5bTDfSmR2ieax6y7JUqDAD&sortBy=volume&limit=100';
      break;
    case 'criptos':
      url = 'https://brapi.dev/api/quote/crypto?token=5bTDfSmR2ieax6y7JUqDAD&sortBy=volume&limit=60';
      break;
    case 'commodities':
      url = 'https://brapi.dev/api/quote/commodities?token=5bTDfSmR2ieax6y7JUqDAD';
      break;
    case 'opcoes':
      url = 'https://brapi.dev/api/quote/options?token=5bTDfSmR2ieax6y7JUqDAD&type=call&sortBy=volume&limit=100';
      break;
    case 'frequencia':
      return generateSimulatedFrequencia();
  }

  try {
    const res = await fetch(url);
    const json = await res.json();
    const data = json.stocks || json.results || json.coins || [];
    return data;
  } catch (e) {
    console.error('Erro ao buscar dados:', e);
    return [];
  }
}

function generateSimulatedFrequencia() {
  const corretoras = [
    { name: "Morgan Stanley", value: 2200 },
    { name: "JP Morgan", value: 1800 },
    { name: "UBS", value: 1400 },
    { name: "Merrill Lynch", value: 1000 },
    { name: "BTG", value: 800 },
    { name: "XP", value: 600 },
  ];
  return corretoras.map(c => ({
    symbol: c.name,
    change: (Math.random() * 4 - 2).toFixed(2),
    volume: c.value
  }));
}

function createBubbles(data) {
  bubbles = data.map((item) => {
    const volume = parseFloat(item.volume || item.regularMarketVolume || 1000);
    const change = parseFloat(item.change || item.regularMarketChangePercent || 0);
    const symbol = item.symbol || item.name || "???";
    const radius = Math.max(10, Math.min(40, volume / 20000)); // bolhas menores

    let color = "#333333"; // cinza escuro padrão
    if (change > 0) color = "#006400";       // verde escuro
    else if (change < 0) color = "#8B0000";  // vermelho escuro

    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: radius,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      label: symbol,
      change: isNaN(change) ? 0 : change.toFixed(2),
      color: color
    };
  });
}

function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let b of bubbles) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.shadowColor = "#00000055";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();

    const fontSize = Math.max(10, Math.min(13, b.r / 2));
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(b.label, b.x, b.y - 5);
    ctx.fillText(`${b.change}%`, b.x, b.y + 12);
  }
}

function updateBubbles() {
  for (let b of bubbles) {
    b.x += b.dx;
    b.y += b.dy;

    if (b.x + b.r > canvas.width || b.x - b.r < 0) b.dx *= -1;
    if (b.y + b.r > canvas.height || b.y - b.r < 0) b.dy *= -1;
  }
}

function animate() {
  drawBubbles();
  updateBubbles();
  requestAnimationFrame(animate);
}

async function showTab(tab) {
  currentTab = tab;
  const data = await fetchData(tab);
  createBubbles(data);
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

showTab(currentTab);
animate();