/************ BUBLES — script.js (API + 200 desktop / 30 mobile + auto-refresh 15s + morph) ************/

/* ===== 0) Quantidade por dispositivo ===== */
const IS_MOBILE = matchMedia("(max-width: 820px)").matches || (navigator.maxTouchPoints || 0) > 0;
const TOP_N = IS_MOBILE ? 30 : 200;

/* ===== 1) DOM ===== */
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

/* ===== 2) Estado ===== */
let currentMarket = 'brazilian';   // 'brazilian' | 'american'
let currentPeriod = 'hour';         // hour | day | week | month | year (default Hora)
let currentMetric = 'market-cap';   // market-cap | volume | price
let allData = { brazilian: [], american: [] };
let currentData = [];

/* ===== 3) Config de refresh ===== */
const REFRESH_MS = 15000;     // ⏱️ 15 segundos
const MORPH_MS   = 900;       // duração do morph (raio/cores/texto)

/* ===== 4) Fallback local (caso API falhe) ===== */
function gen(symbol, name, basePrice, baseCap) {
  const rnd = () => (Math.random()-0.5);
  return {
    symbol, name,
    price: basePrice + rnd()*basePrice*0.2,
    marketCap: baseCap + rnd()*baseCap*0.3,
    volume: Math.random()*5 + 0.1,
    hour: rnd()*4, day: rnd()*10, week: rnd()*20, month: rnd()*40, year: rnd()*200
  };
}
const fallbackBR = [
  gen('PETR4','Petrobras',35.31,460.2),
  gen('VALE3','Vale',54.71,245.8),
  gen('ITUB4','Itaú',32.22,312.5),
  gen('BBDC4','Bradesco',13.45,156.7),
  gen('ABEV3','Ambev',12.89,203.4),
  gen('WEGE3','WEG',67.89,89.3),
  gen('MGLU3','Magazine Luiza',7.28,48.9),
];
const fallbackUS = [
  gen('AAPL','Apple',185.92,2850.4),
  gen('MSFT','Microsoft',378.85,2820.1),
  gen('NVDA','NVIDIA',875.28,2156.7),
  gen('AMZN','Amazon',151.94,1590.8),
  gen('META','Meta',484.49,1234.5),
];

/* ===== 5) API (brapi) ===== */
async function fetchWithTimeout(url, ms = 8000) {
  const ctrl = new AbortController(); const t = setTimeout(()=>ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally { clearTimeout(t); }
}
function normalizeItem(it) {
  const sym = it.symbol || it.stock || it.ticker || it.code || it.name || '???';
  const name = it.longName || it.name || it.company || sym;
  const price = Number(it.close ?? it.price ?? it.regularMarketPrice ?? it.last ?? it.p) || (Math.random()*100+10);
  const mcap  = Number(it.market_cap ?? it.marketCap ?? it.marketcap ?? it.marketValue) || (Math.random()*100+10);
  const vol   = Number(it.volume ?? it.regularMarketVolume ?? it.v) || (Math.random()*10+0.1);
  const chg   = Number(it.change ?? it.regularMarketChangePercent ?? it.chg) || ((Math.random()-0.5)*4);
  const day = chg;
  return {
    symbol: String(sym).toUpperCase(),
    name, price, marketCap: mcap, volume: vol,
    hour: day * 0.25 + (Math.random()-0.5)*0.6,
    day,
    week: day * 1.9  + (Math.random()-0.5)*2.0,
    month: day * 4.0 + (Math.random()-0.5)*4.0,
    year: day * 18.0 + (Math.random()-0.5)*20.0
  };
}
async function loadMarket(market) {
  const tries = (market === 'brazilian')
    ? [
        'https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=500',
        'https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=500&exchange=b3'
      ]
    : [
        'https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=500&exchange=usa',
        'https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=500'
      ];
  for (const url of tries) {
    try {
      const json = await fetchWithTimeout(url, 9000);
      const arr = json?.stocks || json?.results || json?.data || [];
      const mapped = arr.map(normalizeItem)
        .filter(s => market === 'brazilian'
          ? /[A-Z]{4}\d|[A-Z]{3}\d{1,2}/.test(s.symbol) || s.symbol.endsWith('3') || s.symbol.endsWith('4')
          : true);
      if (mapped.length >= 20) return mapped;
    } catch (_e) {}
  }
  return market === 'brazilian' ? fallbackBR : fallbackUS;
}

/* ===== 6) Helpers ===== */
function datasetByMarket() { return currentMarket === 'brazilian' ? allData.brazilian : allData.american; }
function topNByVolume(arr) { return [...arr].sort((a,b)=>b.volume - a.volume).slice(0, TOP_N); }
function getChartSize(svgEl){
  const r = svgEl.getBoundingClientRect();
  const w = r.width  > 0 ? Math.floor(r.width)  : 800;
  const h = r.height > 0 ? Math.floor(r.height) : 600;
  return { width: Math.max(320,w), height: Math.max(420,h) };
}
function scaleRadius(value, minV, maxV){
  const MIN_R=16, MAX_R=44;
  if(maxV===minV) return (MIN_R+MAX_R)/2;
  const t=(value-minV)/(maxV-minV);
  return Math.max(MIN_R, Math.min(MAX_R, MIN_R + t*(MAX_R-MIN_R)));
}
function metricKeyOf() {
  return (currentMetric==='market-cap') ? 'marketCap'
       : (currentMetric==='volume')     ? 'volume'
       : 'price';
}

/* ===== 7) Semente + relaxamento curto ===== */
function seedPositions(data){
  const {width,height} = getChartSize(bubbleChart);
  const PADDING=12, BORDER=8, MARGIN=PADDING+BORDER;
  const CX=width/2, CY=height/2, HOLE_R=Math.min(width,height)*0.10;

  const metricKey = metricKeyOf();
  const maxV=Math.max(...data.map(s=>s[metricKey]));
  const minV=Math.min(...data.map(s=>s[metricKey]));

  const cellSize=56, cols=Math.ceil(width/cellSize), rows=Math.ceil(height/cellSize);
  const grid=Array.from({length:cols*rows},()=>[]);
  const key=(x,y)=>y*cols+x;
  const add=(pt)=>{ const gx=Math.max(0,Math.min(cols-1,Math.floor(pt.x/cellSize)));
    const gy=Math.max(0,Math.min(rows-1,Math.floor(pt.y/cellSize)));
    grid[key(gx,gy)].push(pt); pt._gx=gx; pt._gy=gy; };
  const neighbors=(pt)=>{ const out=[]; for(let gy=Math.max(0,pt._gy-1); gy<=Math.min(rows-1,pt._gy+1); gy++)
    for(let gx=Math.max(0,pt._gx-1); gx<=Math.min(cols-1,pt._gx+1); gx++) out.push(...grid[key(gx,gy)]); return out; };

  const sorted=[...data].sort((a,b)=>b[metricKey]-a[metricKey]);
  const baseAngle=Math.random()*Math.PI*2, SPIRAL_STEP=.92, SPIRAL_K=20;

  const pts=[];
  sorted.forEach((s,i)=>{
    const r=scaleRadius(s[metricKey],minV,maxV);
    let angle=baseAngle+i*SPIRAL_STEP, dist=Math.sqrt(i+1)*SPIRAL_K + r;
    let x= CX+Math.cos(angle)*dist, y= CY+Math.sin(angle)*dist;

    const MARGIN=20;
    x=Math.max(MARGIN+r, Math.min(width -MARGIN-r, x));
    y=Math.max(MARGIN+r, Math.min(height-MARGIN-r, y));

    const dx=x-CX, dy=y-CY, d=Math.hypot(dx,dy);
    if(d < HOLE_R + r){
      const nd = HOLE_R + r + 2;
      if(d===0){ x=CX+nd; y=CY; } else { x=CX+(dx/d)*nd; y=CY+(dy/d)*nd; }
    }
    const pt = { x, y, radius:r, radiusVis:r, targetR:r, stock:s, vx:0, vy:0, alpha:1, targetAlpha:1 };
    add(pt); pts.push(pt);
  });

  // relaxamento
  const ITER=8, REPEL=.45, DAMP=.85, EDGE=.08;
  for(let k=0;k<ITER;k++){
    for(const p of pts){
      for(const q of neighbors(p)){ if(q===p) continue;
        const dx=p.x-q.x, dy=p.y-q.y; const dist=Math.hypot(dx,dy)||1e-4;
        const minDist=p.radius+q.radius+4;
        if(dist<minDist){ const push=(minDist-dist)*REPEL; const ux=dx/dist, uy=dy/dist;
          p.vx+=ux*push; p.vy+=uy*push; q.vx-=ux*push*.5; q.vy-=uy*push*.5; }
      }
      if(p.x-p.radius<20) p.vx+=EDGE;
      if(p.x+p.radius>width-20) p.vx-=EDGE;
      if(p.y-p.radius<20) p.vy+=EDGE;
      if(p.y+p.radius>height-20) p.vy-=EDGE;
    }
    for(const p of pts){ p.x=Math.max(20+p.radius, Math.min(width -20-p.radius, p.x+p.vx));
      p.y=Math.max(20+p.radius, Math.min(height-20-p.radius, p.y+p.vy));
      p.vx*=DAMP; p.vy*=DAMP;
    }
  }
  return pts;
}

/* ===== 8) Render + simulação ===== */
let SIM = { points: [], nodes: [], raf:null, symbolMap:new Map(), morphT:0 };

function renderBubbles(){
  const {width,height} = getChartSize(bubbleChart);
  bubbleChart.setAttribute('viewBox', `0 0 ${width} ${height}`);
  bubbleChart.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  bubbleChart.innerHTML='';

  const positions = seedPositions(currentData);
  SIM.points = positions;
  SIM.nodes  = [];
  SIM.symbolMap.clear();

  const frag=document.createDocumentFragment();

  positions.forEach(({x,y,radius,stock}, idx)=>{
    const change=stock[currentPeriod];
    let cls= change>0 ? 'bubble-positive' : (change<0 ? 'bubble-negative' : 'bubble-neutral');

    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('class','bubble');
    g.setAttribute('data-symbol',stock.symbol);
    g.setAttribute('transform',`translate(${x},${y})`);
    g.style.opacity = 1;

    const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx',0); c.setAttribute('cy',0); c.setAttribute('r',radius);
    c.setAttribute('class',cls); c.setAttribute('stroke-width','2');
    g.appendChild(c);

    const fs1=Math.max(10, Math.min(16, radius*.36));
    const fs2=Math.max(9 , Math.min(14, radius*.30));

    let t1, t2;
    if(radius>=18){
      t1=document.createElementNS('http://www.w3.org/2000/svg','text');
      t1.setAttribute('x',0); t1.setAttribute('y', radius>=26?-5:-3);
      t1.setAttribute('class','bubble-text bubble-symbol');
      t1.setAttribute('text-anchor','middle'); t1.setAttribute('dominant-baseline','middle');
      t1.setAttribute('font-size',`${fs1}px`); t1.setAttribute('font-weight','700');
      t1.textContent=stock.symbol; g.appendChild(t1);

      t2=document.createElementNS('http://www.w3.org/2000/svg','text');
      t2.setAttribute('x',0); t2.setAttribute('y', radius>=26?9:7);
      t2.setAttribute('class','bubble-text bubble-change');
      t2.setAttribute('text-anchor','middle'); t2.setAttribute('dominant-baseline','middle');
      t2.setAttribute('font-size',`${fs2}px`); t2.setAttribute('font-weight','600');
      t2.textContent=`${change>0?'+':''}${change.toFixed(1)}%`; g.appendChild(t2);
    } else {
      t1=document.createElementNS('http://www.w3.org/2000/svg','text');
      t1.setAttribute('x',0); t1.setAttribute('y',0);
      t1.setAttribute('class','bubble-text bubble-symbol');
      t1.setAttribute('text-anchor','middle'); t1.setAttribute('dominant-baseline','middle');
      t1.setAttribute('font-size',`${fs1-1}px`); t1.setAttribute('font-weight','700');
      t1.textContent=stock.symbol.slice(0,5); g.appendChild(t1);
    }

    g.addEventListener('click', () => showStockDetails(stock));
    frag.appendChild(g);

    SIM.nodes.push({ g, c, t1, t2 });
    SIM.symbolMap.set(stock.symbol, idx);
  });

  bubbleChart.appendChild(frag);
  updateStockCounter();
  startSimulation();
}

/* ===== 9) Simulação com morph ===== */
function startSimulation(){
  stopSimulation();
  const {width,height} = getChartSize(bubbleChart);
  const CX=width/2, CY=height/2;
  const DAMP = 0.985, NOISE = IS_MOBILE ? 0.02 : 0.05, EDGE_PUSH = 0.08, CENTER = 0.0008, PASSES = 2;

  let lastMorphStart = 0;

  function lerp(a,b,t){ return a + (b-a)*t; }

  function step(ts){
    const pts = SIM.points, n=pts.length;

    // grid por frame
    const cellSize=56, cols=Math.ceil(width/cellSize), rows=Math.ceil(height/cellSize);
    const grid=Array.from({length:cols*rows},()=>[]);
    const key=(x,y)=>y*cols+x;
    for(let i=0;i<n;i++){
      const p=pts[i];
      const gx=Math.max(0,Math.min(cols-1,Math.floor(p.x/cellSize)));
      const gy=Math.max(0,Math.min(rows-1,Math.floor(p.y/cellSize)));
      grid[key(gx,gy)].push(i); p._gx=gx; p._gy=gy;
    }
    const neighborIdx=(pt)=>{
      const out=[]; for(let gy=Math.max(0,pt._gy-1);gy<=Math.min(rows-1,pt._gy+1);gy++)
        for(let gx=Math.max(0,pt._gx-1);gx<=Math.min(cols-1,pt._gx+1);gx++) out.push(...grid[key(gx,gy)]);
      return out;
    };

    // drift/bordas/centro
    for(const p of pts){
      p.vx += (Math.random()-0.5)*NOISE;
      p.vy += (Math.random()-0.5)*NOISE;
      p.vx += (CX - p.x)*CENTER;
      p.vy += (CY - p.y)*CENTER;

      if(p.x - p.radius < 20) p.vx += EDGE_PUSH;
      if(p.x + p.radius > width - 20) p.vx -= EDGE_PUSH;
      if(p.y - p.radius < 20) p.vy += EDGE_PUSH;
      if(p.y + p.radius > height - 20) p.vy -= EDGE_PUSH;
    }

    // colisão
    for(let pass=0; pass<PASSES; pass++){
      for(let i=0;i<n;i++){
        const p=pts[i];
        for(const j of neighborIdx(p)){
          if(j<=i) continue;
          const q=pts[j];
          const dx=p.x-q.x, dy=p.y-q.y;
          const dist=Math.hypot(dx,dy)||1e-4;
          const minDist=p.radius+q.radius+4;
          if(dist<minDist){
            const overlap=(minDist-dist)*0.5;
            const ux=dx/dist, uy=dy/dist;
            p.x += ux*overlap; p.y += uy*overlap;
            q.x -= ux*overlap; q.y -= uy*overlap;
          }
        }
      }
    }

    // aplica vel + atrito
    for(const p of pts){ p.x+=p.vx; p.y+=p.vy; p.vx*=DAMP; p.vy*=DAMP; }

    // ===== Morph (raio/opacidade) =====
    const t = Math.min(1, (ts - lastMorphStart) / MORPH_MS);
    for(let i=0;i<n;i++){
      const p=pts[i];
      p.radius   = lerp(p.radius,   p.targetR ?? p.radius,   0.12); // física usa radius
      p.radiusVis= lerp(p.radiusVis,p.targetR ?? p.radiusVis, 0.18); // visual um pouco mais rápido
      p.alpha    = lerp(p.alpha,    p.targetAlpha ?? 1,       0.18);

      // DOM
      const node = SIM.nodes[i];
      node.g.setAttribute('transform',`translate(${p.x},${p.y})`);
      node.g.style.opacity = p.alpha.toFixed(3);
      node.c.setAttribute('r', p.radiusVis);

      // texto pode precisar de ajuste fino de fontes
      if (node.t1) {
        const fs1=Math.max(10, Math.min(16, p.radiusVis*.36));
        node.t1.setAttribute('font-size', `${fs1}px`);
      }
      if (node.t2) {
        const fs2=Math.max(9 , Math.min(14, p.radiusVis*.30));
        node.t2.setAttribute('font-size', `${fs2}px`);
      }
    }

    SIM.raf = requestAnimationFrame(step);
  }

  SIM.raf = requestAnimationFrame((ts)=>{ step(ts); });
}

/* ===== 10) Reconciliação (morph) ===== */
function reconcileAndMorph(newTop) {
  // mapeia novos por símbolo
  const mapNew = new Map(newTop.map((s, i) => [s.symbol, { s, i }]));
  const metricKey = metricKeyOf();
  const maxV = Math.max(...newTop.map(s=>s[metricKey]));
  const minV = Math.min(...newTop.map(s=>s[metricKey]));

  // atualiza existentes
  for (let i=0;i<SIM.points.length;i++){
    const p = SIM.points[i];
    const sym = p.stock.symbol;
    if (mapNew.has(sym)) {
      // atualizar dados e metas
      const sNew = mapNew.get(sym).s;
      p.stock = sNew;
      const targetR = scaleRadius(sNew[metricKey], minV, maxV);
      p.targetR = targetR;
      p.targetAlpha = 1;

      // atualizar UI (cor e textos)
      const change = sNew[currentPeriod];
      const node = SIM.nodes[i];
      const oldClass = node.c.getAttribute('class');
      const newClass = change>0 ? 'bubble-positive' : (change<0 ? 'bubble-negative' : 'bubble-neutral');
      if (oldClass !== newClass) node.c.setAttribute('class', newClass);

      if (node.t1) node.t1.textContent = sNew.symbol;
      if (node.t2) node.t2.textContent = `${change>0?'+':''}${change.toFixed(1)}%`;
    } else {
      // símbolo saiu do TOP_N -> fade out e encolher
      p.targetAlpha = 0;
      p.targetR = Math.max(8, p.radius * 0.3);
      // remove realmente depois do morph
      setTimeout(()=> {
        const idx = SIM.points.indexOf(p);
        if (idx > -1) {
          SIM.points.splice(idx,1);
          const node = SIM.nodes.splice(idx,1)[0];
          node.g.remove();
          // recompor o mapa
          SIM.symbolMap.clear();
          SIM.points.forEach((pt, k)=> SIM.symbolMap.set(pt.stock.symbol, k));
        }
      }, MORPH_MS+100);
    }
  }

  // adiciona os que não existiam
  newTop.forEach(sNew => {
    if (!SIM.symbolMap.has(sNew.symbol)) {
      // spawn próximo ao centro, pequeno e com fade-in
      const { width, height } = getChartSize(bubbleChart);
      const x = width/2  + (Math.random()-0.5)*40;
      const y = height/2 + (Math.random()-0.5)*40;
      const r0 = 8;
      const p = { x, y, radius:r0, radiusVis:r0, targetR:r0, stock:sNew, vx:0, vy:0, alpha:0, targetAlpha:1 };

      // DOM
      const change = sNew[currentPeriod];
      const cls = change>0 ? 'bubble-positive' : (change<0 ? 'bubble-negative' : 'bubble-neutral');

      const g = document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('class','bubble'); g.setAttribute('data-symbol',sNew.symbol);
      g.setAttribute('transform',`translate(${x},${y})`);
      g.style.opacity = 0;

      const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
      c.setAttribute('cx',0); c.setAttribute('cy',0); c.setAttribute('r',r0);
      c.setAttribute('class',cls); c.setAttribute('stroke-width','2');
      g.appendChild(c);

      const t1=document.createElementNS('http://www.w3.org/2000/svg','text');
      t1.setAttribute('x',0); t1.setAttribute('y',-3);
      t1.setAttribute('class','bubble-text bubble-symbol');
      t1.setAttribute('text-anchor','middle'); t1.setAttribute('dominant-baseline','middle');
      t1.setAttribute('font-size','10px'); t1.setAttribute('font-weight','700');
      t1.textContent=sNew.symbol; g.appendChild(t1);

      const t2=document.createElementNS('http://www.w3.org/2000/svg','text');
      t2.setAttribute('x',0); t2.setAttribute('y',7);
      t2.setAttribute('class','bubble-text bubble-change');
      t2.setAttribute('text-anchor','middle'); t2.setAttribute('dominant-baseline','middle');
      t2.setAttribute('font-size','9px'); t2.setAttribute('font-weight','600');
      t2.textContent=`${change>0?'+':''}${change.toFixed(1)}%`; g.appendChild(t2);

      g.addEventListener('click', ()=> showStockDetails(sNew));
      bubbleChart.appendChild(g);

      SIM.points.push(p);
      SIM.nodes.push({ g, c, t1, t2 });
      SIM.symbolMap.set(sNew.symbol, SIM.points.length-1);

      // define raio alvo correto
      const targetR = scaleRadius(sNew[metricKey], minV, maxV);
      p.targetR = targetR;
    }
  });

  updateStockCounter();
}

/* ===== 11) UI ===== */
function updateStockCounter(){
  const total = datasetByMarket().length || 0;
  const showing = Math.min(SIM.points.length, TOP_N);
  const positive = SIM.points.filter(pt=>pt.stock[currentPeriod]>0).length;
  const negative = SIM.points.filter(pt=>pt.stock[currentPeriod]<0).length;
  if(stockCounter) stockCounter.textContent =
    `Exibindo ${showing} de ${total} ações • 🟢 ${positive} Alta • 🔴 ${negative} Baixa`;
}
function showStockDetails(stock){
  const price = stock.price.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const marketCap = stock.marketCap?.toLocaleString('pt-BR',{maximumFractionDigits:1}) ?? '-';
  const change = stock.day>0?'+':'';
  alert(`${stock.symbol} — ${stock.name}\nPreço: ${price}\nValor de Mercado: ${marketCap}\nVariação do Dia: ${change}${stock.day.toFixed(2)}%`);
}

/* ===== 12) Listeners ===== */
if(periodButtons){
  periodButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      periodButtons.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      currentPeriod = btn.dataset.period;
      // apenas refaz as classes/textos via reconcile para morph imediato
      reconcileAndMorph(topNByVolume(datasetByMarket()));
    });
  });
}
if(metricSelect){
  metricSelect.addEventListener('change', ()=>{
    currentMetric = metricSelect.value;
    reconcileAndMorph(topNByVolume(datasetByMarket()));
  });
}
if(searchInput){
  searchInput.addEventListener('input', e=>{
    const q = e.target.value.toLowerCase();
    const base = datasetByMarket();
    const filtered = q
      ? base.filter(s=> s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
      : base;
    currentData = topNByVolume(filtered);
    renderBubbles(); // nova composição para busca
  });
}
if(rangeSelect){ rangeSelect.value = `1-${TOP_N}`; rangeSelect.addEventListener('change', ()=>{ rangeSelect.value = `1-${TOP_N}`; }); }
if(settingsBtn){ settingsBtn.addEventListener('click', ()=> settingsModal && settingsModal.classList.remove('hidden')); }
if(closeModal){ closeModal?.addEventListener('click', ()=> settingsModal?.classList.add('hidden')); }
if(marketSelect){
  marketSelect.addEventListener('change', ()=>{
    currentMarket = marketSelect.value;
    currentData = topNByVolume(datasetByMarket());
    renderBubbles();
    settingsModal && settingsModal.classList.add('hidden');
  });
}

/* ===== 13) Inicialização + Auto-refresh ===== */
let refreshTimer = null;

async function refreshOnce(){
  // atualiza datasets dos dois mercados
  const [br, us] = await Promise.all([loadMarket('brazilian'), loadMarket('american')]);
  allData.brazilian = br; allData.american = us;

  // recalcula o TOP_N do mercado atual e morfa
  const nextTop = topNByVolume(datasetByMarket());
  reconcileAndMorph(nextTop);
}

function startAutoRefresh(){
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(refreshOnce, REFRESH_MS);
}

async function init() {
  const [br, us] = await Promise.all([loadMarket('brazilian'), loadMarket('american')]);
  allData.brazilian = br; allData.american = us;
  currentData = topNByVolume(datasetByMarket());
  if (rangeSelect) rangeSelect.value = `1-${TOP_N}`;
  renderBubbles();
  startAutoRefresh(); // ⏱️ ativa o auto-refresh 15s
}

document.addEventListener('DOMContentLoaded', ()=>{ setTimeout(()=>init(), 50); });

let resizeTimeout;
window.addEventListener('resize', ()=>{
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(()=>{ renderBubbles(); }, 150);
});

// Previne zoom duplo no iOS
let lastTouchEnd=0;
document.addEventListener('touchend', (ev)=>{
  const now=Date.now();
  if(now-lastTouchEnd<=300) ev.preventDefault();
  lastTouchEnd=now;
}, false);
