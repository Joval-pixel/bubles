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

// Proxy público para liberar CORS no navegador
const PROXY = "https://api.allorigins.win/raw?url=";

// Intervalo de atualização de dados (ms)
const REFRESH_INTERVAL_MS = 60000;

// Bubbles em memória
let bubbles = [];
let animationId = null;

// ===============================
// FUNÇÕES DE DADOS – YAHOO FINANCE
// ===============================

async function fetchYahooQuote(symbol) {
  const url = `${PROXY}${encodeURIComponent(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
  )}`;

  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} – ${resp.statusText}`);
  }

  const json = await resp.json();
  const result = json?.chart?.result?.[0];

  if (!result || !result.meta) {
    throw new Error("Resposta inesperada do Yahoo Finance");
  }

  const price = result.meta.regularMarketPrice;
  const prevClose = result.meta.chartPreviousClose;

  if (price == null || prevClose == null) {
    throw new Error("Preço ou fechamento anterior não encontrado");
  }

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
      const quote = await fetchYahooQuote(c.simboloYahoo);
      data[c.id] = quote;
    } catch (err) {
      console.error(`Erro ao buscar ${c.nome}:`, err);
      data[c.id] = {
        price: NaN,
        changePct: 0
      };
    }
  }
  return data;
}

// ===============================
// CRIAÇÃO E ANIMAÇÃO DAS BOLHAS
// ===============================

function createBubbleElement(parent, commodity, info, layoutIndex, total) {
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

  const bubbleObj = {
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

  updateBubbleVisual(bubbleObj);
  setInitialPosition(bubbleObj, layoutIndex, total, parent);

  // Clique -> abrir TradingView
  bubble.addEventListener("click", () => {
    openTradingView(commodity, bubbleObj);
  });

  return bubbleObj;
}

function updateBubbleVisual(bubbleObj) {
  const { el, priceEl, changeEl, price, changePct, symbolEl } = bubbleObj;
  const change = Number(changePct) || 0;

  // -------------------------------
  // NOVO SISTEMA DE TAMANHO PROPORCIONAL
  // -------------------------------
  const minRadius = 55;   // tamanho mínimo da bolha
  const maxRadius = 105;  // tamanho máximo da bolha

  let varAbs = Math.abs(change);
  if (varAbs > 10) varAbs = 10; // limita variações muito grandes

  const radius = minRadius + (varAbs / 10) * (maxRadius - minRadius);

  bubbleObj.radius = radius;
  el.style.width = `${radius * 2}px`;
  el.style.height = `${radius * 2}px`;

  // Ajuste fino de fonte (bolhas menores com fonte menor)
  if (radius < 70) {
    symbolEl.style.fontSize = "11px";
    priceEl.style.fontSize = "10px";
    changeEl.style.fontSize = "10px";
  } else if (radius > 90) {
    symbolEl.style.fontSize = "14px";
    priceEl.style.fontSize = "12px";
    changeEl.style.fontSize = "12px";
  } else {
    symbolEl.style.fontSize = "13px";
    priceEl.style.fontSize = "11px";
    changeEl.style.fontSize = "11px";
  }

  // conteúdo
  if (!isNaN(price)) {
    priceEl.textContent = `Preço: ${price.toFixed(2)}`;
  } else {
    priceEl.textContent = "Preço: —";
  }

  const prefix = change > 0 ? "+" : "";
  changeEl.textContent = `Variação: ${prefix}${change.toFixed(2)}%`;

  // cor
  el.classList.remove("bubble-pos", "bubble-neg", "bubble-flat");
  if (change > 0.05) el.classList.add("bubble-pos");
  else if (change < -0.05) el.classList.add("bubble-neg");
  else el.classList.add("bubble-flat");
}

function setInitialPosition(bubbleObj, index, total, container) {
  const rect = container.getBoundingClientRect();
  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);

  const col = index % cols;
  const row = Math.floor(index / cols);

  const padding = 30;
  const usableWidth = rect.width - padding * 2;
  const usableHeight = rect.height - padding * 2;

  const cellWidth = usableWidth / cols;
  const cellHeight = usableHeight / rows;

  const cx = padding + cellWidth * col + cellWidth / 2;
  const cy = padding + cellHeight * row + cellHeight / 2;

  bubbleObj.x = cx;
  bubbleObj.y = cy;

  // velocidade suave aleatória
  const speed = 0.25 + Math.random() * 0.35;
  const angle = Math.random() * Math.PI * 2;
  bubbleObj.vx = Math.cos(angle) * speed;
  bubbleObj.vy = Math.sin(angle) * speed;

  bubbleObj.el.style.transform = `translate(${bubbleObj.x - bubbleObj.radius}px, ${
    bubbleObj.y - bubbleObj.radius
  }px)`;
}

function startAnimation(container) {
  if (animationId) cancelAnimationFrame(animationId);

  const loop = () => {
    const rect = container.getBoundingClientRect();

    // movimento + colisão com bordas
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
    }

    // colisão simples entre bolhas
    for (let i = 0; i < bubbles.length; i++) {
      for (let j = i + 1; j < bubbles.length; j++) {
        const a = bubbles[i];
        const b = bubbles[j];

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = a.radius + b.radius;

        if (dist > 0 && dist < minDist) {
          const overlap = (minDist - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;

          a.x += nx * overlap;
          a.y += ny * overlap;
          b.x -= nx * overlap;
          b.y -= ny * overlap;

          const tempVx = a.vx;
          const tempVy = a.vy;
          a.vx = b.vx;
          a.vy = b.vy;
          b.vx = tempVx;
          b.vy = tempVy;
        }
      }
    }

    // aplicar transform
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

  const symbol = commodity.simboloTV || "TVC:GOLD";
  const url = `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(
    symbol
  )}&interval=60&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=&hideideas=1&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&allow_symbol_change=1&locale=br`;

  iframe.src = url;
  modal.classList.remove("hidden");
}

function closeTradingView() {
  const modal = document.getElementById("tv-modal");
  const iframe = document.getElementById("tv-iframe");
  iframe.src = "";
  modal.classList.add("hidden");
}

// ===============================
// INICIALIZAÇÃO
// ===============================

async function initCommodities() {
  const container = document.getElementById("bubble-container");
  if (!container) return;

  container.innerHTML = `<div class="loading-text">Carregando cotações de commodities...</div>`;

  try {
    const data = await fetchAllCommodities();
    container.innerHTML = "";

    bubbles = [];
    COMMODITIES.forEach((c, index) => {
      const info = data[c.id] || { price: NaN, changePct: 0 };
      const bubbleObj = createBubbleElement(
        container,
        c,
        info,
        index,
        COMMODITIES.length
      );
      bubbles.push(bubbleObj);
    });

    startAnimation(container);
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="loading-text">Erro ao carregar dados: ${err.message}</div>`;
  }
}

function setupEvents() {
  const refreshBtn = document.getElementById("btn-refresh");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      initCommodities();
    });
  }

  // Modal TradingView
  const modal = document.getElementById("tv-modal");
  const closeBtn = document.getElementById("tv-close");
  const backdrop = document.querySelector(".tv-modal-backdrop");

  if (closeBtn) closeBtn.addEventListener("click", closeTradingView);
  if (backdrop) backdrop.addEventListener("click", closeTradingView);

  // Botões do menu (tabs) – placeholder por enquanto
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      if (tab !== "commodities") {
        alert(`A aba "${tab}" ainda não está implementada neste exemplo.`);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupEvents();
  initCommodities();

  // Atualização automática
  setInterval(initCommodities, REFRESH_INTERVAL_MS);
});
