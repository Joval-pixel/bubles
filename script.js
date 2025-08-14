/* ====== BUBLES — estilo CryptoBubbles (PT-BR, 3D) ====== */

/* >>> Coloque seu token da Brapi aqui (ou deixe vazio) <<< */
const BRAPI_TOKEN = ""; // ex.: "5bTDfSmR2ieax6y7JUqDAD"

/* layout */
const SHOW_PRICE  = false;  // preço oculto (como Crypto)
const IS_MOBILE   = matchMedia("(max-width:820px)").matches || (navigator.maxTouchPoints||0) > 0;
const TOP_N       = IS_MOBILE ? 30 : 200;
const REFRESH_MS  = 15000;
const MORPH_MS    = 900;

/* densidade-alvo (preenchimento) — MENOR = mais espaço */
const PACK_DENSITY = IS_MOBILE ? 0.36 : 0.38;   // ↓ um pouco p/ abrir respiro
const clamp = (min, v, max) => Math.max(min, Math.min(max, v));

/* DOM */
const svg          = document.getElementById('bubble-chart');
const searchInput  = document.getElementById('search-input');
const typeSelect   = document.getElementById('type-select');
const sectorSelect = document.getElementById('sector-select');
const rangeSelect  = document.getElementById('range-select');
const metricSelect = document.getElementById('metric-select');
const marketSelect = document.getElementById('market-select');
const stockCounter = document.getElementById('stock-counter');
const tabsBar      = document.querySelector('.tabs');
const settingsBtn  = document.getElementById('settings');
const settingsModal= document.getElementById('settings-modal');
const closeModal   = document.getElementById('close-modal');

/* estado */
let currentMarket='brazilian', currentPeriod='day', currentMetric='volume';
let master={ brazilian:[], american:[] }, current=[];
let sim={ pts:[], nodes:[], raf:null };

/* utils */
const SZ = ()=>{ const r=svg.getBoundingClientRect(); return {w:Math.max(320,Math.floor(r.width||800)), h:Math.max(420,Math.floor(r.height||600))} };
const money=(n, mkt)=> (n!=null) ? n.toLocaleString('pt-BR',{style:'currency', currency:(mkt==='brazilian'?'BRL':'USD'), maximumFractionDigits:2}) : '-';
const topN=a=>[...a].sort((x,y)=>(y.volume??0)-(x.volume??0)).slice(0,TOP_N);
const metricKey=()=> currentMetric==='market-cap' ? 'marketCap' : currentMetric==='price' ? 'price' : 'volume';
const qToken = BRAPI_TOKEN ? `&token=${encodeURIComponent(BRAPI_TOKEN)}` : "";

/* setores PT */
const SECTOR_PT = {
  "Commercial Services":"Serviços Comerciais","Communications":"Comunicações",
  "Consumer Durables":"Bens de Consumo Duráveis","Consumer Non-Durables":"Bens de Consumo Não Duráveis",
  "Consumer Services":"Serviços ao Consumidor","Distribution Services":"Serviços de Distribuição",
  "Electronic Technology":"Tecnologia Eletrônica","Energy Minerals":"Energia (Mineração)",
  "Finance":"Finanças","Health Services":"Serviços de Saúde","Health Technology":"Tecnologia em Saúde",
  "Industrial Services":"Serviços Industriais","Miscellaneous":"Diversos",
  "Non-Energy Minerals":"Mineração (Não Energia)","Process Industries":"Indústrias de Processos",
  "Producer Manufacturing":"Manufatura","Retail Trade":"Varejo","Technology Services":"Serviços de Tecnologia",
  "Transportation":"Transporte","Utilities":"Utilidades","Unknown":"Desconhecido","Desconhecido":"Desconhecido"
};
const toPT = s => SECTOR_PT[s] || s || 'Desconhecido';
function inferType(sym,t){ const raw=(t||'').toLowerCase(); if(/etf/.test(raw)) return 'ETF'; if(t) return t; if(/11$/.test(sym)) return 'FII/Units'; if(/3[45]$/.test(sym)) return 'BDR'; return 'Ação'; }
function pickLogo(d){ return d.logo || d.logourl || d.logoUrl || d.image || null; }

/* ===== Escala de raio ===== */
function scaleR(v, vmin, vmax){
  const n = TOP_N;
  const Rmax = n > 150 ? 72 : n > 80 ? 92 : 116;  // ↓ tamanho máximo
  const Rmin = n > 150 ? 24 : n > 80 ? 26 : 30;   // ↑ mínimo fica legível
  if (!(vmax > vmin)) return (Rmax + Rmin) / 2;
  let t = (v - vmin) / (vmax - vmin);
  t = Math.pow(clamp(0,t,1), 0.58);
  return Rmin + t * (Rmax - Rmin);
}

/* fetch */
async function fetchWithTimeout(url,ms=10000){
  const c=new AbortController(); const t=setTimeout(()=>c.abort(),ms);
  try{ const r=await fetch(url,{signal:c.signal}); if(!r.ok) throw new Error(r.status); return await r.json(); }
  finally{ clearTimeout(t); }
}
function normalize(it){
  const symbol=String(it.symbol||it.stock||it.ticker||it.code||it.name||'').toUpperCase();
  const name=it.longName||it.name||it.company||symbol;
  const price=Number(it.close ?? it.price ?? it.regularMarketPrice ?? it.last ?? it.p);
  const mcap =Number(it.market_cap ?? it.marketCap ?? it.marketcap ?? it.marketValue);
  const vol  =Number(it.volume ?? it.regularMarketVolume ?? it.v);
  const chg  =Number(it.change ?? it.regularMarketChangePercent ?? it.chg);
  const day  = Number.isFinite(chg) ? chg : (Math.random()-0.5)*4;

  const sectorRaw = it.sector || it.industry || it.segment;
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
    sector: toPT(sectorRaw),
    logo: pickLogo(it)
  };
}
async function loadMarket(market){
  const baseBR = `https://brapi.dev/api/quote/list?limit=500`;
  const baseUS = `https://brapi.dev/api/quote/list?limit=500&exchange=usa`;
  const urls = (market==='brazilian')
    ? [`${baseBR}&sortBy=volume&sortOrder=desc${qToken}`, `${baseBR}&sortBy=market_cap&sortOrder=desc${qToken}`]
    : [`${baseUS}&sortBy=volume&sortOrder=desc${qToken}`, `${baseUS}&sortBy=market_cap&sortOrder=desc${qToken}`];

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

/* layout & escala por área (com margem p/ separar) */
function setView(){ const {w,h}=SZ(); svg.setAttribute('viewBox',`0 0 ${w} ${h}`); svg.setAttribute('preserveAspectRatio','xMidYMid meet'); return {w,h}; }
function baseRadInfo(list){ const key=metricKey(); const vmax=Math.max(...list.map(s=>s[key]??0)); const vmin=Math.min(...list.map(s=>s[key]??0)); return {key,vmin,vmax}; }

function scaleTargetsToFit(targetRadii){
  const {w,h}=SZ();
  const targetArea = PACK_DENSITY * w * h;
  const SEP_MARGIN = 0.7 * 20; // 20 é o SEP base (ver física)
  const sumArea = targetRadii.reduce((a,r)=>a + Math.PI*Math.pow(r + SEP_MARGIN, 2), 0);
  const sf = sumArea > 0 ? Math.min(1, Math.sqrt(targetArea / sumArea)) : 1;
  return sf;
}
function seed(list){
  const {w,h}=SZ(); const PAD=20; 
  const {key,vmin,vmax}=baseRadInfo(list);
  const raw = list.map(s => ({ s, r: scaleR(s[key]??0, vmin, vmax) }));
  const sf = scaleTargetsToFit(raw.map(o=>o.r));
  return raw.map(o=>{
    const r = o.r * sf;
    const x = PAD+r+Math.random()*(w-2*(PAD+r));
    const y = PAD+r+Math.random()*(h-2*(PAD+r));
    return {x,y, r, rv:r, s:o.s};
  });
}

/* defs (aro, sombra interna, gloss) */
function ensureGlobalDefs(defs){
  if(!document.getElementById('rimGradPos')){
    const mk=(id,c1,c2)=>{
      const lg = document.createElementNS('http://www.w3.org/2000/svg','linearGradient');
      lg.setAttribute('id', id);
      lg.setAttribute('x1','0%'); lg.setAttribute('y1','0%'); lg.setAttribute('x2','0%'); lg.setAttribute('y2','100%');
      const a = document.createElementNS('http://www.w3.org/2000/svg','stop');
      const b = document.createElementNS('http://www.w3.org/2000/svg','stop');
      a.setAttribute('offset','0%'); a.setAttribute('stop-color', c1);
      b.setAttribute('offset','100%'); b.setAttribute('stop-color', c2);
      lg.appendChild(a); lg.appendChild(b);
      defs.appendChild(lg);
    };
    mk('rimGradPos','#e9fff6','#54f7a5');
    mk('rimGradNeg','#ffe9eb','#ff6571');
    mk('rimGradNeu','#eef2f8','#b9c2d3');
  }
  if(!document.getElementById('innerShadow')){
    const f = document.createElementNS('http://www.w3.org/2000/svg','filter');
    f.setAttribute('id','innerShadow');
    f.setAttribute('x','-50%'); f.setAttribute('y','-50%');
    f.setAttribute('width','200%'); f.setAttribute('height','200%');
    f.innerHTML = `
      <feOffset dx="0" dy="2" result="off"/>
      <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur"/>
      <feComposite in="blur" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="inner"/>
      <feColorMatrix in="inner" type="matrix"
        values="0 0 0 0 0
                0 0 0 0 0
                0 0 0 0 0
                0 0 0 .75 0" result="shadow"/>
      <feComposite in="shadow" in2="SourceGraphic" operator="over"/>
    `;
    defs.appendChild(f);
  }
  if(!document.getElementById('glossGrad')){
    const gg = document.createElementNS('http://www.w3.org/2000/svg','radialGradient');
    gg.setAttribute('id','glossGrad');
    gg.setAttribute('cx','50%'); gg.setAttribute('cy','10%'); gg.setAttribute('r','55%');
    const g1 = document.createElementNS('http://www.w3.org/2000/svg','stop');
    const g2 = document.createElementNS('http://www.w3.org/2000/svg','stop');
    g1.setAttribute('offset','0%');  g1.setAttribute('stop-color','#ffffff');
    g2.setAttribute('offset','100%'); g2.setAttribute('stop-color','#ffffff'); g2.setAttribute('stop-opacity','0');
    gg.appendChild(g1); gg.appendChild(g2);
    defs.appendChild(gg);
  }
}

/* render 3D */
function render(){
  setView(); svg.innerHTML='';
  if(!sim.pts.length) sim.pts=seed(current);
  else {
    const map=new Map(sim.pts.map(p=>[p.s.symbol,p]));
    const {key,vmin,vmax}=baseRadInfo(current); const next=[];
    current.forEach(s=>{
      const r=scaleR(s[key]??0, vmin, vmax);
      const old=map.get(s.symbol);
      if(old){ old.s=s; old.targetR=r; next.push(old); }
      else {
        const {w,h}=SZ(); const PAD=20;
        const x=PAD+r+Math.random()*(w-2*(PAD+r)); const y=PAD+r+Math.random()*(h-2*(PAD+r));
        next.push({x,y, r, rv:12, targetR:r, s});
      }
    });
    // escala global por área
    const targets = next.map(p => (p.targetR ?? p.r));
    const sf = scaleTargetsToFit(targets);
    next.forEach(p => {
      p.targetR = (p.targetR ?? p.r) * sf;
      if (p.rv && p.rv < p.targetR*0.6) p.rv *= sf;
    });
    sim.pts=next;
  }

  const defs=document.createElementNS('http://www.w3.org/2000/svg','defs');
  svg.appendChild(defs);
  ensureGlobalDefs(defs);

  sim.nodes=[];
  const frag=document.createDocumentFragment();

  sim.pts.forEach((p,i)=>{
    const s=p.s, chg = s[currentPeriod] ?? s.day ?? 0;
    const isPos = chg>0, isNeg = chg<0;
    const r = p.rv || p.r;

    // gradiente do disco
    const discId = `disc-${i}-${s.symbol}`;
    const discGrad = document.createElementNS('http://www.w3.org/2000/svg','radialGradient');
    discGrad.setAttribute('id', discId);
    discGrad.setAttribute('cx','50%'); discGrad.setAttribute('cy','45%'); discGrad.setAttribute('r','70%');
    const mkStop=(ofs,cls)=>{const st=document.createElementNS('http://www.w3.org/2000/svg','stop'); st.setAttribute('offset',ofs); st.setAttribute('class',cls); return st;};
    if(isPos){ discGrad.appendChild(mkStop('0%','grad-pos-3')); discGrad.appendChild(mkStop('55%','grad-pos-1')); discGrad.appendChild(mkStop('85%','grad-pos-2')); discGrad.appendChild(mkStop('100%','grad-pos-0')); }
    else if(isNeg){ discGrad.appendChild(mkStop('0%','grad-neg-3')); discGrad.appendChild(mkStop('55%','grad-neg-1')); discGrad.appendChild(mkStop('85%','grad-neg-2')); discGrad.appendChild(mkStop('100%','grad-neg-0')); }
    else { discGrad.appendChild(mkStop('0%','grad-neu-3')); discGrad.appendChild(mkStop('55%','grad-neu-1')); discGrad.appendChild(mkStop('85%','grad-neu-2')); discGrad.appendChild(mkStop('100%','grad-neu-0')); }
    defs.appendChild(discGrad);

    const g=document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('class','bubble');
    g.setAttribute('transform',`translate(${p.x},${p.y})`);
    g.style.cursor='pointer';

    // halo externo
    const outer=document.createElementNS('http://www.w3.org/2000/svg','circle');
    outer.setAttribute('class', `outer-glow ${isPos?'glow-pos':isNeg?'glow-neg':'glow-neu'}`);
    outer.setAttribute('cx',0); outer.setAttribute('cy',0);
    outer.setAttribute('r', r*1.06);
    outer.setAttribute('stroke-width', Math.max(9, r*0.24));
    g.appendChild(outer);

    // disco com sombra interna
    const disc=document.createElementNS('http://www.w3.org/2000/svg','circle');
    disc.setAttribute('cx',0); disc.setAttribute('cy',0);
    disc.setAttribute('r', r);
    disc.setAttribute('fill', `url(#${discId})`);
    disc.setAttribute('class','has-inner-shadow');
    g.appendChild(disc);

    // aro
    const rim=document.createElementNS('http://www.w3.org/2000/svg','circle');
    rim.setAttribute('cx',0); rim.setAttribute('cy',0);
    rim.setAttribute('r', r-1.6);
    rim.setAttribute('class', `rim ${isPos?'rim-pos':isNeg?'rim-neg':'rim-neu'}`);
    g.appendChild(rim);

    // gloss topo
    const gloss=document.createElementNS('http://www.w3.org/2000/svg','ellipse');
    gloss.setAttribute('class','gloss');
    gloss.setAttribute('cx',0); gloss.setAttribute('cy', -r*0.45);
    gloss.setAttribute('rx', r*0.66); gloss.setAttribute('ry', r*0.28);
    g.appendChild(gloss);

    // clip do logo
    const cid=`clip-${i}-${s.symbol}`;
    const cp=document.createElementNS('http://www.w3.org/2000/svg','clipPath'); cp.setAttribute('id',cid);
    const cc=document.createElementNS('http://www.w3.org/2000/svg','circle'); cc.setAttribute('cx',0); cc.setAttribute('cy',0); cc.setAttribute('r',r-4);
    cp.appendChild(cc); defs.appendChild(cp);

    if(s.logo){
      const img=document.createElementNS('http://www.w3.org/2000/svg','image');
      const sz=r*1.42; img.setAttributeNS('http://www.w3.org/1999/xlink','href',s.logo);
      img.setAttribute('x',-sz/2); img.setAttribute('y',-sz/2); img.setAttribute('width',sz); img.setAttribute('height',sz);
      img.setAttribute('opacity','0.22'); img.setAttribute('clip-path',`url(#${cid})`); g.appendChild(img);
    }else{
      const inner=document.createElementNS('http://www.w3.org/2000/svg','circle');
      inner.setAttribute('cx',0); inner.setAttribute('cy',0); inner.setAttribute('r',r-4); inner.setAttribute('class','logo-fallback'); g.appendChild(inner);
    }

    /* tipografia central — TICKER MENOR */
    const pct=document.createElementNS('http://www.w3.org/2000/svg','text');
    pct.setAttribute('class','pct'); pct.setAttribute('x',0);
    pct.setAttribute('y',  r * 0.26);
    pct.setAttribute('font-size', clamp(12, r*0.36, 24));  // ↓ porcentagem
    pct.textContent=`${(chg>0?'+':'')}${(chg||0).toFixed(2)}%`;
    g.appendChild(pct);

    const tik=document.createElementNS('http://www.w3.org/2000/svg','text');
    tik.setAttribute('class','ticker'); tik.setAttribute('x',0); tik.setAttribute('y', 0);
    tik.setAttribute('font-size', clamp(14, r*0.62, 48));   // ↓ ticker principal
    tik.textContent=s.symbol; g.appendChild(tik);

    let price=null;
    if (SHOW_PRICE) {
      price=document.createElementNS('http://www.w3.org/2000/svg','text');
      price.setAttribute('class','price'); price.setAttribute('x',0);
      price.setAttribute('y',  r * 0.56);
      price.setAttribute('font-size', clamp(10, r*0.28, 16));
      price.textContent=money(s.price,currentMarket);
      g.appendChild(price);
    }

    g.addEventListener('click', ()=>{
      alert(`${s.symbol} — ${s.name}\nPreço: ${money(s.price,currentMarket)}\nTipo: ${s.type}\nSetor: ${s.sector}\nVariação (${labelDoPeriodo()}): ${(s[currentPeriod]??0).toFixed(2)}%`);
    });

    frag.appendChild(g);
    sim.nodes.push({ g, disc, rim, outer, gloss, pct, tik, price, clipCircle:cc });
  });

  svg.appendChild(frag);
  updateCounter();
  startPhysics();
  morphRadii();
}

function labelDoPeriodo(){ return {hour:'hora',day:'dia',week:'semana',month:'mês',year:'ano'}[currentPeriod] || 'dia'; }
function updateCounter(){
  const total=(master[currentMarket]||[]).length, showing=current.length;
  const pos=current.filter(s=>(s[currentPeriod]??0)>0).length;
  const neg=current.filter(s=>(s[currentPeriod]??0)<0).length;
  stockCounter.textContent=`Exibindo ${showing} de ${total} ações • 🟢 ${pos} Alta • 🔴 ${neg} Baixa`;
}

/* === Física estável e espaçada === */
function startPhysics(){
  cancelAnimationFrame(sim.raf);
  const DAMP=0.986,
        NOISE=IS_MOBILE?0.012:0.014,
        CENTER=0.00012,
        EDGE=0.22,
        PASSES=6,        // +1 passe de colisão
        REACH=260,
        REP=2.6,         // repulsão um pouco maior
        SEP=20,          // separação maior (evita encostar)
        FILL=0.86;

  const step=()=>{
    const {w,h}=SZ(); const CX=w/2, CY=h/2, targetR=Math.min(w,h)*FILL/2;

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
      p.vx+=(dx/d)*press*0.0026; p.vy+=(dy/d)*press*0.0026;

      const pad=16, r=(p.rv||p.r);
      if(p.x - r < pad) p.vx+=EDGE; if(p.x + r > w - pad) p.vx-=EDGE;
      if(p.y - r < pad) p.vy+=EDGE; if(p.y + r > h - pad) p.vy-=EDGE;
    }

    // repulsão + anticolisão
    for(let pass=0; pass<PASSES; pass++){
      for(let i=0;i<sim.pts.length;i++){
        const p=sim.pts[i];
        for(const j of neigh(p)){ if(j<=i) continue;
          const q=sim.pts[j];
          const dx=p.x-q.x, dy=p.y-q.y, dist=Math.hypot(dx,dy)||1e-6, ux=dx/dist, uy=dy/dist;
          const need=(p.rv||p.r)+(q.rv||q.r)+SEP, reach=need+REACH;
          if(dist<reach){
            const s=REP*(1-dist/reach)*0.75; p.vx+=ux*s; p.vy+=uy*s; q.vx-=ux*s; q.vy-=uy*s;
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
      const {w,h}=SZ(); const r=(p.rv||p.r);
      p.x=Math.max(r+2,Math.min(w-r-2,p.x)); p.y=Math.max(r+2,Math.min(h-r-2,p.y));

      const n=sim.nodes[i];
      n.g.setAttribute('transform',`translate(${p.x},${p.y})`);
      n.disc.setAttribute('r', r);
      n.rim.setAttribute('r', r-1.6);
      n.outer.setAttribute('r', r*1.06);
      n.outer.setAttribute('stroke-width', Math.max(9, r*0.24));
      n.clipCircle.setAttribute('r', r-4);
      n.tik.setAttribute('font-size', clamp(14, r*0.62, 48));
      n.tik.setAttribute('y', 0);
      n.pct.setAttribute('font-size', clamp(12, r*0.36, 24));
      n.pct.setAttribute('y', r * 0.26);
      if(n.price){
        n.price.setAttribute('y',  r * 0.56);
        n.price.setAttribute('font-size', clamp(10, r*0.28, 16));
      }
    }

    sim.raf=requestAnimationFrame(step);
  };
  sim.raf=requestAnimationFrame(step);
}

/* morph com escala global por área */
function morphRadii(){
  const {key,vmin,vmax}=baseRadInfo(current);
  const targetsRaw = sim.pts.map(p => scaleR(p.s[key]??0, vmin, vmax));
  const sf = scaleTargetsToFit(targetsRaw);
  const t0=performance.now();

  (function loop(ts){
    const t=Math.min(1,(ts-t0)/MORPH_MS);
    for (let i=0;i<sim.pts.length;i++){
      const p = sim.pts[i];
      const target = targetsRaw[i] * sf;
      p.rv = (p.rv??p.r) + (target - (p.rv??p.r))*0.2;
    }
    if(t<1) requestAnimationFrame(loop);
  })(t0);
}

/* UI */
tabsBar.addEventListener('click', (e)=>{
  const btn = e.target.closest('.period-btn');
  if (!btn) return;
  document.querySelectorAll('.period-btn').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active');
  currentPeriod = btn.dataset.period;
  render();
});
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
async function refresh(){ const [br,us]=await Promise.all([loadMarket('brazilian'), loadMarket('american')]); master.brazilian=br; master.american=us; populateFilterOptions(); applyFilters(); }
function startAuto(){ if(timer) clearInterval(timer); timer=setInterval(refresh, REFRESH_MS); }

/* init */
async function init(){ const [br,us]=await Promise.all([loadMarket('brazilian'), loadMarket('american')]); master.brazilian=br; master.american=us; populateFilterOptions(); applyFilters(); startAuto(); }
document.addEventListener('DOMContentLoaded', init);

/* resize */
let rez; window.addEventListener('resize',()=>{ clearTimeout(rez); rez=setTimeout(()=>render(),120); });

/* iOS double-tap */
let lastTouch=0; document.addEventListener('touchend',e=>{ const now=Date.now(); if(now-lastTouch<=300) e.preventDefault(); lastTouch=now; },false);
