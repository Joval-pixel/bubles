// ===============================
// CONFIGURAÇÃO GERAL
// ===============================

const PROXY = "https://api.allorigins.win/raw?url=";
const BRAPI_TOKEN = "5bTDfSmR2ieax6y7JUqDAD"; // sua chave
const REFRESH_INTERVAL_MS = 60000;

const TABS = {
  ACOES: "acoes",
  CRYPTOS: "cryptos",
  COMMODITIES: "commodities",
  RANKING: "ranking",
  BROKERS: "brokers"
};

let currentTab = TABS.ACOES;
let bubbles = [];
let animationId = null;

// ===============================
// LISTA FIXA DE COMMODITIES
// ===============================

const COMMODITIES = [
  {
    id: "gold",
    label: "OURO",
    simboloYahoo: "GC=F",
    symbolTV: "COMEX:GC1!"
  },
  {
    id: "wti",
    label: "PETRÓLEO WTI",
    simboloYahoo: "CL=F",
    symbolTV: "NYMEX:CL1!"
  },
  {
    id: "brent",
    label: "PETRÓLEO BRENT",
    simboloYahoo: "BZ=F",
    symbolTV: "ICEEU:BRN1!"
  },
  {
    id: "corn",
    label: "MILHO",
    simboloYahoo: "ZC=F",
    symbolTV: "CBOT:ZC1!"
  },
  {
    id: "soy",
    label: "SOJA",
    simboloYahoo: "ZS=F",
    symbolTV: "CBOT:ZS1!"
  },
  {
    id: "coffee",
    label: "CAFÉ",
    simboloYahoo: "KC=F",
    symbolTV: "ICEUS:KC1!"
  },
  {
    id: "sugar",
    label: "AÇÚCAR",
    simboloYahoo: "SB=F",
    symbolTV: "ICEUS:SB1!"
  }
];

// ===============================
// FETCH AÇÕES – BRAPI
// ===============================

async function fetchStocks() {
  const url = `https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=60&token=${BRAPI_TOKEN}`;

  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Brapi HTTP " + resp.status);

  const json = await resp.json();
  const list = json.stocks || json.results || [];

  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("Nenhuma ação retornada pela Brapi.");
  }

  return list.map((s) => {
    const code = s.stock || s.symbol || s.ticker;
    const price = Number(
      s.close ?? s.price ?? s.regularMarketPrice ?? s.lastPrice ?? 0
    );
    const changePct = Number(
      s.change ?? s.regularMarketChangePercent ?? s.percent ?? 0
    );

    return {
      id: code,
      label: code,
      price,
      changePct,
      symbolTV: code ? `BVMF:${code}` : ""
    };
  });
}

// ===============================
// FETCH CRIPTOS – BYBIT
// ===============================

async function fetchCryptos() {
  const bybitUrl =
    "https://api.bybit.com/v5/market/tickers?category=spot";

  const url = `${PROXY}${encodeURIComponent(bybitUrl)}`;

  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Bybit HTTP " + resp.status);

  const json = await resp.json();
  const list = json?.result?.list || [];

  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("Nenhuma cripto retornada pela Bybit.");
  }

  // ordena por volume (turnover24h)
  list.sort(
    (a, b) =>
      Number(b.turnover24h || 0) - Number(a.turnover24h || 0)
  );

  const top = list.slice(0, 60);

  return top.map((c) => {
    const symbol = c.symbol;
    const price = Number(c.lastPrice || 0);
    const pct = Number(c.price24hPcnt || 0) * 100; // vem em decimal

    return {
      id: symbol,
      label: symbol.replace("USDT", ""),
      price,
      changePct: pct,
      symbolTV: `BYBIT:${symbol}`
    };
  });
}

// ===============================
// FETCH COMMODITIES – YAHOO
// ===============================

async function fetchYahooQuote(symbol) {
  const url = `${PROXY}${encodeURIComponent(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
  )}`;

  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Yahoo HTTP " + resp.status);

  const json = await resp.json();
  const result = json?.chart?.result?.[0];

  if (!result || !result.meta) throw new Error("Resposta inválida Yahoo");

  const price = result.meta.regularMarketPrice;
  const prevClose = result.meta.chartPreviousClose;

  if (price == null || prevClose == null) {
    throw new Error("Sem preço/fechamento Yahoo");
  }

  const changePct = ((price - prevClose) / prevClose) * 100;

  return { price, changePct };
}

async function fetchCommodities() {
  const assets = [];

  for (const c of COMMODITIES) {
    try {
      const q = await fetchYahooQuote(c.simboloYahoo);
      assets.push({
        id: c.id,
        label: c.label,
        price: q.price,
        changePct: q.changePct,
        symbolTV: c.symbolTV
      });
    } catch (e) {
      console.error("Erro commodity", c.label, e);
      assets.push({
        id: c.id,
        label: c.label,
        price: NaN,
        changePct: 0,
        symbolTV: c.symbolTV
      });
    }
  }

  return assets;
}

// ===============================
// BOLHAS – CRIAÇÃO E VISUAL
// ===============================

function createBubbleElement(container, asset, index, total) {
  const bubble = document.createElement("div");
  bubble.className = "bubble";

  const symbolEl = document.createElement("div");
  symbolEl.className = "bubble-symbol";
  symbolEl.textContent = asset.label;

  const priceEl = document.createElement("div");
  priceEl.className = "bubble-price";

  const changeEl = document.createElement("div");
  changeEl.className = "bubble-change";

  bubble.appendChild(symbolEl);
  bubble.appendChild(priceEl);
  bubble.appendChild(changeEl);
  container.appendChild(bubble);

  const obj = {
    asset,
    el: bubble,
    symbolEl,
    priceEl,
    changeEl,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 0
  };

  updateBubbleVisual(obj);
  setInitialPosition(obj, index, total, container);

  bubble.addEventListener("click", () => openTradingView(asset));

  return obj;
}

function updateBubbleVisual(b) {
  const { asset, el, symbolEl, priceEl, changeEl } = b;
  const change = Number(asset.changePct) || 0;

  const minRadius = 55;
  const maxRadius = 105;

  let v = Math.abs(change);
  if (v > 10) v = 10;

  const radius = minRadius + (v / 10) * (maxRadius - minRadius);
  b.radius = radius;

  el.style.width = `${radius * 2}px`;
  el.style.height = `${radius * 2}px`;

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

  if (!isNaN(asset.price)) {
    priceEl.textContent = `Preço: ${asset.price.toFixed(2)}`;
  } else {
    priceEl.textContent = "Preço: —";
  }

  const prefix = change > 0 ? "+" : "";
  changeEl.textContent = `Variação: ${prefix}${change.toFixed(2)}%`;

  el.classList.remove("bubble-pos", "bubble-neg", "bubble-flat");
  if (change > 0.05) el.classList.add("bubble-pos");
  else if (change < -0.05) el.classList.add("bubble-neg");
  else el.classList.add("bubble-flat");
}

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

  const speed = 0.3 + Math.random() * 0.25;
  const angle = Math.random() * Math.PI * 2;
  b.vx = Math.cos(angle) * speed;
  b.vy = Math.sin(angle) * speed;

  b.el.style.transform = `translate(${b.x - b.radius}px, ${
    b.y - b.radius
  }px)`;
}

// ===============================
// ANIMAÇÃO + COLISÃO
// ===============================

function startAnimation(container) {
  if (animationId) cancelAnimationFrame(animationId);

  const loop = () => {
    if (
      ![TABS.ACOES, TABS.CRYPTOS, TABS.COMMODITIES].includes(currentTab)
    ) {
      animationId = requestAnimationFrame(loop);
      return;
    }

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

function openTradingView(asset) {
  const modal = document.getElementById("tv-modal");
  const iframe = document.getElementById("tv-iframe");
  const title = document.getElementById("tv-title");

  title.textContent = `${asset.label} – gráfico TradingView`;

  const symbol = asset.symbolTV || "BVMF:PETR4";
  const url = `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(
    symbol
  )}&interval=60&hidesidetoolbar=1&hidetoptoolbar=1&theme=dark&style=1&locale=br&hideideas=1`;

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
// PLACEHOLDER PARA RANKING/CORRETORAS
// ===============================

function getTabLabel(tab) {
  switch (tab) {
    case TABS.ACOES:
      return "Ações";
    case TABS.CRYPTOS:
      return "Criptos";
    case TABS.COMMODITIES:
      return "Commodities";
    case TABS.RANKING:
      return "Ranking";
    case TABS.BROKERS:
      return "Corretoras";
    default:
      return "";
  }
}

function showPlaceholderTab(tab) {
  const container = document.getElementById("bubble-container");
  const titleEl = document.querySelector(".panel-header h1");
  const subtitleEl = document.querySelector(".panel-subtitle");

  if (animationId) cancelAnimationFrame(animationId);
  bubbles = [];

  const label = getTabLabel(tab);

  titleEl.textContent = `Bolhas de ${label} (em breve)`;
  subtitleEl.textContent = `A aba ${label} ainda será implementada no BUBLES. Em breve você verá as bolhas com dados em tempo real aqui.`;

  container.innerHTML = "";
  const msg = document.createElement("div");
  msg.className = "loading-text";
  msg.textContent = `Em breve: visualização em bolhas para ${label}.`;
  container.appendChild(msg);
}

// ===============================
// CARREGAR ABA (AÇÕES / CRIPTOS / COMMODITIES)
// ===============================

async function loadTab(tab) {
  const container = document.getElementById("bubble-container");
  const titleEl = document.querySelector(".panel-header h1");
  const subtitleEl = document.querySelector(".panel-subtitle");

  if (![TABS.ACOES, TABS.CRYPTOS, TABS.COMMODITIES].includes(tab)) {
    currentTab = tab;
    showPlaceholderTab(tab);
    return;
  }

  currentTab = tab;
  if (animationId) cancelAnimationFrame(animationId);
  bubbles = [];

  let fetchFn;
  if (tab === TABS.ACOES) {
    titleEl.textContent = "Bolhas de Ações (B3 – Brapi)";
    subtitleEl.textContent =
      "Maiores volumes da B3 em tempo quase real. Dados fornecidos pela API Brapi.";
    fetchFn = fetchStocks;
  } else if (tab === TABS.CRYPTOS) {
    titleEl.textContent = "Bolhas de Criptos (Bybit)";
    subtitleEl.textContent =
      "Principais pares de criptomoedas negociados na Bybit. Dados spot em tempo quase real.";
    fetchFn = fetchCryptos;
  } else {
    titleEl.textContent = "Bolhas de Commodities (Yahoo Finance)";
    subtitleEl.textContent =
      "Ouro, Petróleo, Milho, Soja, Café, Açúcar em tempo quase real. Fonte: Yahoo Finance via proxy.";
    fetchFn = fetchCommodities;
  }

  container.innerHTML = `<div class="loading-text">Carregando dados...</div>`;

  try {
    const assets = await fetchFn();
    container.innerHTML = "";
    bubbles = [];

    assets.forEach((asset, index) => {
      const b = createBubbleElement(
        container,
        asset,
        index,
        assets.length
      );
      bubbles.push(b);
    });

    startAnimation(container);
  } catch (e) {
    console.error(e);
    container.innerHTML = `<div class="loading-text">Erro: ${e.message}</div>`;
  }
}

// ===============================
// EVENTOS E INICIALIZAÇÃO
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const navBtns = document.querySelectorAll(".nav-btn");

  navBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      if (!tab || tab === currentTab) return;

      navBtns.forEach((b) =>
        b.classList.toggle("active", b === btn)
      );

      loadTab(tab);
    });
  });

  const refreshBtn = document.getElementById("btn-refresh");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      loadTab(currentTab);
    });
  }

  document
    .getElementById("tv-close")
    .addEventListener("click", closeTradingView);
  document
    .querySelector(".tv-modal-backdrop")
    .addEventListener("click", closeTradingView);

  // primeira carga: AÇÕES
  loadTab(TABS.ACOES);

  // auto refresh
  setInterval(() => {
    if (
      [TABS.ACOES, TABS.CRYPTOS, TABS.COMMODITIES].includes(currentTab)
    ) {
      loadTab(currentTab);
    }
  }, REFRESH_INTERVAL_MS);
});
