/************ BUBLES — script.js (200 desktop / 30 mobile + animação sem sobreposição) ************/

/* ===== 0) Responsividade (quantidade) ===== */
const IS_MOBILE = matchMedia("(max-width: 820px)").matches || (navigator.maxTouchPoints || 0) > 0;
const TOP_N = IS_MOBILE ? 30 : 200;

/* ===== 1) DADOS =====
   Use suas listas completas abaixo (brazilianStocks e americanStocks).
   Se você já tem as listas carregadas neste mesmo arquivo, mantenha-as como estão.
   (Removi daqui para encurtar a resposta)
*/
// >>> COLE AQUI SUAS LISTAS COMPLETAS <<<
// const brazilianStocks = [ ...100+... ];
// const americanStocks  = [ ...100+... ];

/* ===== 2) Estado ===== */
let currentMarket = 'brazilian';
let currentPeriod = 'day';
let currentMetric = 'market-cap';

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

/* ===== 3) Helpers ===== */
function datasetByMarket() {
  return currentMarket === 'brazilian' ? brazilianStocks : americanStocks;
}
function topNByVolume(arr) {
  // Pega SEMPRE as mais negociadas (volume) e limita a TOP_N
  return [...arr].sort((a, b) => b.volume - a.volume).slice(0, TOP_N);
}
let currentData = topNByVolume(datasetByMarket());

function getChartSize(svgEl){
  const r = svgEl.getBoundingClientRect();
  const w = r.width  > 0 ? Math.floor(r.width)  : 800;
  const h = r.height > 0 ? Math.floor(r.height) : 600;
  return { width: Math.max(320, w), height: Math.max(420, h) };
}
function scaleRadius(value, minV, maxV){
  const MIN_R=16, MAX_R=44;
  if(maxV===minV) return (MIN_R+MAX_R)/2;
  const t=(value-minV)/(maxV-minV);
  return Math.max(MIN_R, Math.min(MAX_R, MIN_R + t*(MAX_R-MIN_R)));
}

/* ===== 4) Semente (espiral) + relaxamento curto ===== */
function seedPositions(data){
  const {width,height} = getChartSize(bubbleChart);
  const PADDING=12, BORDER=8, MARGIN=PADDING+BORDER;
  const CX=width/2, CY=height/2;
  const HOLE_R=Math.min(width,height)*0.10;

  const metricKey = (currentMetric==='market-cap')?'marketCap'
                   :(currentMetric==='volume')?'volume':'price';

  const maxV=Math.max(...data.map(s=>s[metricKey]));
  const minV=Math.min(...data.map(s=>s[metricKey]));

  // grid auxiliar
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

    x=Math.max(MARGIN+r, Math.min(width -MARGIN-r, x));
    y=Math.max(MARGIN+r, Math.min(height-MARGIN-r, y));

    const dx=x-CX, dy=y-CY, d=Math.hypot(dx,dy);
    if(d < HOLE_R + r){
      const nd = HOLE_R + r + 2;
      if(d===0){ x=CX+nd; y=CY; } else { x=CX+(dx/d)*nd; y=CY+(dy/d)*nd; }
    }
    const pt = { x, y, radius:r, stock:s, vx:0, vy:0 };
    add(pt); pts.push(pt);
  });

  // mini relaxamento
  const ITER=8, REPEL=.45, DAMP=.85, EDGE=.08;
  for(let k=0;k<ITER;k++){
    for(const p of pts){
      for(const q of neighbors(p)){ if(q===p) continue;
        const dx=p.x-q.x, dy=p.y-q.y; const dist=Math.hypot(dx,dy)||1e-4;
        const minDist=p.radius+q.radius+4;
        if(dist<minDist){ const push=(minDist-dist)*REPEL; const ux=dx/dist, uy=dy/dist;
          p.vx+=ux*push; p.vy+=uy*push; q.vx-=ux*push*.5; q.vy-=uy*push*.5; }
      }
      if(p.x-p.radius<MARGIN) p.vx+=EDGE;
      if(p.x+p.radius>width-MARGIN) p.vx-=EDGE;
      if(p.y-p.radius<MARGIN) p.vy+=EDGE;
      if(p.y+p.radius>height-MARGIN) p.vy-=EDGE;
    }
    for(const p of pts){ p.x=Math.max(MARGIN+p.radius, Math.min(width -MARGIN-p.radius, p.x+p.vx));
      p.y=Math.max(MARGIN+p.radius, Math.min(height-MARGIN-p.radius, p.y+p.vy));
      p.vx*=DAMP; p.vy*=DAMP;
    }
  }
  return pts;
}

/* ===== 5) Render (DOM) + Simulação em tempo real ===== */
let SIM = { points: [], nodes: [], raf:null };

function renderBubbles(){
  const {width,height} = getChartSize(bubbleChart);
  bubbleChart.setAttribute('viewBox', `0 0 ${width} ${height}`);
  bubbleChart.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  bubbleChart.innerHTML='';

  const positions = seedPositions(currentData);
  SIM.points = positions;
  SIM.nodes  = [];

  const frag=document.createDocumentFragment();

  positions.forEach(({x,y,radius,stock})=>{
    const change=stock[currentPeriod];
    let cls='bubble-neutral'; if(change>0) cls='bubble-positive'; else if(change<0) cls='bubble-negative';

    // Grupo com transform para animar
    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('class','bubble'); g.setAttribute('data-symbol',stock.symbol);
    g.setAttribute('transform',`translate(${x},${y})`);

    const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx',0); c.setAttribute('cy',0); c.setAttribute('r',radius);
    c.setAttribute('class',cls); c.setAttribute('stroke-width','2');
    g.appendChild(c);

    const fs1=Math.max(10, Math.min(16, radius*.36));
    const fs2=Math.max(9 , Math.min(14, radius*.30));

    if(radius>=18){
      const t1=document.createElementNS('http://www.w3.org/2000/svg','text');
      t1.setAttribute('x',0); t1.setAttribute('y', radius>=26?-5:-3);
      t1.setAttribute('class','bubble-text bubble-symbol');
      t1.setAttribute('text-anchor','middle'); t1.setAttribute('dominant-baseline','middle');
      t1.setAttribute('font-size',`${fs1}px`); t1.setAttribute('font-weight','700'); t1.setAttribute('fill','#fff');
      t1.textContent=stock.symbol; g.appendChild(t1);

      const t2=document.createElementNS('http://www.w3.org/2000/svg','text');
      t2.setAttribute('x',0); t2.setAttribute('y', radius>=26?9:7);
      t2.setAttribute('class','bubble-text bubble-change');
      t2.setAttribute('text-anchor','middle'); t2.setAttribute('dominant-baseline','middle');
      t2.setAttribute('font-size',`${fs2}px`); t2.setAttribute('font-weight','600'); t2.setAttribute('fill','#fff');
      t2.textContent=`${change > 0 ? '+' : ''}${change.toFixed(1)}%`; g.appendChild(t2);
    } else {
      const t1=document.createElementNS('http://www.w3.org/2000/svg','text');
      t1.setAttribute('x',0); t1.setAttribute('y',0);
      t1.setAttribute('class','bubble-text bubble-symbol');
      t1.setAttribute('text-anchor','middle'); t1.setAttribute('dominant-baseline','middle');
      t1.setAttribute('font-size',`${fs1-1}px`); t1.setAttribute('font-weight','700'); t1.setAttribute('fill','#fff');
      t1.textContent=stock.symbol.slice(0,5); g.appendChild(t1);
    }

    g.addEventListener('click', () => showStockDetails(stock));
    frag.appendChild(g); SIM.nodes.push(g);
  });

  bubbleChart.appendChild(frag);
  updateStockCounter();
  startSimulation();
}

function startSimulation(){
  stopSimulation();
  const {width,height} = getChartSize(bubbleChart);
  const PADDING=12, BORDER=8, MARGIN=PADDING+BORDER;
  const CX=width/2, CY=height/2;

  const DAMP = 0.985;                    // atrito
  const NOISE = IS_MOBILE ? 0.02 : 0.05; // drift
  const EDGE_PUSH = 0.08;                // empurra bordas
  const CENTER = 0.0008;                 // atração ao centro
  const PASSES = 2;                      // colisões por frame

  function step(){
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

      if(p.x - p.radius < MARGIN) p.vx += EDGE_PUSH;
      if(p.x + p.radius > width - MARGIN) p.vx -= EDGE_PUSH;
      if(p.y - p.radius < MARGIN) p.vy += EDGE_PUSH;
      if(p.y + p.radius > height - MARGIN) p.vy -= EDGE_PUSH;
    }

    // correção de colisão
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

    // aplica velocidades + atrito
    for(const p of pts){ p.x+=p.vx; p.y+=p.vy; p.vx*=DAMP; p.vy*=DAMP; }

    // DOM
    for(let i=0;i<n;i++){
      const p=pts[i];
      SIM.nodes[i].setAttribute('transform',`translate(${p.x},${p.y})`);
    }

    SIM.raf = requestAnimationFrame(step);
  }
  SIM.raf = requestAnimationFrame(step);
}
function stopSimulation(){ if(SIM.raf) cancelAnimationFrame(SIM.raf); SIM.raf=null; }

/* ===== 6) UI util ===== */
function updateStockCounter(){
  const total = datasetByMarket().length;
  const showing = currentData.length;
  const positive = currentData.filter(s=>s[currentPeriod]>0).length;
  const negative = currentData.filter(s=>s[currentPeriod]<0).length;
  if(stockCounter) stockCounter.textContent =
    `Exibindo ${showing} de ${total} ações • 🟢 ${positive} Alta • 🔴 ${negative} Baixa`;
}
function showStockDetails(stock){
  const price = stock.price.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const marketCap = stock.marketCap.toFixed(1);
  const change = stock.day>0?'+':'';
  alert(`${stock.symbol} - ${stock.name}\nPreço: ${price}\nValor de Mercado: R$ ${marketCap}B\nVariação do Dia: ${change}${stock.day.toFixed(2)}%`);
}

/* ===== 7) Listeners ===== */
if(periodButtons){
  periodButtons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      periodButtons.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      currentPeriod = btn.dataset.period;
      renderBubbles();
    });
  });
}
if(metricSelect){
  metricSelect.addEventListener('change', e=>{
    currentMetric = e.target.value;
    renderBubbles();
  });
}
if(searchInput){
  searchInput.addEventListener('input', e=>{
    const q = e.target.value.toLowerCase();
    const base = datasetByMarket();
    if(q){
      currentData = topNByVolume(base.filter(s=> s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)));
    } else {
      currentData = topNByVolume(base);
    }
    renderBubbles();
  });
}
if(rangeSelect){
  // Mantém o rótulo, mas NÃO deixa reduzir a quantidade
  rangeSelect.value = `1-${TOP_N}`;
  rangeSelect.addEventListener('change', ()=>{ rangeSelect.value = `1-${TOP_N}`; });
}
if(settingsBtn){ settingsBtn.addEventListener('click', ()=> settingsModal && settingsModal.classList.remove('hidden')); }
if(closeModal){ closeModal.addEventListener('click', ()=> settingsModal && settingsModal.classList.add('hidden')); }
if(marketSelect){
  marketSelect.addEventListener('change', e=>{
    currentMarket = e.target.value;
    currentData = topNByVolume(datasetByMarket());
    renderBubbles();
    settingsModal && settingsModal.classList.add('hidden');
  });
}

/* ===== 8) Inicialização & Resize ===== */
document.addEventListener('DOMContentLoaded', ()=>{
  setTimeout(()=>{ 
    currentData = topNByVolume(datasetByMarket());
    if(rangeSelect) rangeSelect.value = `1-${TOP_N}`;
    renderBubbles();
  }, 50);
});

let resizeTimeout;
window.addEventListener('resize', ()=>{
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(()=>{
    // Se trocar de breakpoint, recalcula TOP_N dinamicamente:
    const wasMobile = IS_MOBILE;
    // (para simplicidade, recarregue a página se quiser reavaliar 30/200)
    renderBubbles();
  }, 150);
});

// Previne zoom duplo no iOS
let lastTouchEnd=0;
document.addEventListener('touchend', (ev)=>{
  const now=Date.now();
  if(now-lastTouchEnd<=300) ev.preventDefault();
  lastTouchEnd=now;
}, false);
