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
      url = 'https://brapi.dev/api/quote/crypto?token=5bTDfSmR2ieax6y7JUqDAD&limit=60';
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
    return json.stocks || json.results || json.coins || [];
  } catch (e) {
    console.error('Erro ao buscar dados:', e);
    return [];
  }
}

function generateSimulatedFrequencia() {
  const corretoras = [
    { symbol: "Morgan Stanley", price: 2200, change: 1.5 },
    { symbol: "JP Morgan", price: 1800, change: -0.7 },
    { symbol: "UBS", price: 1400, change: 0.2 },
    { symbol: "Merrill Lynch", price: 1000, change: -2.1 },
    { symbol: "BTG", price: 800, change: 0.5 },
    { symbol: "XP", price: 600, change: 0.0 }
  ];
  return corretoras;
}

function createBubbles(data) {
  bubbles = data.map((item) => {
    const symbol = item.symbol || item.name || "???";

    const price = parseFloat(
      item.regularMarketPrice ||
      item.regularMarketLastPrice ||
      item.price ||
      item.last ||
      0
    );

    const change = parseFloat(item.change || item.regularMarketChangePercent || 0);
    const volume = parseFloat(item.volume || item.regularMarketVolume || 1000);
    const radius = Math.max(10, Math.min(40, volume / 20000));

    let color = "#333333";
    if (change > 0) color = "#006400";
    else if (change < 0) color = "#B22222";

    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: radius,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
      symbol,
      price: `R$${isNaN(price) ? '0,00' : price.toFixed(2).replace('.', ',')}`,
      color
    };
  });
}

function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let b of bubbles) {
    const gradient = ctx.createRadialGradient(
      b.x - b.r / 3,
      b.y - b.r / 3,
      b.r / 10,
      b.x,
      b.y,
      b.r
    );
    gradient.addColorStop(0, "#ffffff66");
    gradient.addColorStop(1, b.color);

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.shadowColor = "#00000055";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.closePath();

    ctx.font = `${Math.max(10, b.r / 2)}px sans-serif`;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(b.symbol, b.x, b.y - 5);
    ctx.font = `${Math.max(9, b.r / 2.5)}px sans-serif`;
    ctx.fillText(b.price, b.x, b.y + 12);
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