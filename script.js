/* ============ CryptoBubbles-like bubbles (SVG + physics) ============ */

/* config */
const IS_MOBILE  = matchMedia("(max-width:820px)").matches || (navigator.maxTouchPoints||0) > 0;
const TOP_N      = IS_MOBILE ? 30 : 200;
const REFRESH_MS = 15000;
const MORPH_MS   = 900;

/* DOM */
const svg          = document.getElementById('bubble-chart');
const searchInput  = document.getElementById('search-input');
const typeSelect   = document.getElementById('type-select');
const sectorSelect = document.getElementById('sector-select');
const rangeSelect  = document.getElementById('range-select');
const metricSelect = document.getElementById('metric-select');
const marketSelect = document.getElementById('market-select');
const stockCounter = document.getElementById('stock-counter');
const periodBtns   = document.querySelectorAll('.period-btn');
const settingsBtn  = document.getElementById('settings');
const settingsModal= document.getElementById('settings-modal');
const closeModal   = document.getElementById('close-modal');

/* estado */
let currentMarket='brazilian', currentPeriod='day', currentMetric='volume';
let master={ brazilian:[], american:[] }, current=[];
let sim={ pts:[], nodes:[], raf:null };

/* util */
const size = ()=>{ const r=svg.getBoundingClientRect(); return {w:Math.max(320,Math.floor(r.width||800)), h:Math.max(420,Math.floor(r.height||600))} };
const money=(n, mkt)=> (n!=null) ? n.toLocaleString('pt-BR',{style:'currency', currency:(mkt==='brazilian'?'BRL':'USD'), maximumFractionDigits:2}) : '-';
const topN=a=>[...a].sort((x,y)=>(y.volume??0)-(x.volume??0)).slice(0,TOP_N);
const metricKey=()=> currentMetric==='market-cap' ? 'marketCap' : currentMetric==='price' ? 'price' : 'volume';

/* raios estilo CryptoBubbles: bem compactos, com escala por volume */
function scaleR(v, vmin, vmax){
  const n=TOP_N; const Rmax=n>150?32: n>80?42:52, Rmin=n>150?12: n>80?14:18;
  if(!(vmax>vmin)) return (Rmax+Rmin)/2;
  const t=(v-vmin)/(vmax-vmin); return Rmin + t*(Rmax-Rmin);
}

/* heurísticas + normalização brapi */
function inferType(sym,t){ if(t) return t; if(/11$/.test(sym)) return 'FII/Units'; if(/3[45]$/.test(sym)) return 'BDR'; return 'Ação'; }
function inferSector(s){ return s||'Desconhecido'; }
function pickLogo(d){ return d.logo || d.logourl || d.logoUrl || d.image || null; }

async function fetchWithTimeout(url,ms=9000){ const c=new AbortController(); const t=setTimeout(()=>c.abort(),ms);
  try{ const r=await fetch(url,{signal:c.signal}); if(!r.ok) throw new Error(r.status); return await r.json(); }
  finally{ clearTimeout(t); } }

function normalize(it){
  const symbol=String(it.symbol||it.stock||it.ticker||it.code||it.name||'').toUpperCase();
  const name=it.longName||it.name||it.company||symbol;
  const price=Number(it.close ?? it.price ?? it.regularMarketPrice ?? it.last ?? it.p);
  const mcap =Number(it.market_cap ?? it.marketCap ?? it.marketcap ?? it.marketValue);
  const vol  =Number(it.volume ?? it.regularMarketVolume ?? it.v);
  const chg  =Number(it.change ?? it.regularMarketChangePercent ?? it.chg);
  const day  = Number.isFinite(chg) ? chg : (Math.random()-0.5)*4;
  return {
    symbol, name,
    price: Number.isFinite(price)?price:null,
    marketCap: Number.isFinite(mcap)?mcap:null,
    volume: Number.isFinite(vol)?vol:Math.random()*1e6,
    hour: day*0.25 + (Math.random()-0.5)*0.6,
    day,
    week: day*1.9 + (Math.random()-0.5)*2.0,
    month: day*4.0 + (Math.random()-0.5)*4.0,
    year: day*18.0 + (Math.random()-0.5)*20.0,
    type: inferType(symbol, it.type),
    sector: inferSector(it.sector),
    logo: pickLogo(it)
  };
}

async function loadMarket(market){
  const urls = (market==='brazilian')
    ? ['https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=500',
       'https://brapi.dev/api/quote/list?sortBy=market_cap&sortOrder=desc&limit=500']
    : ['https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=500&exchange=usa',
       'https://brapi.dev/api/quote/list?sortBy=market_cap&sortOrder=desc&limit=500&exchange=usa'];
  for(const u of urls){
    try{
      const j=await fetchWithTimeout(u,10000);
      const arr=j?.stocks || j?.results || j?.data || [];
      const mapped=arr.map(normalize).filter(x=>x.symbol);
      if(mapped.length>20) return mapped;
    }catch{}
  }
  return [];
}

/* filtros */
function applyFilters(){
  const base=master[currentMarket]||[];
  const q=(searchInput.value||'').trim().toLowerCase();
  const t=typeSelect.value||'', s=sectorSelect.value||'';
  let out=base;
  if(q) out=out.filter(x=>x.symbol.toLowerCase().includes(q)||(x.name||'').toLowerCase().includes(q));
  if(t) out=out.filter(x=>x.type===t);
  if(s) out=out.filter(x=>x.sector===s);
  current = topN(out);
  render();
}
function populateFilterOptions(){
  const types=new Set(), sectors=new Set();
  (master[currentMarket]||[]).forEach(x=>{ types.add(x.type); sectors.add(x.sector); });
  const tSel=typeSelect.value, sSel=sectorSelect.value;
  typeSelect.innerHTML=`<option value="">Todos os tipos</option>${[...types].sort().map(v=>`<option>${v}</option>`).join('')}`;
  sectorSelect.innerHTML=`<option value="">Todos os setores</option>${[...sectors].sort().map(v=>`<option>${v}</option>`).join('')}`;
  if([...typeSelect.options].some(o=>o.value===tSel)) typeSelect.value=tSel;
  if([...sectorSelect.options].some(o=>o.value===sSel)) sectorSelect.value=sSel;
}

/* layout base */
function setView(){ const {w,h}=size(); svg.setAttribute('viewBox',`0 0 ${w} ${h}`); svg.setAttribute('preserveAspectRatio','xMidYMid meet'); return {w,h}; }
function baseRadInfo(list){ const key=metricKey(); const vmax=Math.max(...list.map(s=>s[key]??0)); const vmin=Math.min(...list.map(s=>s[key]??0)); return {key,vmin,vmax}; }
function seed(list){
  const {w,h}=size(); const PAD=20; const {key,vmin,vmax}=baseRadInfo(list);
  return list.map(s=>{
    const r=scaleR(s[key]??0, vmin, vmax);
    const x=PAD+r+Math.random()*(w-2*(PAD+r));
    const y=PAD+r+Math.random()*(h-2*(PAD+r));
    return {x,y, r, rv:r, s};
  });
}

/* render */
function render(){
  setView(); svg.innerHTML='';
  if(!sim.pts.length) sim.pts=seed(current);
  else {
    const map=new Map(sim.pts.map(p=>[p.s.symbol,p]));
    const {key,vmin,vmax}=baseRadInfo(current);
    const next=[];
    current.forEach(s=>{
      const r=scaleR(s[key]??0, vmin, vmax);
      const old=map.get(s.symbol);
      if(old){ old.s=s; old.targetR=r; next.push(old); }
      else {
        const {w,h}=size(); const PAD=20;
        const x=PAD+r+Math.random()*(w-2*(PAD+r)); const y=PAD+r+Math.random()*(h-2*(PAD+r));
        next.push({x,y, r, rv:12, targetR:r, s});
      }
    });
    sim.pts=next;
  }

  const defs=document.createElementNS('http://www.w3.org/2000/svg','defs');
  svg.appendChild(defs);

  sim.nodes=[];
  const frag=document.createDocumentFragment();

  sim.pts.forEach((p,i)=>{
    const s=p.s, chg = s[currentPeriod] ?? s.day ?? 0;
    const isPos = chg>0, isNeg = chg<0;
    const gradId = `g-${i}-${s.symbol}`;
    const grad = document.createElementNS('http://www.w3.org/2000/svg','radialGradient');
    grad.setAttribute('id', gradId);
    grad.setAttribute('cx','50%'); grad.setAttribute('cy','40%'); grad.setAttribute('r','60%');
    const stop1=document.createElementNS('http://www.w3.org/2000/svg','stop');
    const stop2=document.createElementNS('http://www.w3.org/2000/svg','stop');
    stop1.setAttribute('offset','0%');
    stop2.setAttribute('offset','100%');
    stop1.setAttribute('class', isPos?'bgrad-pos':isNeg?'bgrad-neg':'bgrad-neu');
    stop2.setAttribute('class', isPos?'bgrad-pos2':isNeg?'bgrad-neg2':'bgrad-neu2');
    grad.appendChild(stop1); grad.appendChild(stop2); defs.appendChild(grad);

    const g=document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('class','bubble'); g.setAttribute('transform',`translate(${p.x},${p.y})`);
    g.style.cursor='pointer';

    // disco principal (gradiente) + anel
    const ring=document.createElementNS('http://www.w3.org/2000/svg','circle');
    ring.setAttribute('cx',0); ring.setAttribute('cy',0); ring.setAttribute('r',p.rv||p.r);
    ring.setAttribute('fill',`url(#${gradId})`);
    ring.setAttribute('stroke-width','3');
    ring.setAttribute('class', isPos?'bring-positive':isNeg?'bring-negative':'bring-neutral');
    g.appendChild(ring);

    // clip para logo
    const clipId=`clip-${i}-${s.symbol}`;
    const clip=document.createElementNS('http://www.w3.org/2000/svg','clipPath'); clip.setAttribute('id',clipId);
    const c=document.createElementNS('http://www.w3.org/2000/svg','circle'); c.setAttribute('cx',0); c.setAttribute('cy',0); c.setAttribute('r',(p.rv||p.r)-3);
    clip.appendChild(c); defs.appendChild(clip);

    if(s.logo){
      const img=document.createElementNS('http://www.w3.org/2000/svg','image');
      const size=(p.rv||p.r)*1.6; img.setAttributeNS('http://www.w3.org/1999/xlink','href',s.logo);
      img.setAttribute('x',-size/2); img.setAttribute('y',-size/2); img.setAttribute('width',size); img.setAttribute('height',size);
      img.setAttribute('opacity','0.22'); img.setAttribute('clip-path',`url(#${clipId})`);
      g.appendChild(img);
    }else{
      const inner=document.createElementNS('http://www.w3.org/2000/svg','circle');
      inner.setAttribute('cx',0); inner.setAttribute('cy',0); inner.setAttribute('r',(p.rv||p.r)-3); inner.setAttribute('class','logo-fallback');
      g.appendChild(inner);
    }

    // textos (CryptoBubbles layout): % grande no centro, ticker em cima, preço embaixo
    const r=p.rv||p.r;
    const tPct=document.createElementNS('http://www.w3.org/2000/svg','text');
    tPct.setAttribute('class','center'); tPct.setAttribute('x',0); tPct.setAttribute('y',4);
    tPct.setAttribute('font-size', Math.max(12, Math.min(20, r*0.42)));
    tPct.textContent=`${chg>0?'+':''}${(chg||0).toFixed(2)}%`;
    g.appendChild(tPct);

    const tSym=document.createElementNS('http://www.w3.org/2000/svg','text');
    tSym.setAttribute('class','label'); tSym.setAttribute('x',0); tSym.setAttribute('y', -r*0.45);
    tSym.setAttribute('font-size', Math.max(10, Math.min(16, r*0.32)));
    tSym.textContent=s.symbol;
    g.appendChild(tSym);

    const tPrice=document.createElementNS('http://www.w3.org/2000/svg','text');
    tPrice.setAttribute('class','sub'); tPrice.setAttribute('x',0); tPrice.setAttribute('y', r*0.58);
    tPrice.setAttribute('font-size', Math.max(9, Math.min(14, r*0.28)));
    tPrice.textContent=money(s.price,currentMarket);
    g.appendChild(tPrice);

    g.addEventListener('click', ()=>{
      alert(`${s.symbol} — ${s.name}\nPreço: ${money(s.price,currentMarket)}\nTipo: ${s.type}\nSetor: ${s.sector}\nVariação (dia): ${(s.day??0).toFixed(2)}%`);
    });

    frag.appendChild(g);
    sim.nodes.push({ g, ring, tPct, tSym, tPrice, clipCircle:c });
  });

  svg.appendChild(frag);
  updateCounter();
  startPhysics();
  morphRadii();
}

/* contador */
function updateCounter(){
  const total=(master[currentMarket]||[]).length, showing=current.length;
  const pos=current.filter(s=>(s[currentPeriod]??0)>0).length;
  const neg=current.filter(s=>(s[currentPeriod]??0)<0).length;
  stockCounter.textContent=`Exibindo ${showing} de ${total} ações • 🟢 ${pos} Alta • 🔴 ${neg} Baixa`;
}

/* física (espalhamento estilo CryptoBubbles) */
function startPhysics(){
  cancelAnimationFrame(sim.raf);
  const DAMP=0.986, NOISE=IS_MOBILE?0.03:0.06, CENTER=0.00012, EDGE=0.12, PASSES=2, REACH=70, REP=1.05, SEP=6, FILL=0.78;
  const step=()=>{
    const {w,h}=size(); const CX=w/2, CY=h/2, targetR=Math.min(w,h)*FILL/2;
    // grid
    const cell=64, cols=Math.ceil(w/cell), rows=Math.ceil(h/cell);
    const grid=Array.from({length:cols*rows},()=>[]), key=(x,y)=>y*cols+x;
    for(let i=0;i<sim.pts.length;i++){
      const p=sim.pts[i]; const gx=Math.max(0,Math.min(cols-1,Math.floor(p.x/cell))); const gy=Math.max(0,Math.min(rows-1,Math.floor(p.y/cell)));
      grid[key(gx,gy)].push(i); p._gx=gx; p._gy=gy;
    }
    const neigh=p=>{ const out=[]; for(let gy=Math.max(0,p._gy-1); gy<=Math.min(rows-1,p._gy+1); gy++) for(let gx=Math.max(0,p._gx-1); gx<=Math.min(cols-1,p._gx+1); gx++) out.push(...grid[key(gx,gy)]); return out; };

    // campo
    for(const p of sim.pts){
      p.vx=(p.vx||0)+(Math.random()-0.5)*NOISE; p.vy=(p.vy||0)+(Math.random()-0.5)*NOISE;
      p.vx+=(CX-p.x)*CENTER; p.vy+=(CY-p.y)*CENTER;

      const dx=p.x-CX, dy=p.y-CY, d=Math.hypot(dx,dy)||1e-6, press=(targetR-d)/targetR;
      p.vx+=(dx/d)*press*0.0030; p.vy+=(dy/d)*press*0.0030;

      const pad=16, r=(p.rv||p.r);
      if(p.x - r < pad) p.vx+=EDGE; if(p.x + r > w - pad) p.vx-=EDGE;
      if(p.y - r < pad) p.vy+=EDGE; if(p.y + r > h - pad) p.vy-=EDGE;
    }

    // repulsão contínua + anticolisão
    for(let pass=0; pass<PASSES; pass++){
      for(let i=0;i<sim.pts.length;i++){
        const p=sim.pts[i];
        for(const j of neigh(p)){ if(j<=i) continue;
          const q=sim.pts[j];
          const dx=p.x-q.x, dy=p.y-q.y, dist=Math.hypot(dx,dy)||1e-6, ux=dx/dist, uy=dy/dist;
          const need=(p.rv||p.r)+(q.rv||q.r)+SEP, reach=need+REACH;
          if(dist<reach){
            const s=REP*(1-dist/reach)*0.7; p.vx+=ux*s; p.vy+=uy*s; q.vx-=ux*s; q.vy-=uy*s;
          }
          if(dist<need){
            const over=(need-dist)*0.5; p.x+=ux*over; p.y+=uy*over; q.x-=ux*over; q.y-=uy*over;
          }
        }
      }
    }

    // integrar e DOM
    for(let i=0;i<sim.pts.length;i++){
      const p=sim.pts[i]; p.x+=p.vx; p.y+=p.vy; p.vx*=DAMP; p.vy*=DAMP;
      const {w,h}=size(); const r=(p.rv||p.r);
      p.x=Math.max(r+2,Math.min(w-r-2,p.x)); p.y=Math.max(r+2,Math.min(h-r-2,p.y));

      const n=sim.nodes[i];
      n.g.setAttribute('transform',`translate(${p.x},${p.y})`);
      n.ring.setAttribute('r',r); n.clipCircle.setAttribute('r',r-3);
      // atualizar font positions
      n.tSym.setAttribute('y', -r*0.45);
      n.tPrice.setAttribute('y',  r*0.58);
      n.tPct.setAttribute('font-size', Math.max(12, Math.min(20, r*0.42)));
    }

    sim.raf=requestAnimationFrame(step);
  };
  sim.raf=requestAnimationFrame(step);
}

/* morph de raio suave quando métrica muda/refresh */
function morphRadii(){
  const {key,vmin,vmax}=baseRadInfo(current);
  const t0=performance.now();
  (function loop(ts){
    const t=Math.min(1,(ts-t0)/MORPH_MS);
    sim.pts.forEach(p=>{
      const target=scaleR(p.s[key]??0, vmin, vmax);
      p.rv = (p.rv??p.r) + (target - (p.rv??p.r))*0.18;
    });
    if(t<1) requestAnimationFrame(loop);
  })(t0);
}

/* eventos UI */
periodBtns.forEach(b=>b.addEventListener('click',()=>{
  periodBtns.forEach(x=>x.classList.remove('active')); b.classList.add('active'); currentPeriod=b.dataset.period; render();
}));
metricSelect.addEventListener('change',()=>{ currentMetric=metricSelect.value; morphRadii(); });
marketSelect.addEventListener('change',()=>{ currentMarket=marketSelect.value; populateFilterOptions(); applyFilters(); });
searchInput.addEventListener('input',applyFilters);
typeSelect.addEventListener('change',applyFilters);
sectorSelect.addEventListener('change',applyFilters);
if(rangeSelect){ rangeSelect.value=`1-${TOP_N}`; rangeSelect.addEventListener('change',()=>{ rangeSelect.value=`1-${TOP_N}`; }); }

settingsBtn?.addEventListener('click',()=> settingsModal?.classList.remove('hidden'));
closeModal?.addEventListener('click',()=> settingsModal?.classList.add('hidden'));
settingsModal?.addEventListener('click',e=>{ if(e.target===settingsModal) settingsModal.classList.add('hidden'); });

/* refresh */
let timer=null;
async function refresh(){
  const [br,us]=await Promise.all([loadMarket('brazilian'), loadMarket('american')]);
  master.brazilian=br; master.american=us;
  populateFilterOptions(); applyFilters();
}
function startAuto(){ if(timer) clearInterval(timer); timer=setInterval(refresh, REFRESH_MS); }

/* init */
async function init(){ const [br,us]=await Promise.all([loadMarket('brazilian'), loadMarket('american')]);
  master.brazilian=br; master.american=us; populateFilterOptions(); applyFilters(); startAuto(); }
document.addEventListener('DOMContentLoaded', init);

/* resize */
let rez; window.addEventListener('resize',()=>{ clearTimeout(rez); rez=setTimeout(()=>render(),120); });

/* iOS double-tap */
let lastTouch=0; document.addEventListener('touchend',e=>{ const now=Date.now(); if(now-lastTouch<=300) e.preventDefault(); lastTouch=now; },false);
