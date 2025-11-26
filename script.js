// ===============================
// CONFIGURAÇÃO DAS COMMODITIES
// ===============================

const COMMODITIES = [
  {
    id: "gold",
    nome: "OURO",
    simboloYahoo: "GC=F",
    simboloTV: "COMEX:GC1!"
  },
  {
    id: "wti",
    nome: "PETRÓLEO WTI",
    simboloYahoo: "CL=F",
    simboloTV: "NYMEX:CL1!"
  },
  {
    id: "brent",
    nome: "PETRÓLEO BRENT",
    simboloYahoo: "BZ=F",
    simboloTV: "ICEEU:BRN1!"
  },
  {
    id: "corn",
    nome: "MILHO",
    simboloYahoo: "ZC=F",
    simboloTV: "CBOT:ZC1!"
  },
  {
    id: "soy",
    nome: "SOJA",
    simboloYahoo: "ZS=F",
    simboloTV: "CBOT:ZS1!"
  },
  {
    id: "coffee",
    nome: "CAFÉ",
    simboloYahoo: "KC=F",
    simboloTV: "ICEUS:KC1!"
  },
  {
    id: "sugar",
    nome: "AÇÚCAR",
    simboloYahoo: "SB=F",
    simboloTV: "ICEUS:SB1!"
  }
];

const PROXY = "https://api.allorigins.win/raw?url=";
const REFRESH_INTERVAL_MS = 60000;

let bubbles = [];
let animationId = null;


// ===============================
// BUSCAR DADOS YAHOO FINANCE
// ===============================

async function fetchYahooQuote(symbol) {
  const url = `${PROXY}${encodeURIComponent(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
  )}`;

  const resp = await fetch(url);
  if (!resp.ok) throw new Error("HTTP " + resp.status);

  const json = await resp.json();
  const result = json?.chart?.result?.[0];

  if (!result || !result.meta) throw new Error("Resposta inválida");

  const price = result.meta.regularMarketPrice;
  const prevClose = result.meta.chartPreviousClose;

  if (price == null || prevClose == null) throw new Error("Sem preços");

  const changePct = ((price - prevClose) / prevClose) * 100;

  return {
    price,
    changePct
  };
}

async function fetchAllCommodities() {
  const data = {};
  for (const c of COMMODITIES) {
    try {
      data[c.id] = await fetchYahooQuote(c.simboloYahoo);
    } catch (e) {
      console.error("Erro ao buscar:", c.nome, e);
      data[c.id] = { price: NaN, changePct: 0 };
    }
  }
  return data;
}


// ===============================
// CRIAÇÃO DA BOLHA
// ===============================

function createBubbleElement(parent, commodity, info, index, total) {
  const bubble = document.createElement("div");
  bubble.className = "bubble";

  const symbolEl = document.createElement("div");
  symbolEl.className = "bubble-symbol";
  symbolEl.textContent = commodity.nome;

  const priceEl = document.createElement("div");
  priceEl.className = "bubble-price";

  const changeEl = document.createElement("div");
  changeEl.className = "bubble-change";

  bubble.appendChild(symbolEl);
  bubble.appendChild(priceEl);
  bubble.appendChild(changeEl);
  parent.appendChild(bubble);

  const obj = {
    id: commodity.id,
    commodity,
    el: bubble,
    symbolEl,
    priceEl,
    changeEl,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 0,
    price: info.price,
    changePct: info.changePct
  };

  updateBubbleVisual(obj);
  setInitialPosition(obj, index, total, parent);

  bubble.addEventListener("click", () => openTradingView(commodity));

  return obj;
}


// ===============================
// ESTILO DA BOLHA + TAMANHO PROPORCIONAL
// ===============================

function updateBubbleVisual(b) {
  const change = Number(b.changePct) || 0;

  const minRadius = 55;
  const maxRadius = 105;

  let v = Math.abs(change);
  if (v > 10) v = 10;

  const radius = minRadius + (v / 10) * (maxRadius - minRadius);

  b.radius = radius;
  b.el.style.width = `${radius * 2}px`;
  b.el.style.height = `${radius * 2}px`;

  // Fonte adaptável
  if (radius < 70) {
    b.symbolEl.style.fontSize = "11px";
    b.priceEl.style.fontSize = "10px";
    b.changeEl.style.fontSize = "10px";
  } else if (radius > 90) {
    b.symbolEl.style.fontSize = "14px";
    b.priceEl.style.fontSize = "12px";
    b.changeEl.style.fontSize = "12px";
  } else {
    b.symbolEl.style.fontSize = "13px";
    b.priceEl.style.fontSize = "11px";
    b.changeEl.style.fontSize = "11px";
  }

  // Texto
  if (!isNaN(b.price)) {
    b.priceEl.textContent = `Preço: ${b.price.toFixed(2)}`;
  } else {
    b.priceEl.textContent = "Preço: —";
  }

  const prefix = change > 0 ? "+" : "";
  b.changeEl.textContent = `Variação: ${prefix}${change.toFixed(2)}%`;

  b.el.classList.remove("bubble-pos", "bubble-neg", "bubble-flat");
  if (change > 0.05) b.el.classList.add("bubble-pos");
  else if (change < -0.05) b.el.classList.add("bubble-neg");
  else b.el.classList.add("bubble-flat");
}


// ===============================
// POSIÇÃO INICIAL EM GRID
// ===============================

function setInitialPosition(b, index, total, container) {
  const rect = container.getBoundingClientRect();

  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);

  const col = index % cols;
  const row = Math.floor(index / cols);

  const padding = 40;

  const usableWidth = rect.width - padding * 2;
  const usableHeight = rect.height - padding * 2;

  const cellW = usableWidth / cols;
  const cellH = usableHeight / rows;

  b.x = padding + cellW * col + cellW / 2;
  b.y = padding + cellH * row + cellH / 2;

  // velocidades iniciais
  const speed = 0.3 + Math.random() * 0.25;
  const angle = Math.random() * Math.PI * 2;
  b.vx = Math.cos(angle) * speed;
  b.vy = Math.sin(angle) * speed;

  b.el.style.transform = `translate(${b.x - b.radius}px, ${
    b.y - b.radius
  }px)`;
}


// ===============================
// ANIMAÇÃO + COLISÃO REAL
// ===============================

function startAnimation(container) {
  if (animationId) cancelAnimationFrame(animationId);

  const loop = () => {
    const rect = container.getBoundingClientRect();

    for (const b of bubbles) {
      b.x += b.vx;
      b.y += b.vy;

      const left = b.x - b.radius;
      const right = b.x + b.radius;
      const top = b.y - b.radius;
      const bottom = b.y + b.radius;

      if (left < 0) {
        b.x = b.radius;
        b.vx = Math.abs(b.vx);
      } else if (right > rect.width) {
        b.x = rect.width - b.radius;
        b.vx = -Math.abs(b.vx);
      }

      if (top < 0) {
        b.y = b.radius;
        b.vy = Math.abs(b.vy);
      } else if (bottom > rect.height) {
        b.y = rect.height - b.radius;
        b.vy = -Math.abs(b.vy);
      }

      b.vx *= 0.995;
      b.vy *= 0.995;
    }

    // Colisão com mais força + sem sobreposição
    const iterations = 3;
    for (let k = 0; k < iterations; k++) {
      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const a = bubbles[i];
          const b = bubbles[j];

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;

          const minDist = a.radius + b.radius + 12;

          if (dist < minDist) {
            const overlap = (minDist - dist) / 2;

            const nx = dx / dist;
            const ny = dy / dist;

            a.x -= nx * overlap;
            a.y -= ny * overlap;

            b.x += nx * overlap;
            b.y += ny * overlap;

            const avx = a.vx;
            const avy = a.vy;
            a.vx = b.vx * 0.85;
            a.vy = b.vy * 0.85;
            b.vx = avx * 0.85;
            b.vy = avy * 0.85;
          }
        }
      }
    }

    for (const b of bubbles) {
      b.el.style.transform = `translate(${b.x - b.radius}px, ${
        b.y - b.radius
      }px)`;
    }

    animationId = requestAnimationFrame(loop);
  };

  animationId = requestAnimationFrame(loop);
}


// ===============================
// TRADINGVIEW MODAL
// ===============================

function openTradingView(commodity) {
  const modal = document.getElementById("tv-modal");
  const iframe = document.getElementById("tv-iframe");
  const title = document.getElementById("tv-title");

  title.textContent = `${commodity.nome} – gráfico TradingView`;

  const url = `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(
    commodity.simboloTV
  )}&interval=60&hide_side_toolbar=1&theme=dark&style=1&locale=br`;

  iframe.src = url;
  modal.classList.remove("hidden");
}

function closeTradingView() {
  document.getElementById("tv-modal").classList.add("hidden");
  document.getElementById("tv-iframe").src = "";
}


// ===============================
// INICIALIZAÇÃO
// ===============================

async function initCommodities() {
  const container = document.getElementById("bubble-container");
  container.innerHTML = `<div class="loading-text">Carregando...</div>`;

  try {
    const data = await fetchAllCommodities();
    container.innerHTML = "";
    bubbles = [];

    COMMODITIES.forEach((c, i) => {
      const info = data[c.id] || { price: NaN, changePct: 0 };
      const bubble = createBubbleElement(
        container,
        c,
        info,
        i,
        COMMODITIES.length
      );
      bubbles.push(bubble);
    });

    startAnimation(container);
  } catch (e) {
    container.innerHTML = `<div class="loading-text">Erro: ${e.message}</div>`;
  }
}


// ===============================
// EVENTOS
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  initCommodities();

  document.getElementById("btn-refresh")
    .addEventListener("click", initCommodities);

  document.getElementById("tv-close")
    .addEventListener("click", closeTradingView);

  document.querySelector(".tv-modal-backdrop")
    .addEventListener("click", closeTradingView);

  setInterval(initCommodities, REFRESH_INTERVAL_MS);
});
