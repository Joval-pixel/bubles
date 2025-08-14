// ===== Helpers responsivos =====
function getChartSize(svgEl) {
  // pega o tamanho real do SVG no layout
  const rect = svgEl.getBoundingClientRect();
  // fallback se ainda não tiver tamanho
  const width = Math.max(320, Math.floor(rect.width || 800));
  const height = Math.max(420, Math.floor(rect.height || 600));
  return { width, height };
}

function scaleRadius(value, minValue, maxValue) {
  // mantemos texto sempre visível
  const MIN_R = 16;     // antes 10/12 – melhora leitura
  const MAX_R = 44;     // evita bolhas gigantes
  if (maxValue === minValue) return (MIN_R + MAX_R) / 2;
  const t = (value - minValue) / (maxValue - minValue);
  return Math.max(MIN_R, Math.min(MAX_R, MIN_R + t * (MAX_R - MIN_R)));
}

// ===== Novo gerador de posições (espiral + relaxamento com grid) =====
function generateBubblePositions(data) {
  const { width, height } = getChartSize(bubbleChart);
  const PADDING = 12;                 // margem interna
  const BORDER_SAFE = 8;              // folga pra stroke/glow
  const MARGIN = PADDING + BORDER_SAFE;

  // “zona morta” no miolo para evitar estrela
  const CX = width / 2;
  const CY = height / 2;
  const HOLE_R = Math.min(width, height) * 0.10; // 10% do menor lado

  // ordena por valor (maiores primeiro ajuda o packing)
  const metricKey = (currentMetric === 'market-cap') ? 'marketCap'
                   : (currentMetric === 'volume')    ? 'volume'
                   : 'price';
  const sorted = [...data].sort((a, b) => b[metricKey] - a[metricKey]);

  const maxV = Math.max(...data.map(s => s[metricKey]));
  const minV = Math.min(...data.map(s => s[metricKey]));

  // semente: espiral arquimediana mais aberta
  const positions = [];
  const baseAngle = Math.random() * Math.PI * 2; // quebra simetria
  const SPIRAL_STEP = 0.92;   // >= 0.9 deixa mais espalhado
  const SPIRAL_K = 20;        // “escala” do raio da espiral

  // grid espacial para vizinhança O(1)
  const cellSize = 56; // ~ diâmetro médio
  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  const grid = Array.from({ length: cols * rows }, () => []);

  const idx2key = (x, y) => (y * cols + x);

  function addToGrid(pt) {
    const gx = Math.max(0, Math.min(cols - 1, Math.floor(pt.x / cellSize)));
    const gy = Math.max(0, Math.min(rows - 1, Math.floor(pt.y / cellSize)));
    grid[idx2key(gx, gy)].push(pt);
    pt._gx = gx;
    pt._gy = gy;
  }

  function updateGridCell(pt) {
    const nx = Math.max(0, Math.min(cols - 1, Math.floor(pt.x / cellSize)));
    const ny = Math.max(0, Math.min(rows - 1, Math.floor(pt.y / cellSize)));
    if (nx === pt._gx && ny === pt._gy) return;
    // remove antiga
    const old = grid[idx2key(pt._gx, pt._gy)];
    const i = old.indexOf(pt);
    if (i >= 0) old.splice(i, 1);
    // adiciona nova
    grid[idx2key(nx, ny)].push(pt);
    pt._gx = nx; pt._gy = ny;
  }

  function neighbors(pt) {
    const out = [];
    for (let gy = Math.max(0, pt._gy - 1); gy <= Math.min(rows - 1, pt._gy + 1); gy++) {
      for (let gx = Math.max(0, pt._gx - 1); gx <= Math.min(cols - 1, pt._gx + 1); gx++) {
        out.push(...grid[idx2key(gx, gy)]);
      }
    }
    return out;
  }

  // 1) posicionamento inicial
  sorted.forEach((s, i) => {
    const r = scaleRadius(s[metricKey], minV, maxV);
    let angle = baseAngle + i * SPIRAL_STEP;
    let dist = Math.sqrt(i + 1) * SPIRAL_K + r;

    // propõe posição
    let x = CX + Math.cos(angle) * dist;
    let y = CY + Math.sin(angle) * dist;

    // evita sair da tela
    x = Math.max(MARGIN + r, Math.min(width - MARGIN - r, x));
    y = Math.max(MARGIN + r, Math.min(height - MARGIN - r, y));

    // evita buraco central
    const dx = x - CX, dy = y - CY;
    const d = Math.hypot(dx, dy);
    if (d < HOLE_R + r) {
      const nd = HOLE_R + r + 2;
      if (d === 0) {
        x = CX + nd; y = CY;
      } else {
        x = CX + (dx / d) * nd;
        y = CY + (dy / d) * nd;
      }
    }

    const pt = { x, y, radius: r, stock: s, vx: 0, vy: 0 };
    addToGrid(pt);
    positions.push(pt);
  });

  // 2) relaxamento por colisão (poucas iterações = rápido)
  const ITER = 12;         // 10–16 deixa bem solto
  const REPEL = 0.45;      // força de repulsão
  const DAMP = 0.85;       // atrito das velocidades
  const EDGE_PUSH = 0.08;  // “gravidade” leve para dentro

  for (let k = 0; k < ITER; k++) {
    for (const p of positions) {
      // colisões (apenas vizinhos próximos via grid)
      const near = neighbors(p);
      for (const q of near) {
        if (q === p) continue;
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy) || 0.0001;
        const minDist = p.radius + q.radius + 4; // espaçamento entre bordas
        if (dist < minDist) {
          const push = (minDist - dist) * REPEL;
          const ux = dx / dist, uy = dy / dist;
          p.vx += ux * push;
          p.vy += uy * push;
          q.vx -= ux * push * 0.5; // reparte um pouco
          q.vy -= uy * push * 0.5;
        }
      }

      // bordas: empurra suavemente para dentro
      if (p.x - p.radius < MARGIN) p.vx += EDGE_PUSH;
      if (p.x + p.radius > width - MARGIN) p.vx -= EDGE_PUSH;
      if (p.y - p.radius < MARGIN) p.vy += EDGE_PUSH;
      if (p.y + p.radius > height - MARGIN) p.vy -= EDGE_PUSH;

      // centro: impedimos “buraco” colapsar
      const cdx = p.x - CX, cdy = p.y - CY;
      const cd = Math.hypot(cdx, cdy) || 0.0001;
      if (cd < HOLE_R + p.radius + 2) {
        const push = (HOLE_R + p.radius + 2 - cd) * 0.25;
        p.vx += (cdx / cd) * push;
        p.vy += (cdy / cd) * push;
      }
    }

    // aplica velocidades
    for (const p of positions) {
      p.x = Math.max(MARGIN + p.radius, Math.min(width - MARGIN - p.radius, p.x + p.vx));
      p.y = Math.max(MARGIN + p.radius, Math.min(height - MARGIN - p.radius, p.y + p.vy));
      p.vx *= DAMP;
      p.vy *= DAMP;
      updateGridCell(p);
    }
  }

  return positions;
}

// ===== Render com viewBox responsivo e fonte adaptativa =====
function renderBubbles() {
  // garante viewBox para o SVG escalar bem
  const { width, height } = getChartSize(bubbleChart);
  bubbleChart.setAttribute('viewBox', `0 0 ${width} ${height}`);
  bubbleChart.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  const positions = generateBubblePositions(currentData);
  bubbleChart.innerHTML = '';

  const frag = document.createDocumentFragment();

  positions.forEach(({ x, y, radius, stock }) => {
    const change = stock[currentPeriod];
    let bubbleClass = 'bubble-neutral';
    if (change > 0) bubbleClass = 'bubble-positive';
    else if (change < 0) bubbleClass = 'bubble-negative';

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'bubble');
    g.setAttribute('data-symbol', stock.symbol);

    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', x);
    c.setAttribute('cy', y);
    c.setAttribute('r', radius);
    c.setAttribute('class', bubbleClass);
    c.setAttribute('stroke-width', '2');
    g.appendChild(c);

    // texto: escala com o raio
    const fs1 = Math.max(10, Math.min(16, radius * 0.36)); // símbolo
    const fs2 = Math.max(9, Math.min(14, radius * 0.30));  // % var

    if (radius >= 18) {
      const t1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t1.setAttribute('x', x);
      t1.setAttribute('y', y - (radius >= 26 ? 5 : 3));
      t1.setAttribute('class', 'bubble-text bubble-symbol');
      t1.setAttribute('text-anchor', 'middle');
      t1.setAttribute('dominant-baseline', 'middle');
      t1.setAttribute('font-size', `${fs1}px`);
      t1.setAttribute('font-weight', '700');
      t1.setAttribute('fill', '#ffffff');
      t1.textContent = stock.symbol;
      g.appendChild(t1);

      const t2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t2.setAttribute('x', x);
      t2.setAttribute('y', y + (radius >= 26 ? 9 : 7));
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
      t1.setAttribute('x', x);
      t1.setAttribute('y', y);
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
  });

  bubbleChart.appendChild(frag);
  updateStockCounter();
}
