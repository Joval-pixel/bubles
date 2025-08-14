/************ BUBLES — script.js (200 desktop / 30 mobile + auto-refresh 15s + espalhamento total) ************/

/* ===== Config ===== */
const IS_MOBILE = matchMedia("(max-width: 820px)").matches || (navigator.maxTouchPoints || 0) > 0;
const TOP_N      = IS_MOBILE ? 30 : 200;
const REFRESH_MS = 15000;   // auto-refresh
const MORPH_MS   = 900;     // morph de raio/texto

/* ===== DOM ===== */
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

/* ===== Estado ===== */
let currentMarket = 'brazilian';
let currentPeriod = 'hour';
let currentMetric = 'market-cap';
let allData = { brazilian: [], american: [] };
let currentData = [];

/* ===== Fallback local ===== */
function gen(symbol, name, basePrice, baseCap) {
  const r = () => (Math.random()-0.5);
  return { symbol, name,
    price: basePrice + r()*basePrice*0.2,
    marketCap: baseCap + r()*baseCap*0.3,
    volume: Math.random()*5 + 0.1,
    hour: r()*4, day: r()*10, week: r()*20, month: r()*40, year: r()*200 };
}
const fallbackBR = [ gen('PETR4','Petrobras',35.31,460.2), gen('VALE3','Vale',54.71,245.8),
  gen('ITUB4','Itaú',32.22,312.5), gen('BBDC4','Bradesco',13.45,156.7), gen('ABEV3','Ambev',12.89,203.4),
  gen('WEGE3','WEG',67.89,89.3), gen('MGLU3','Magazine Luiza',7.28,48.9) ];
const fallbackUS = [ gen('AAPL','Apple',185.92,2850.4), gen('MSFT','Microsoft',378.85,2820.1),
  gen('NVDA','NVIDIA',875.28,2156.7), gen('AMZN','Amazon',151.94,1590.8), gen('META','Meta',484.49,1234.5) ];

/* ===== API (brapi) ===== */
async function fetchWithTimeout(url, ms = 8000) {
  const ctrl = new AbortController(); const t = setTimeout(()=>ctrl.abort(), ms);
  try { const res = await fetch(url, { signal: ctrl.signal }); if(!res.ok) throw new Error(`HTTP ${res.status}`); return await res.json(); }
  finally { clearTimeout(t); }
}
function normalizeItem(it) {
  const sym = it.symbol || it.stock || it.ticker || it.code || it.name || '???';
  const name = it.longName || it.name || it.company || sym;
  const price = Number(it.close ?? it.price ?? it.regularMarketPrice ?? it.last ?? it.p) || (Math.random()*100+10);
  const mcap  = Number(it.market_cap ?? it.marketCap ?? it.marketcap ?? it.marketValue) || (Math.random()*100+10);
  const vol   = Number(it.volume ?? it.regularMarketVolume ?? it.v) || (Math.random()*10+0.1);
  const chg   = Number(it.change ?? it.regularMarketChangePercent ?? it.chg) || ((Math.random()-0.5)*4);
  const day = chg;
  return { symbol:String(sym).toUpperCase(), name, price, marketCap:mcap, volume:vol,
    hour: day*0.25 + (Math.random()-0.5)*0.6, day, week: day*1.9 + (Math.random()-0.5)*2.0,
    month: day*4.0 + (Math.random()-0.5)*4.0, year: day*18.0 + (Math.random()-0.5)*20.0 };
}
async function loadMarket(market) {
  const tries = (market==='brazilian')
    ? ['https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=500',
       'https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=500&exchange=b3']
    : ['https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=500&exchange=usa',
       'https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=500'];
  for(const url of tries){
    try{
      const j = await fetchWithTimeout(url, 9000);
      const arr = j?.stocks || j?.results || j?.data || [];
      const mapped = arr.map(normalizeItem).filter(s => market==='brazilian'
        ? /[A-Z]{4}\d|[A-Z]{3}\d{1,2}/.test(s.symbol) || /[34]$/.test(s.symbol)
        : true);
      if(mapped.length>=20) return mapped;
    }catch{}
  }
  return market==='brazilian' ? fallbackBR : fallbackUS;
}

/* ===== Helpers ===== */
function datasetByMarket(){ return currentMarket==='brazilian' ? allData.brazilian : allData.american; }
function topNByVolume(a){ return [...a].sort((x,y)=>y.volume-x.volume).slice(0, TOP_N); }
function getChartSize(svg){ const r=svg.getBoundingClientRect(); const w=r.width>0?Math.floor(r.width):800; const h=r.height>0?Math.floor(r.height):600; return {width:Math.max(320,w), height:Math.max(420,h)}; }
function metricKeyOf(){ return currentMetric==='market-cap' ? 'marketCap' : currentMetric==='volume' ? 'volume' : 'price'; }
/* raios adaptados ao número de bolhas */
function scaleRadius(v, minV, maxV){
  const n=TOP_N; const MAX_R = n>150 ? 30 : n>80 ? 36 : 44; const MIN_R = n>150 ? 10 : n>80 ? 12 : 16;
  if(maxV===minV) return (MIN_R+MAX_R)/2;
  const t=(v-minV)/(maxV-minV); return MIN_R + t*(MAX_R-MIN_R);
}

/* ===== Seed aleatório (preenche a área útil) ===== */
function seedPositions(data){
  const {width,height} = getChartSize(bubbleChart);
  const PAD = 20;
  const metricKey = metricKeyOf();
  const maxV=Math.max(...data.map(s=>s[metricKey]));
  const minV=Math.min(...data.map(s=>s[metricKey]));
  const pts=[];
  for(const s of data){
    const r=scaleRadius(s[metricKey],minV,maxV);
    const x = PAD + r + Math.random()*(width  - 2*(PAD+r));
    const y = PAD + r + Math.random()*(height - 2*(PAD+r));
    pts.push({ x,y, radius:r, radiusVis:r, stock:s, vx:0, vy:0 });
  }
  return pts;
}

/* ===== Render inicial ===== */
let SIM = { points: [], nodes: [], raf:null, symbolMap:new Map() };

function renderBubbles(){
  const {width,height} = getChartSize(bubbleChart);
  bubbleChart.setAttribute('viewBox', `0 0 ${width} ${height}`);
  bubbleChart.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  bubbleChart.innerHTML='';

  const positions = seedPositions(currentData);
  SIM.points = positions; SIM.nodes=[]; SIM.symbolMap.clear();

  const frag=document.createDocumentFragment();
  positions.forEach(({x,y,radius,stock}, idx)=>{
    const change=stock[currentPeriod];
    const cls = change>0 ? 'bubble-positive' : change<0 ? 'bubble-negative' : 'bubble-neutral';

    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('class','bubble'); g.setAttribute('data-symbol',stock.symbol);
    g.setAttribute('transform',`translate(${x},${y})`);

    const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx',0); c.setAttribute('cy',0); c.setAttribute('r',radius);
    c.setAttribute('class',cls); c.setAttribute('stroke-width','2'); g.appendChild(c);

    const fs1=Math.max(10, Math.min(16, radius*.36));
    const fs2=Math.max(9 , Math.min(14, radius*.30));

    let t1,t2;
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

    g.addEventListener('click', ()=> showStockDetails(stock));
    frag.appendChild(g);
    SIM.nodes.push({ g, c, t1, t2 });
    SIM.symbolMap.set(stock.symbol, idx);
  });

  bubbleChart.appendChild(frag);
  updateStockCounter();
  startSimulation();
}

/* ===== Simulação: repulsão contínua + pressão radial + bordas ===== */
function startSimulation(){
  stopSimulation();
  let {width,height} = getChartSize(bubbleChart);

  // parâmetros de força
  const DAMP      = 0.986;
  const NOISE     = IS_MOBILE ? 0.03 : 0.06;
  const CENTER    = 0.00015;            // bem fraco (só para estabilidade)
  const EDGE_SPR  = 0.12;               // mola de borda
  const PASS_COL  = 2;                  // passes de colisão
  const INFL_PAD  = 60;                 // alcance extra de repulsão
  const K_REP     = 0.9;                // intensidade da repulsão contínua
  const SEP_ADD   = 6;                  // separação mínima adicional
  const FILL      = 0.70;               // % do menor lado que o cluster deve ocupar
  const OUT_RAD   = () => Math.min(width, height) * FILL / 2; // raio alvo

  function step(){
    // tamanho pode mudar (resize)
    ({width,height} = getChartSize(bubbleChart));
    const CX=width/2, CY=height/2;

    // grid
    const cell=64, cols=Math.ceil(width/cell), rows=Math.ceil(height/cell);
    const grid=Array.from({length:cols*rows},()=>[]);
    const key=(x,y)=>y*cols+x;

    // inserir
    for(let i=0;i<SIM.points.length;i++){
      const p=SIM.points[i];
      const gx=Math.max(0,Math.min(cols-1,Math.floor(p.x/cell)));
      const gy=Math.max(0,Math.min(rows-1,Math.floor(p.y/cell)));
      (grid[key(gx,gy)]).push(i);
      p._gx=gx; p._gy=gy;
    }

    const neighbors=(p)=>{
      const out=[]; for(let gy=Math.max(0,p._gy-1); gy<=Math.min(rows-1,p._gy+1); gy++)
        for(let gx=Math.max(0,p._gx-1); gx<=Math.min(cols-1,p._gx+1); gx++)
          out.push(...grid[key(gx,gy)]);
      return out;
    };

    // forças de campo
    const targetR = OUT_RAD();
    for(const p of SIM.points){
      // leve ruído
      p.vx += (Math.random()-0.5)*NOISE;
      p.vy += (Math.random()-0.5)*NOISE;

      // atração de estabilidade ao centro
      p.vx += (CX - p.x)*CENTER;
      p.vy += (CY - p.y)*CENTER;

      // pressão radial para ocupar a área (empurra para fora quando dentro do raio alvo)
      const dx=p.x-CX, dy=p.y-CY, d=Math.hypot(dx,dy)||1e-6;
      const press = (targetR - d) / targetR; // positivo se está muito dentro
      p.vx += (dx/d) * press * 0.0032;       // 0.0032 = intensidade radial
      p.vy += (dy/d) * press * 0.0032;

      // molas de borda (mantém tudo dentro)
      const pad=16;
      if(p.x - p.radius < pad) p.vx += EDGE_SPR;
      if(p.x + p.radius > width - pad) p.vx -= EDGE_SPR;
      if(p.y - p.radius < pad) p.vy += EDGE_SPR;
      if(p.y + p.radius > height - pad) p.vy -= EDGE_SPR;
    }

    // repulsão contínua + correção de colisão
    for(let pass=0; pass<PASS_COL; pass++){
      for(let i=0;i<SIM.points.length;i++){
        const p=SIM.points[i];
        for(const j of neighbors(p)){
          if(j<=i) continue;
          const q=SIM.points[j];
          const dx=p.x-q.x, dy=p.y-q.y;
          const dist=Math.hypot(dx,dy) || 1e-6;
          const ux=dx/dist,  uy=dy/dist;

          const minSep = p.radius + q.radius + SEP_ADD;

          // repulsão contínua (até um alcance extra)
          const influence = minSep + INFL_PAD;
          if(dist < influence){
            const strength = K_REP * (1 - dist/influence); // decai com a distância
            const f = strength * 0.6;
            p.vx += ux * f; p.vy += uy * f;
            q.vx -= ux * f; q.vy -= uy * f;
          }

          // correção se encostou
          if(dist < minSep){
            const over = (minSep - dist) * 0.5;
            p.x += ux*over; p.y += uy*over;
            q.x -= ux*over; q.y -= uy*over;
          }
        }
      }
    }

    // integrar + atrito + DOM
    for(let i=0;i<SIM.points.length;i++){
      const p=SIM.points[i];
      p.x += p.vx; p.y += p.vy; p.vx *= DAMP; p.vy *= DAMP;

      // clamp final
      p.x = Math.max(p.radius+2, Math.min(width  - p.radius-2, p.x));
      p.y = Math.max(p.radius+2, Math.min(height - p.radius-2, p.y));

      const node = SIM.nodes[i];
      node.g.setAttribute('transform',`translate(${p.x},${p.y})`);
      node.c.setAttribute('r', p.radiusVis ?? p.radius);
    }

    SIM.raf = requestAnimationFrame(step);
  }

  SIM.raf = requestAnimationFrame(step);
}
function stopSimulation(){ if(SIM.raf) cancelAnimationFrame(SIM.raf); SIM.raf=null; }

/* ===== Reconciliação (morph suave) ===== */
function metricKey(){ return metricKeyOf(); }
function reconcileAndMorph(newTop){
  const mKey = metricKey();
  const maxV=Math.max(...newTop.map(s=>s[mKey])); const minV=Math.min(...newTop.map(s=>s[mKey]));
  const mapNew = new Map(newTop.map(s=>[s.symbol,s]));

  // atualiza existentes / remove que saíram
  for(let i=0;i<SIM.points.length;i++){
    const p=SIM.points[i]; const sNew = mapNew.get(p.stock.symbol);
    if(sNew){
      p.stock = sNew;
      const r1 = scaleRadius(sNew[mKey],minV,maxV);
      const node = SIM.nodes[i];
      const change = sNew[currentPeriod];
      const cls = change>0 ? 'bubble-positive' : change<0 ? 'bubble-negative' : 'bubble-neutral';
      if(node.c.getAttribute('class')!==cls) node.c.setAttribute('class',cls);
      if(node.t1) node.t1.textContent=sNew.symbol;
      if(node.t2) node.t2.textContent=`${change>0?'+':''}${change.toFixed(1)}%`;
      const r0 = p.radiusVis ?? p.radius; const t0=performance.now();
      (function anim(ts){ const t=Math.min(1,(ts-t0)/MORPH_MS); p.radiusVis=r0+(r1-r0)*t; if(t<1) requestAnimationFrame(anim); })(t0);
    }else{
      // shrink + remove
      const node = SIM.nodes[i];
      const r0 = p.radiusVis ?? p.radius; const t0=performance.now();
      (function anim(ts){
        const t=Math.min(1,(ts-t0)/MORPH_MS); const val=r0*(1-t*0.8); p.radiusVis=val; node.g.style.opacity=String(1-t);
        if(t>=1){ SIM.points.splice(i,1); SIM.nodes.splice(i,1); node.g.remove(); }
      })(t0);
    }
  }

  // adiciona novos
  newTop.forEach(s=>{
    if(!SIM.points.find(pt=>pt.stock.symbol===s.symbol)){
      const {width,height} = getChartSize(bubbleChart);
      const x = 20 + Math.random()*(width-40), y = 20 + Math.random()*(height-40);
      const r0 = 10, r1 = scaleRadius(s[mKey],minV,maxV);
      const p={ x,y, radius:r1, radiusVis:r0, stock:s, vx:0, vy:0 };
      const change = s[currentPeriod];
      const cls = change>0 ? 'bubble-positive' : change<0 ? 'bubble-negative' : 'bubble-neutral';

      const g=document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('class','bubble'); g.setAttribute('data-symbol',s.symbol); g.setAttribute('transform',`translate(${x},${y})`);
      const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
      c.setAttribute('cx',0); c.setAttribute('cy',0); c.setAttribute('r',r0); c.setAttribute('class',cls); c.setAttribute('stroke-width','2');
      g.appendChild(c);

      const t1=document.createElementNS('http://www.w3.org/2000/svg','text');
      t1.setAttribute('x',0); t1.setAttribute('y',-3); t1.setAttribute('class','bubble-text bubble-symbol');
      t1.setAttribute('text-anchor','middle'); t1.setAttribute('dominant-baseline','middle'); t1.setAttribute('font-size','10px'); t1.setAttribute('font-weight','700');
      t1.textContent=s.symbol; g.appendChild(t1);

      const t2=document.createElementNS('http://www.w3.org/2000/svg','text');
      t2.setAttribute('x',0); t2.setAttribute('y',7); t2.setAttribute('class','bubble-text bubble-change');
      t2.setAttribute('text-anchor','middle'); t2.setAttribute('dominant-baseline','middle'); t2.setAttribute('font-size','9px'); t2.setAttribute('font-weight','600');
      t2.textContent=`${change>0?'+':''}${change.toFixed(1)}%`; g.appendChild(t2);

      g.addEventListener('click', ()=> showStockDetails(s));
      bubbleChart.appendChild(g);

      SIM.points.push(p); SIM.nodes.push({g,c,t1,t2});
      const t0=performance.now(); (function anim(ts){ const t=Math.min(1,(ts-t0)/MORPH_MS); p.radiusVis=r0+(r1-r0)*t; if(t<1) requestAnimationFrame(anim); })(t0);
    }
  });

  updateStockCounter();
}

/* ===== UI ===== */
function updateStockCounter(){
  const total = datasetByMarket().length || 0;
  const showing = Math.min(SIM.points.length, TOP_N);
  const positive = SIM.points.filter(pt=>pt.stock[currentPeriod]>0).length;
  const negative = SIM.points.filter(pt=>pt.stock[currentPeriod]<0).length;
  if(stockCounter) stockCounter.textContent = `Exibindo ${showing} de ${total} ações • 🟢 ${positive} Alta • 🔴 ${negative} Baixa`;
}
function showStockDetails(stock){
  const price = stock.price.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const marketCap = stock.marketCap?.toLocaleString('pt-BR',{maximumFractionDigits:1}) ?? '-';
  const change = stock.day>0?'+':'';
  alert(`${stock.symbol} — ${stock.name}\nPreço: ${price}\nValor de Mercado: ${marketCap}\nVariação do Dia: ${change}${stock.day.toFixed(2)}%`);
}

/* ===== Listeners ===== */
if(periodButtons){
  periodButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      periodButtons.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      currentPeriod = btn.dataset.period;
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
    const filtered = q ? base.filter(s=> s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)) : base;
    currentData = topNByVolume(filtered);
    renderBubbles();
  });
}
if(rangeSelect){ rangeSelect.value=`1-${TOP_N}`; rangeSelect.addEventListener('change', ()=>{ rangeSelect.value=`1-${TOP_N}`; }); }
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

/* ===== Init + Auto-refresh ===== */
let refreshTimer=null;
async function refreshOnce(){
  const [br, us] = await Promise.all([loadMarket('brazilian'), loadMarket('american')]);
  allData.brazilian=br; allData.american=us;
  const nextTop = topNByVolume(datasetByMarket());
  reconcileAndMorph(nextTop);
}
function startAutoRefresh(){ if(refreshTimer) clearInterval(refreshTimer); refreshTimer = setInterval(refreshOnce, REFRESH_MS); }
async function init(){
  const [br, us] = await Promise.all([loadMarket('brazilian'), loadMarket('american')]);
  allData.brazilian=br; allData.american=us;
  currentData = topNByVolume(datasetByMarket());
  if(rangeSelect) rangeSelect.value=`1-${TOP_N}`;
  renderBubbles();
  startAutoRefresh();
}
document.addEventListener('DOMContentLoaded', ()=>{ setTimeout(()=>init(), 50); });

let resizeTimeout;
window.addEventListener('resize', ()=>{ clearTimeout(resizeTimeout); resizeTimeout=setTimeout(()=>{ renderBubbles(); }, 150); });

// iOS double-tap
let lastTouchEnd=0;
document.addEventListener('touchend', e=>{ const now=Date.now(); if(now-lastTouchEnd<=300) e.preventDefault(); lastTouchEnd=now; }, false);
