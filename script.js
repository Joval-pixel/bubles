/************ BUBLES — script.js (200 desktop / 30 mobile + animação sem sobreposição) ************/

/* ========== 0) Responsividade (quantidade) ========== */
const IS_MOBILE =
  matchMedia("(max-width: 820px)").matches || (navigator.maxTouchPoints || 0) > 0;
const TOP_N = IS_MOBILE ? 30 : 200;

/* ========== 1) Dados fake realistas (mantidos) ========== */
// Função para gerar dados aleatórios realistas
function generateRandomStock(symbol, name, basePrice, baseCap) {
  const hourChange = (Math.random() - 0.5) * 4;
  const dayChange = (Math.random() - 0.5) * 10;
  const weekChange = (Math.random() - 0.5) * 20;
  const monthChange = (Math.random() - 0.5) * 40;
  const yearChange = (Math.random() - 0.5) * 200;

  return {
    symbol,
    name,
    price: basePrice + (Math.random() - 0.5) * basePrice * 0.2,
    marketCap: baseCap + (Math.random() - 0.5) * baseCap * 0.3,
    volume: Math.random() * 5 + 0.1, // usado para “mais negociadas”
    hour: hourChange,
    day: dayChange,
    week: weekChange,
    month: monthChange,
    year: yearChange
  };
}

// ---- listas (iguais às suas) ----
/* ... (mantenha exatamente as listas brazilianStocks e americanStocks
       que você já tem — omiti aqui para encurtar a resposta) ... */

/* Cole aqui TODA a sua lista 'brazilianStocks' e 'americanStocks' sem mudanças */


/* ========== 2) Estado da aplicação ========== */
let currentMarket = 'brazilian';
let currentPeriod = 'day';
let currentMetric = 'market-cap';

// escolhe top N por volume (mais negociadas)
function topNByVolume(arr) {
  return [...arr].sort((a, b) => b.volume - a.volume).slice(0, TOP_N);
}

let currentData = topNByVolume(brazilianStocks);

/* ========== 3) DOM ========== */
const bubbleChart   = document.getElementById('bubble-chart');
const searchInput   = document.getElementById('search-input');
const rangeSelect   = document.getElementById('range-select');
const periodButtons = document.querySelectorAll('.period-btn');
const metricSelect  = document.getElementById('metric-select');
const settingsBtn   = document.getElementById('settings');
const settingsModal = document.getElementById('settings-modal');
const closeModal    = document.getElementById('close-modal');
const marketSelect  = document.getElementById('market-select');
const stockCounter  = document.getElementById('stock-counter');

/* ========== 4) Helpers de layout ========== */
function getChartSize(svgEl) {
  const rect = svgEl.getBoundingClientRect();
  const width  = rect.width  > 0 ? Math.floor(rect.width)  : 800;
  const height = rect.height > 0 ? Math.floor(rect.height) : 600;
  return { width: Math.max(320, width), height: Math.max(420, height) };
}

function scaleRadius(value, minValue, maxValue) {
  const MIN_R = 16;
  const MAX_R = 44;
  if (maxValue === minValue) return (MIN_R + MAX_R) / 2;
  const t = (value - minValue) / (maxValue - minValue);
  return Math.max(MIN_R, Math.min(MAX_R, MIN_R + t * (MAX_R - MIN_R)));
}

/* ========== 5) Geração inicial (espiral + relaxamento curto) ========== */
function seedPositions(data) {
  const { width, height } = getChartSize(bubbleChart);
  const PADDING = 12;
  const BORDER_SAFE = 8;
  const MARGIN = PADDING + BORDER_SAFE;

  const CX = width / 2, CY = height / 2;
  const HOLE_R = Math.min(width, height) * 0.10;

  const metricKey = (currentMetric === 'market-cap') ? 'marketCap'
                  : (currentMetric === 'volume')    ? 'volume'
                  : 'price';

  const maxV = Math.max(...data.map(s => s[metricKey]));
  const minV = Math.min(...data.map(s => s[metricKey]));

  // grid auxiliar
  const cellSize = 56;
  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  const grid = Array.from({ length: cols * rows }, () => []);
  const idx2key = (x, y) => (y * cols + x);
  const addToGrid = (pt) => {
    const gx = Math.max(0, Math.min(cols - 1, Math.floor(pt.x / cellSize)));
    const gy = Math.max(0, Math.min(rows - 1, Math.floor(pt.y / cellSize)));
    grid[idx2key(gx, gy)].push(pt);
    pt._gx = gx; pt._gy = gy;
  };
  const updateGridCell = (pt) => {
    const nx = Math.max(0, Math.min(cols - 1, Math.floor(pt.x / cellSize)));
    const ny = Math.max(0, Math.min(rows - 1, Math.floor(pt.y / cellSize)));
    if (nx === pt._gx && ny === pt._gy) return;
    const old = grid[idx2key(pt._gx, pt._gy)];
    const i = old.indexOf(pt);
    if (i >= 0) old.splice(i, 1);
    grid[idx2key(nx, ny)].push(pt);
    pt._gx = nx; pt._gy = ny;
  };
  const neighbors = (pt) => {
    const out = [];
    for (let gy = Math.max(0, pt._gy - 1); gy <= Math.min(rows - 1, pt._gy + 1); gy++)
      for (let gx = Math.max(0, pt._gx - 1); gx <= Math.min(cols - 1, pt._gx + 1); gx++)
        out.push(...grid[idx2key(gx, gy)]);
    return out;
  };

  const sorted = [...data].sort((a, b) => b[metricKey] - a[metricKey]);
  const baseAngle = Math.random() * Math.PI * 2;
  const SPIRAL_STEP = 0.92;
  const SPIRAL_K = 20;

  const pts = [];
  sorted.forEach((s, i) => {
    const r = scaleRadius(s[metricKey], minV, maxV);
    let angle = baseAngle + i * SPIRAL_STEP;
    let dist  = Math.sqrt(i + 1) * SPIRAL_K + r;

    let x = CX + Math.cos(angle) * dist;
    let y = CY + Math.sin(angle) * dist;

    x = Math.max(MARGIN + r, Math.min(width  - MARGIN - r, x));
    y = Math.max(MARGIN + r, Math.min(height - MARGIN - r, y));

    const dx = x - CX, dy = y - CY;
    const d = Math.hypot(dx, dy);
    if (d < HOLE_R + r) {
      const nd = HOLE_R + r + 2;
      if (d === 0) { x = CX + nd; y = CY; }
      else { x = CX + (dx / d) * nd; y = CY + (dy / d) * nd; }
    }

    const pt = { x, y, radius: r, stock: s, vx: 0, vy: 0 };
    addToGrid(pt);
    pts.push(pt);
  });

  // mini relaxamento inicial
  const ITER = 8, REPEL = 0.45, DAMP = 0.85, EDGE_PUSH = 0.08;
  for (let k = 0; k < ITER; k++) {
    for (const p of pts) {
      const near = neighbors(p);
      for (const q of near) {
        if (q === p) continue;
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.hypot(dx, dy) || 0.0001;
        const minDist = p.radius + q.radius + 4;
        if (dist < minDist) {
          const push = (minDist - dist) * REPEL;
          const ux = dx / dist, uy = dy / dist;
          p.vx += ux * push; p.vy += uy * push;
          q.vx -= ux * push * 0.5; q.vy -= uy * push * 0.5;
        }
      }
      if (p.x - p.radius < MARGIN) p.vx += EDGE_PUSH;
      if (p.x + p.radius > width - MARGIN) p.vx -= EDGE_PUSH;
      if (p.y - p.radius < MARGIN) p.vy += EDGE_PUSH;
      if (p.y + p.radius > height - MARGIN) p.vy -= EDGE_PUSH;
    }
    for (const p of pts) {
      p.x = Math.max(MARGIN + p.radius, Math.min(width  - MARGIN - p.radius, p.x + p.vx));
      p.y = Math.max(MARGIN + p.radius, Math.min(height - MARGIN - p.radius, p.y + p.vy));
      p.vx *= DAMP; p.vy *= DAMP;
      updateGridCell(p);
    }
  }

  return pts;
}

/* ========== 6) Render (cria DOM) + Simulação (move sem sobrepor) ========== */
let SIM = { points: [], nodes: [], raf: null };

function renderBubbles() {
  const { width, height } = getChartSize(bubbleChart);
  bubbleChart.setAttribute('viewBox', `0 0 ${width} ${height}`);
  bubbleChart.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  bubbleChart.innerHTML = '';

  const positions = seedPositions(currentData);
  SIM.points = positions;
  SIM.nodes = [];

  const frag = document.createDocumentFragment();

  positions.forEach(({ x, y, radius, stock }) => {
    const change = stock[currentPeriod];
    let bubbleClass = 'bubble-neutral';
    if (change > 0) bubbleClass = 'bubble-positive';
    else if (change < 0) bubbleClass = 'bubble-negative';

    // Usaremos transform no grupo para animar (circle em 0,0)
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'bubble');
    g.setAttribute('data-symbol', stock.symbol);
    g.setAttribute('transform', `translate(${x},${y})`);

    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', 0);
    c.setAttribute('cy', 0);
    c.setAttribute('r', radius);
    c.setAttribute('class', bubbleClass);
    c.setAttribute('stroke-width', '2');
    g.appendChild(c);

    const fs1 = Math.max(10, Math.min(16, radius * 0.36));
    const fs2 = Math.max(9,  Math.min(14, radius * 0.30));

    if (radius >= 18) {
      const t1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t1.setAttribute('x', 0);
      t1.setAttribute('y', radius >= 26 ? -5 : -3);
      t1.setAttribute('class', 'bubble-text bubble-symbol');
      t1.setAttribute('text-anchor', 'middle');
      t1.setAttribute('dominant-baseline', 'middle');
      t1.setAttribute('font-size', `${fs1}px`);
      t1.setAttribute('font-weight', '700');
      t1.setAttribute('fill', '#ffffff');
      t1.textContent = stock.symbol;
      g.appendChild(t1);

      const t2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t2.setAttribute('x', 0);
      t2.setAttribute('y', radius >= 26 ? 9 : 7);
      t2.setAttribute('class', 'bubble-text bubble-change');
      t2.setAttribute('text-anchor', 'middle');
      t2.setAttribute('dominant-baseline', 'middle');
      t2.setAttribute('font-size', `${fs2}px`);
      t2.setAttribute('font-weight', '600');
      t2.setAttribute('fill', '#ffffff');
      t2.textContent = `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
      g.appendChild(t2);
    } else {
      const t1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t1.setAttribute('x', 0);
      t1.setAttribute('y', 0);
      t1.setAttribute('class', 'bubble-text bubble-symbol');
      t1.setAttribute('text-anchor', 'middle');
      t1.setAttribute('dominant-baseline', 'middle');
      t1.setAttribute('font-size', `${fs1 - 1}px`);
      t1.setAttribute('font-weight', '700');
      t1.setAttribute('fill', '#ffffff');
      t1.textContent = stock.symbol.length > 5 ? stock.symbol.slice(0, 5) : stock.symbol;
      g.appendChild(t1);
    }

    g.addEventListener('click', () => showStockDetails(stock));
    frag.appendChild(g);
    SIM.nodes.push(g);
  });

  bubbleChart.appendChild(frag);
  updateStockCounter();

  startSimulation(); // inicia movimento contínuo
}

/* ========== 7) Física em tempo real (sem sobreposição) ========== */
function startSimulation() {
  stopSimulation();

  const { width, height } = getChartSize(bubbleChart);
  const PADDING = 12, BORDER_SAFE = 8, MARGIN = PADDING + BORDER_SAFE;
  const CX = width / 2, CY = height / 2;

  const DAMP = 0.985;       // atrito
  const NOISE = IS_MOBILE ? 0.02 : 0.05; // drift
  const EDGE_PUSH = 0.08;   // empurra das bordas
  const CENTER = 0.0008;    // atração leve ao centro
  const PASSES = 2;         // passes de colisão por frame

  function step() {
    const pts = SIM.points;
    const n = pts.length;

    // grid por frame
    const cellSize = 56;
    const cols = Math.ceil(width / cellSize);
    const rows = Math.ceil(height / cellSize);
    const grid = Array.from({ length: cols * rows }, () => []);
    const idx2key = (x, y) => (y * cols + x);
    const pushGrid = (pt, i) => {
      const gx = Math.max(0, Math.min(cols - 1, Math.floor(pt.x / cellSize)));
      const gy = Math.max(0, Math.min(rows - 1, Math.floor(pt.y / cellSize)));
      grid[idx2key(gx, gy)].push(i);
      pt._gx = gx; pt._gy = gy;
    };
    const neighborIdx = (pt) => {
      const out = [];
      for (let gy = Math.max(0, pt._gy - 1); gy <= Math.min(rows - 1, pt._gy + 1); gy++)
        for (let gx = Math.max(0, pt._gx - 1); gx <= Math.min(cols - 1, pt._gx + 1); gx++)
          out.push(...grid[idx2key(gx, gy)]);
      return out;
    };

    for (let i = 0; i < n; i++) pushGrid(pts[i], i);

    // drift + limites + centro
    for (const p of pts) {
      p.vx += (Math.random() - 0.5) * NOISE;
      p.vy += (Math.random() - 0.5) * NOISE;

      // atração leve ao centro (evita “fuga”)
      p.vx += (CX - p.x) * CENTER;
      p.vy += (CY - p.y) * CENTER;

      // bordas
      if (p.x - p.radius < MARGIN) p.vx += EDGE_PUSH;
      if (p.x + p.radius > width - MARGIN) p.vx -= EDGE_PUSH;
      if (p.y - p.radius < MARGIN) p.vy += EDGE_PUSH;
      if (p.y + p.radius > height - MARGIN) p.vy -= EDGE_PUSH;
    }

    // colisão por passes
    for (let pass = 0; pass < PASSES; pass++) {
      for (let i = 0; i < n; i++) {
        const p = pts[i];
        const neigh = neighborIdx(p);
        for (const j of neigh) {
          if (j <= i) continue;
          const q = pts[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const minDist = p.radius + q.radius + 4;
          if (dist < minDist) {
            const overlap = (minDist - dist) * 0.5;
            const ux = dx / dist, uy = dy / dist;
            p.x += ux * overlap; p.y += uy * overlap;
            q.x -= ux * overlap; q.y -= uy * overlap;
          }
        }
      }
    }

    // aplica velocidades + atrito
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      p.vx *= DAMP; p.vy *= DAMP;
    }

    // atualiza DOM
    for (let i = 0; i < n; i++) {
      const p = pts[i];
      SIM.nodes[i].setAttribute('transform', `translate(${p.x},${p.y})`);
    }

    SIM.raf = requestAnimationFrame(step);
  }

  SIM.raf = requestAnimationFrame(step);
}

function stopSimulation() {
  if (SIM.raf) cancelAnimationFrame(SIM.raf);
  SIM.raf = null;
}

/* ========== 8) UI utilidades ========== */
function updateStockCounter() {
  const total = currentMarket === 'brazilian' ? brazilianStocks.length : americanStocks.length;
  const showing = currentData.length;
  const positive = currentData.filter(s => s[currentPeriod] > 0).length;
  const negative = currentData.filter(s => s[currentPeriod] < 0).length;

  if (stockCounter) {
    stockCounter.textContent =
      `Exibindo ${showing} de ${total} ações • 🟢 ${positive} Alta • 🔴 ${negative} Baixa`;
  }
}

function showStockDetails(stock) {
  const price = stock.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const marketCap = stock.marketCap.toFixed(1);
  const change = stock.day > 0 ? '+' : '';
  alert(`${stock.symbol} - ${stock.name}\nPreço: ${price}\nValor de Mercado: R$ ${marketCap}B\nVariação do Dia: ${change}${stock.day.toFixed(2)}%`);
}

/* ========== 9) Listeners (mantidos/ajustados) ========== */
if (periodButtons) {
  periodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      periodButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPeriod = btn.dataset.period;
      renderBubbles();
    });
  });
}

if (metricSelect) {
  metricSelect.addEventListener('change', (e) => {
    currentMetric = e.target.value;
    renderBubbles();
  });
}

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const baseData = currentMarket === 'brazilian' ? brazilianStocks : americanStocks;

    if (query) {
      currentData = topNByVolume(
        baseData.filter(stock =>
          stock.symbol.toLowerCase().includes(query) ||
          stock.name.toLowerCase().includes(query)
        )
      );
    } else {
      currentData = topNByVolume(baseData); // sempre top N por volume
    }
    renderBubbles();
  });
}

if (rangeSelect) {
  // Se quiser que o seletor continue funcionando, remapeie aqui.
  // Mas para cumprir o pedido (200/30 fixos), vamos sincronizar o rótulo
  // e ignorar mudanças do usuário.
  rangeSelect.value = `1-${TOP_N}`;
  rangeSelect.addEventListener('change', () => {
    rangeSelect.value = `1-${TOP_N}`;
  });
}

if (settingsBtn) {
  settingsBtn.addEventListener('click', () => {
    if (settingsModal) settingsModal.classList.remove('hidden');
  });
}
if (closeModal) {
  closeModal.addEventListener('click', () => {
    if (settingsModal) settingsModal.classList.add('hidden');
  });
}
if (marketSelect) {
  marketSelect.addEventListener('change', (e) => {
    currentMarket = e.target.value;
    const baseData = currentMarket === 'brazilian' ? brazilianStocks : americanStocks;
    currentData = topNByVolume(baseData);
    if (settingsModal) settingsModal.classList.add('hidden');
    renderBubbles();
  });
}
if (settingsModal) {
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) settingsModal.classList.add('hidden');
  });
}

/* ========== 10) Inicialização e resize ========== */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    // sempre top N por volume no load
    const baseData = currentMarket === 'brazilian' ? brazilianStocks : americanStocks;
    currentData = topNByVolume(baseData);
    if (rangeSelect) rangeSelect.value = `1-${TOP_N}`;
    renderBubbles();
  }, 50);
});

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    renderBubbles();
  }, 150);
});

// Prevenir zoom duplo toque no iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
  const now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) event.preventDefault();
  lastTouchEnd = now;
}, false);

/************ FIM ************/
