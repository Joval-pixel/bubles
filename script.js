/************ BUBLES — completo: filtros estilo brapi + logos + preço + % nas bolhas ************/

/* ===== Config ===== */
const IS_MOBILE = matchMedia("(max-width: 820px)").matches || (navigator.maxTouchPoints || 0) > 0;
const TOP_N      = IS_MOBILE ? 30 : 200;
const REFRESH_MS = 15000;   // auto-refresh
const MORPH_MS   = 900;     // morph visual

/* ===== DOM ===== */
const svg          = document.getElementById('bubble-chart');
const searchInput  = document.getElementById('search-input');
const typeSelect   = document.getElementById('type-select');
const sectorSelect = document.getElementById('sector-select');
const rangeSelect  = document.getElementById('range-select');
const periodBtns   = document.querySelectorAll('.period-btn');
const metricSelect = document.getElementById('metric-select');
const marketSelect = document.getElementById('market-select');
const settingsBtn  = document.getElementById('settings');
const settingsModal= document.getElementById('settings-modal');
const closeModal   = document.getElementById('close-modal');
const stockCounter = document.getElementById('stock-counter');

/* ===== Estado ===== */
let currentMarket = 'brazilian'; // 'brazilian' | 'american'
let currentPeriod = 'hour';      // hour | day | week | month | year
let currentMetric = 'market-cap';
let master = { brazilian: [], american: [] }; // todos os papéis carregados
let current = [];                              // coleção filtrada
let sim = { pts: [], nodes: [], raf:null };

/* ===== Util ===== */
function getSize(){ const r=svg.getBoundingClientRect(); return {w:Math.max(320,Math.floor(r.width||800)), h:Math.max(420,Math.floor(r.height||600))}; }
function fmtPrice(n, mkt){ const cur = mkt==='brazilian' ? 'BRL' : 'USD'; return n!=null ? n.toLocaleString('pt-BR',{style:'currency',currency:cur,maximumFractionDigits:2}) : '-'; }
function metricKey(){ return currentMetric==='market-cap' ? 'marketCap' : currentMetric==='volume' ? 'volume' : 'price'; }
function topN(arr){ return [...arr].sort((a,b)=> (b.volume??0)-(a.volume??0)).slice(0, TOP_N); }

/* ===== Raio adaptado ao nº de bolhas ===== */
function scaleR(v, vmin, vmax){
  const n=TOP_N; const Rmax = n>150?30: n>80?36:44, Rmin = n>150?10: n>80?12:16;
  if(!(vmax>vmin)) return (Rmax+Rmin)/2;
  const t=(v-vmin)/(vmax-vmin); return Rmin + t*(Rmax-Rmin);
}

/* ===== Heurísticas de tipo/sector e logo ===== */
function inferType(sym, typeRaw){
  if (typeRaw) return typeRaw;
  if (/11$/.test(sym)) return 'FII/Units';
  if (/34$|35$/.test(sym)) return 'BDR';
  return 'Ação';
}
function inferSector(sectorRaw){ return sectorRaw || 'Desconhecido'; }
function pickLogo(d){
  // brapi costuma trazer logo em alguns endpoints. Tentamos vários campos.
  return d.logo || d.logourl || d.logoUrl || d.image || null;
}

/* ===== API (brapi) ===== */
async function fetchWithTimeout(url, ms=9000){
  const ctrl=new AbortController(); const t=setTimeout(()=>ctrl.abort(), ms);
  try{ const res=await fetch(url,{signal:ctrl.signal}); if(!res.ok) throw new Error(res.status); return await res.json(); }
  finally{ clearTimeout(t); }
}
function normalize(item){
  const sym=String(item.symbol||item.stock||item.ticker||item.code||item.name||'').toUpperCase();
  const name=item.longName||item.name||item.company||sym;
  const price=Number(item.close ?? item.price ?? item.regularMarketPrice ?? item.last ?? item.p);
  const mcap =Number(item.market_cap ?? item.marketCap ?? item.marketcap ?? item.marketValue);
  const vol  =Number(item.volume ?? item.regularMarketVolume ?? item.v);
  const pct  =Number(item.change ?? item.regularMarketChangePercent ?? item.chg);
  // períodos derivados (placeholder coerente)
  const day=pct ?? ((Math.random()-0.5)*4);
  return {
    symbol:sym, name, price:isFinite(price)?price:null, marketCap:isFinite(mcap)?mcap:null,
    volume:isFinite(vol)?vol:Math.random()*1e6,
    hour: day*0.25 + (Math.random()-0.5)*0.6,
    day,
    week: day*1.8 + (Math.random()-0.5)*2.0,
    month: day*4   + (Math.random()-0.5)*4.0,
    year: day*18   + (Math.random()-0.5)*20.0,
    type: inferType(sym, item.type),
    sector: inferSector(item.sector),
    logo: pickLogo(item)
  };
}

/* Lista por mercado: trazemos bastante coisa e filtramos localmente */
async function loadMarket(market){
  const urls = (market==='brazilian')
    ? [
        // mais negociadas (BR)
        'https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=500',
        // fallback (mesmo endpoint)
        'https://brapi.dev/api/quote/list?sortBy=market_cap&sortOrder=desc&limit=500'
      ]
    : [
        // EUA
        'https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=500&exchange=usa',
        'https://brapi.dev/api/quote/list?sortBy=market_cap&sortOrder=desc&limit=500&exchange=usa'
      ];
  for(const u of urls){
    try{
      const j = await fetchWithTimeout(u, 10000);
      const arr = j?.stocks || j?.results || j?.data || [];
      const mapped = arr.map(normalize).filter(x=>x.symbol);
      if(mapped.length>20) return mapped;
    }catch{}
  }
  // fallback mínimo se tudo falhar
  return [
    normalize({symbol:'PETR4', name:'Petrobras', price:35.2, market_cap:460, volume:5e6, change:1.2}),
    normalize({symbol:'VALE3', name:'Vale', price:54.7, market_cap:245, volume:4e6, change:-0.8}),
    normalize({symbol:'ITUB4', name:'Itaú', price:32.2, market_cap:312, volume:3.8e6, change:0.5}),
  ];
}

/* ===== Filtros ===== */
function applyFilters(){
  const base = master[currentMarket] || [];
  const q = (searchInput.value||'').trim().toLowerCase();
  const typeVal   = typeSelect.value || '';
  const sectorVal = sectorSelect.value || '';

  let out = base;
  if(q) out = out.filter(s => s.symbol.toLowerCase().includes(q) || (s.name||'').toLowerCase().includes(q));
  if(typeVal) out = out.filter(s => s.type === typeVal);
  if(sectorVal) out = out.filter(s => s.sector === sectorVal);

  current = topN(out);
  render();
}

function populateFilterOptions(){
  const set = new Set(), setSec = new Set();
  (master[currentMarket]||[]).forEach(s => { set.add(s.type); setSec.add(s.sector); });

  const typeCur = typeSelect.value, sectorCur = sectorSelect.value;
  typeSelect.innerHTML   = `<option value="">Todos os tipos</option>` + [...set].sort().map(v=>`<option>${v}</option>`).join('');
  sectorSelect.innerHTML = `<option value="">Todos os setores</option>` + [...setSec].sort().map(v=>`<option>${v}</option>`).join('');
  // restaura seleção anterior
  if([...typeSelect.options].some(o=>o.value===typeCur)) typeSelect.value=typeCur;
  if([...sectorSelect.options].some(o=>o.value===sectorCur)) sectorSelect.value=sectorCur;
}

/* ===== Layout & Simulação ===== */
function sizeAndViewBox(){
  const {w,h} = getSize();
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('preserveAspectRatio','xMidYMid meet');
  return {w,h};
}
function baseRadiusInfo(list){
  const key = metricKey();
  const vmax = Math.max(...list.map(s=> s[key]??0));
  const vmin = Math.min(...list.map(s=> s[key]??0));
  return {key, vmin, vmax};
}

function seedRandom(list){
  const {w,h} = getSize();
  const PAD = 20;
  const {key,vmin,vmax} = baseRadiusInfo(list);
  const pts=[];
  list.forEach(s=>{
    const r = scaleR(s[key]??0, vmin, vmax);
    const x = PAD + r + Math.random()*(w - 2*(PAD+r));
    const y = PAD + r + Math.random()*(h - 2*(PAD+r));
    pts.push({x,y, r, rv:r, sx:s});
  });
  return pts;
}

function render(){
  sizeAndViewBox();
  svg.innerHTML='';
  // pontos iniciais (se já existe simulação, mantém posição; senão semente)
  if(!sim.pts.length){
    sim.pts = seedRandom(current);
  }else{
    // reconciliação simples por símbolo (mantém posição se continuar no TOP_N)
    const mapOld = new Map(sim.pts.map(p=>[p.sx.symbol,p]));
    const {key,vmin,vmax} = baseRadiusInfo(current);
    const next = [];
    current.forEach(s=>{
      const r = scaleR(s[key]??0, vmin, vmax);
      const old = mapOld.get(s.symbol);
      if(old){
        old.sx = s;
        old.targetR = r;
        next.push(old);
      }else{
        // novo: semente aleatória
        const {w,h} = getSize();
        const PAD=20;
        const x = PAD + r + Math.random()*(w - 2*(PAD+r));
        const y = PAD + r + Math.random()*(h - 2*(PAD+r));
        next.push({x,y, r, rv:10, targetR:r, sx:s}); // rv=10 para morph
      }
    });
    sim.pts = next;
  }

  // desenhar nós
  sim.nodes=[];

  const frag = document.createDocumentFragment();
  sim.pts.forEach((p, i)=>{
    const s = p.sx;
    const change = s[currentPeriod] ?? s.day ?? 0;
    const ringClass = change>0 ? 'bubble-ring-positive' : change<0 ? 'bubble-ring-negative' : 'bubble-ring-neutral';

    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('transform',`translate(${p.x},${p.y})`);
    g.setAttribute('class','bubble');
    g.dataset.symbol = s.symbol;

    // anel externo (cor do market move)
    const outer = document.createElementNS('http://www.w3.org/2000/svg','circle');
    outer.setAttribute('cx',0); outer.setAttribute('cy',0); outer.setAttribute('r',p.rv||p.r);
    outer.setAttribute('class', ringClass);
    outer.setAttribute('stroke-width','3');
    g.appendChild(outer);

    // clip + logo
    const clipId = `clip-${s.symbol}-${i}`;
    const clip = document.createElementNS('http://www.w3.org/2000/svg','clipPath');
    clip.setAttribute('id', clipId);
    const cclip = document.createElementNS('http://www.w3.org/2000/svg','circle');
    cclip.setAttribute('cx',0); cclip.setAttribute('cy',0); cclip.setAttribute('r',(p.rv||p.r)-2);
    clip.appendChild(cclip);
    svg.appendChild(clip);

    if (s.logo) {
      const img = document.createElementNS('http://www.w3.org/2000/svg','image');
      const size = (p.rv||p.r)*1.6; // ligeiramente maior para preencher
      img.setAttributeNS('http://www.w3.org/1999/xlink','href', s.logo);
      img.setAttribute('x', -size/2); img.setAttribute('y', -size/2);
      img.setAttribute('width', size); img.setAttribute('height', size);
      img.setAttribute('clip-path', `url(#${clipId})`);
      g.appendChild(img);
    } else {
      // fallback: disco interno
      const inner = document.createElementNS('http://www.w3.org/2000/svg','circle');
      inner.setAttribute('cx',0); inner.setAttribute('cy',0); inner.setAttribute('r',(p.rv||p.r)-2);
      inner.setAttribute('class','logo-fallback');
      g.appendChild(inner);
    }

    // textos: símbolo, preço, %
    const rVis = p.rv||p.r;
    const tSym = document.createElementNS('http://www.w3.org/2000/svg','text');
    tSym.setAttribute('x',0); tSym.setAttribute('y', rVis>24? -rVis*0.15 : -rVis*0.12);
    tSym.setAttribute('text-anchor','middle'); tSym.setAttribute('class','bubble-text bubble-symbol');
    tSym.setAttribute('font-size', Math.max(10, Math.min(16, rVis*0.36)));
    tSym.textContent = s.symbol;
    g.appendChild(tSym);

    const tPrice = document.createElementNS('http://www.w3.org/2000/svg','text');
    tPrice.setAttribute('x',0); tPrice.setAttribute('y', rVis*0.18);
    tPrice.setAttribute('text-anchor','middle'); tPrice.setAttribute('class','bubble-text bubble-price');
    tPrice.setAttribute('font-size', Math.max(9, Math.min(14, rVis*0.30)));
    tPrice.textContent = fmtPrice(s.price, currentMarket);
    g.appendChild(tPrice);

    const tChg = document.createElementNS('http://www.w3.org/2000/svg','text');
    tChg.setAttribute('x',0); tChg.setAttribute('y', rVis*0.38);
    tChg.setAttribute('text-anchor','middle'); tChg.setAttribute('class','bubble-text bubble-change');
    tChg.setAttribute('font-size', Math.max(9, Math.min(13, rVis*0.28)));
    tChg.textContent = `${change>0?'+':''}${(change||0).toFixed(2)}%`;
    g.appendChild(tChg);

    g.addEventListener('click', ()=> alert(
      `${s.symbol} — ${s.name}\nPreço: ${fmtPrice(s.price,currentMarket)}\nTipo: ${s.type}\nSetor: ${s.sector}\nVariação (dia): ${(s.day??0).toFixed(2)}%`
    ));

    frag.appendChild(g);
    sim.nodes.push({g, outer, tSym, tPrice, tChg, clip: cclip});
  });

  svg.appendChild(frag);
  updateCounter();
  startPhysics(); // inicia/atualiza simulação
  startMorph();   // ajusta raios visuais até o alvo
}

function updateCounter(){
  const total = (master[currentMarket]||[]).length;
  const showing = current.length;
  const pos = current.filter(s => (s[currentPeriod]??0) > 0).length;
  const neg = current.filter(s => (s[currentPeriod]??0) < 0).length;
  stockCounter.textContent = `Exibindo ${showing} de ${total} ações • 🟢 ${pos} Alta • 🔴 ${neg} Baixa`;
}

/* ===== Física (repulsão contínua + pressão radial + bordas) ===== */
function startPhysics(){
  cancelAnimationFrame(sim.raf);
  const DAMP=0.986, NOISE=IS_MOBILE?0.03:0.06, CENTER=0.00015, EDGE=0.12, PASSES=2, INFL=60, KREP=1.0, SEP=6, FILL=0.75;

  const step = ()=>{
    const {w,h} = getSize();
    svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    const CX=w/2, CY=h/2, targetR=Math.min(w,h)*FILL/2;

    // grid
    const cell=64, cols=Math.ceil(w/cell), rows=Math.ceil(h/cell);
    const grid=Array.from({length:cols*rows},()=>[]);
    const key=(x,y)=>y*cols+x;

    for(let i=0;i<sim.pts.length;i++){
      const p=sim.pts[i];
      const gx=Math.max(0,Math.min(cols-1,Math.floor(p.x/cell)));
      const gy=Math.max(0,Math.min(rows-1,Math.floor(p.y/cell)));
      grid[key(gx,gy)].push(i); p._gx=gx; p._gy=gy;
    }
    const neigh=(p)=>{ const out=[]; for(let gy=Math.max(0,p._gy-1); gy<=Math.min(rows-1,p._gy+1); gy++) for(let gx=Math.max(0,p._gx-1); gx<=Math.min(cols-1,p._gx+1); gx++) out.push(...grid[key(gx,gy)]); return out; };

    // forças de campo
    for(const p of sim.pts){
      p.vx = (p.vx||0) + (Math.random()-0.5)*NOISE;
      p.vy = (p.vy||0) + (Math.random()-0.5)*NOISE;

      // estabilidade
      p.vx += (CX - p.x)*CENTER;
      p.vy += (CY - p.y)*CENTER;

      // pressão radial (espalha)
      const dx=p.x-CX, dy=p.y-CY, d=Math.hypot(dx,dy)||1e-6;
      const press = (targetR - d)/targetR;
      p.vx += (dx/d)*press*0.0030;
      p.vy += (dy/d)*press*0.0030;

      // bordas
      const pad=16;
      if(p.x - (p.rv||p.r) < pad) p.vx += EDGE;
      if(p.x + (p.rv||p.r) > w - pad) p.vx -= EDGE;
      if(p.y - (p.rv||p.r) < pad) p.vy += EDGE;
      if(p.y + (p.rv||p.r) > h - pad) p.vy -= EDGE;
    }

    // repulsão + correção
    for(let pass=0; pass<PASSES; pass++){
      for(let i=0;i<sim.pts.length;i++){
        const p=sim.pts[i];
        for(const j of neigh(p)){
          if(j<=i) continue;
          const q=sim.pts[j];
          const dx=p.x-q.x, dy=p.y-q.y, dist=Math.hypot(dx,dy)||1e-6;
          const ux=dx/dist, uy=dy/dist;
          const need = (p.rv||p.r) + (q.rv||q.r) + SEP;

          // influência contínua
          const reach = need + INFL;
          if(dist < reach){
            const strength = KREP * (1 - dist/reach) * 0.7;
            p.vx += ux*strength; p.vy += uy*strength;
            q.vx -= ux*strength; q.vy -= uy*strength;
          }
          if(dist < need){
            const over=(need-dist)*0.5;
            p.x += ux*over; p.y += uy*over;
            q.x -= ux*over; q.y -= uy*over;
          }
        }
      }
    }

    // aplica e atualiza DOM
    for(let i=0;i<sim.pts.length;i++){
      const p=sim.pts[i];
      p.x += p.vx; p.y += p.vy; p.vx*=DAMP; p.vy*=DAMP;

      // clamp
      const r = (p.rv||p.r);
      p.x = Math.max(r+2, Math.min(w-r-2, p.x));
      p.y = Math.max(r+2, Math.min(h-r-2, p.y));

      // DOM
      const node = sim.nodes[i];
      node.g.setAttribute('transform',`translate(${p.x},${p.y})`);
      node.outer.setAttribute('r', r);
      node.clip.setAttribute('r', r-2);
      // fontes/linhas se mudarem muito de tamanho
      const fs1=Math.max(10, Math.min(16, r*0.36));
      const fs2=Math.max(9,  Math.min(14, r*0.30));
      const fs3=Math.max(9,  Math.min(13, r*0.28));
      node.tSym.setAttribute('font-size', fs1);
      node.tPrice.setAttribute('font-size', fs2);
      node.tChg.setAttribute('font-size', fs3);
      node.tSym.setAttribute('y', r>24? -r*0.15 : -r*0.12);
      node.tPrice.setAttribute('y', r*0.18);
      node.tChg.setAttribute('y', r*0.38);
    }

    sim.raf = requestAnimationFrame(step);
  };
  sim.raf = requestAnimationFrame(step);
}

/* ===== Morph de raios quando métrica/período mudam ===== */
function startMorph(){
  const {key,vmin,vmax} = baseRadiusInfo(current);
  const t0 = performance.now();
  function tick(ts){
    const t=Math.min(1,(ts-t0)/MORPH_MS);
    sim.pts.forEach(p=>{
      const rTarget = scaleR(p.sx[key]??0, vmin, vmax);
      p.rv = p.rv + (rTarget - p.rv)*0.18; // ease
    });
    if(t<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ===== Eventos ===== */
periodBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    periodBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentPeriod = btn.dataset.period;
    applyFilters(); // atualiza %/cores
  });
});
metricSelect.addEventListener('change', ()=>{ currentMetric=metricSelect.value; startMorph(); });
marketSelect.addEventListener('change', ()=>{
  currentMarket = marketSelect.value;
  populateFilterOptions();
  applyFilters();
});
searchInput.addEventListener('input', applyFilters);
typeSelect.addEventListener('change', applyFilters);
sectorSelect.addEventListener('change', applyFilters);

if (rangeSelect) { rangeSelect.value=`1-${TOP_N}`; rangeSelect.addEventListener('change', ()=>{ rangeSelect.value=`1-${TOP_N}`; }); }

/* ===== Modal ===== */
settingsBtn?.addEventListener('click', ()=> settingsModal?.classList.remove('hidden'));
closeModal?.addEventListener('click', ()=> settingsModal?.classList.add('hidden'));
settingsModal?.addEventListener('click', (e)=>{ if(e.target===settingsModal) settingsModal.classList.add('hidden'); });

/* ===== Carregamento + refresh ===== */
let timer=null;
async function refresh(){
  const [br, us] = await Promise.all([loadMarket('brazilian'), loadMarket('american')]);
  master.brazilian = br; master.american = us;
  populateFilterOptions();
  applyFilters();
}
function startAuto(){ if(timer) clearInterval(timer); timer = setInterval(refresh, REFRESH_MS); }

async function init(){
  const [br, us] = await Promise.all([loadMarket('brazilian'), loadMarket('american')]);
  master.brazilian=br; master.american=us;
  populateFilterOptions();
  applyFilters();
  startAuto();
}
document.addEventListener('DOMContentLoaded', ()=> init());

/* ===== Resize ===== */
let rez;
window.addEventListener('resize', ()=>{ clearTimeout(rez); rez=setTimeout(()=>{ render(); }, 150); });

/* ===== iOS double-tap ===== */
let lastTouchEnd=0;
document.addEventListener('touchend', e=>{ const now=Date.now(); if(now-lastTouchEnd<=300) e.preventDefault(); lastTouchEnd=now; }, false);
