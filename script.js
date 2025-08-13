/************ BUBLES — script.js (corrige cotações BRAPI e mantém seu visual/UX) ************/
console.log("Bubles JS v2025-08-13 fix-quote-only");

// ====== CONFIG ======
console.log("Bubles JS v2025-08-13 (retina+padding+anti-clip)");
const TOKEN = "5bTDfSmR2ieax6y7JUqDAD";
const IS_MOBILE = matchMedia("(max-width: 820px)").matches || (navigator.maxTouchPoints || 0) > 0;
const TOP_N = IS_MOBILE ? 30 : 200; // Ações: top por volume (mobile 30, desktop 200)
const REFRESH_MS = 30000;

// ====== FÍSICA / MOVIMENTO (mantém o que você aprovou) ======
const HEADER_SAFE      = 84;
const WALL_MARGIN      = IS_MOBILE ? 18 : 10;
const FRICTION         = IS_MOBILE ? 0.998 : 0.985;
const MAX_SPEED        = IS_MOBILE ? 0.12  : 0.90;
const START_VEL        = IS_MOBILE ? 0.05  : 0.45;
const REPULSE_COLLIDE  = IS_MOBILE ? 0.55  : 0.40;
const BORDER_WIDTH     = 2.5;
const COLLISION_PASSES = IS_MOBILE ? 5 : 1;

const MAX_RADIUS_BASE  = IS_MOBILE ? 46 : 80;
const SOFT_REPULSE_STRENGTH = IS_MOBILE ? 0.005 : 0.0035;
const NEIGHBOR_RANGE_MULT   = 1.7;

const CENTER_HOLE_RADIUS_FACTOR = IS_MOBILE ? 0.32 : 0.28; // “vazio” no centro (anti-aglomerado)
const CENTER_HOLE_STRENGTH      = IS_MOBILE ? 0.012 : 0.008;
const ORBIT_STRENGTH            = IS_MOBILE ? 0.009 : 0.006;

const DRIFT_BASE  = IS_MOBILE ? 0.004 : 0.003;
const DRIFT_FREQ  = 0.0018;
const WOBBLE_STRENGTH = 0.010;
const WOBBLE_FREQ = 0.0025;

// ====== CANVAS ======
const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener("resize", resize); resize();

// ====== ESTADO ======
let category = "acoes";
let bubbles = [];
let lastTime = performance.now();

// ====== UTILS ======
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const rand  = (a,b)=>Math.random()*(b-a)+a;
const colorForChange = ch => ch>0 ? "#0a8f1f" : ch<0 ? "#b31212" : "#4a4a4a";
function formatMoney(v, currency="BRL"){
  if (!Number.isFinite(Number(v))) return "";
  const pre = (currency||"BRL").toUpperCase()==="USD" ? "US$ " : "R$ ";
  return pre + Number(v).toFixed(2).replace(".",",");
}

// raio (3× no MOBILE só em Minério/Petróleo/Bancos/Varejo — como combinamos)
function radiusFor(changePct, volume){
  const v = Math.max(1, Number(volume)||1);
  const volScale = Math.log10(v+10)*3;
  const varScale = Math.min(8, Math.abs(Number(changePct)||0));
  const base = 16;
  let r = base + varScale*3 + volScale;

  const bigCats = ["minerio","petroleo","bancos","varejo"];
  const isBig = IS_MOBILE && bigCats.includes(category);
  const minR = 18;
  const maxR = isBig ? MAX_RADIUS_BASE*3 : MAX_RADIUS_BASE;

  if (isBig) r *= 3;
  return Math.max(minR, Math.min(r, maxR));
}

// ====== LISTAS DE SETOR ======
const LISTS = {
  minerio: ["VALE3","CMIN3","CSNA3","GGBR4","GGBR3","GOAU4","GOAU3","BRAP4","BRAP3","USIM5","USIM3","FESA4","FESA3","CBAV3","PMAM3","PATI4","PATI3","EALT4","EALT3","MGEL4","AURA33"],
  petroleo:["PETR3","PETR4","PRIO3","RRRP3","RECV3","ENAT3","CSAN3","VBBR3","RAIZ4","UGPA3"],
  bancos:  ["ITUB4","ITUB3","BBDC4","BBDC3","BBAS3","SANB11","SANB4","SANB3","BPAN4","ABCB4","BMGB4","BRSR6","BRSR3","PINE4","MODL11","MODL3","MODL4","BPAC11"],
  varejo:  ["MGLU3","VIIA3","LREN3","AMER3","ARZZ3","SOMA3","PETZ3","GUAR3","CEAB3","CRFB3","PCAR3","SBFG3","DMVF3","CASH3","NTCO3","GMAT3","LJQQ3","DTCY3"]
};

// ===================== CORREÇÃO DAS COTAÇÕES (BRAPI) =====================
// Padroniza usando APENAS campos do /quote/{tickers}
function mapQuote(it){
  const symbol = (it.symbol || it.stock || it.code || it.ticker || "").toUpperCase();

  // preço e % corretos (origem: /quote/{tickers})
  const price = Number(it.regularMarketPrice);
  let changePct = Number(it.regularMarketChangePercent);

  // fallback confiável quando a API não mandar o percentual
  if (!Number.isFinite(changePct)) {
    const prev = Number(it.regularMarketPreviousClose);
    if (Number.isFinite(price) && Number.isFinite(prev) && prev !== 0) {
      changePct = ((price / prev) - 1) * 100;
    }
  }

  const volume   = Number(it.regularMarketVolume ?? it.volume ?? it.totalVolume);
  const currency = (it.currency || "BRL").toUpperCase();

  return { symbol, price, changePct, volume, currency };
}
const valid = q => q && q.symbol && Number.isFinite(q.price) && Number.isFinite(q.changePct);

// Busca por tickers (usado por Minério/Petróleo/Bancos/Varejo e reidratação das Ações)
async function fetchByTickers(tickers){
  if (!tickers?.length) return [];
  tickers = [...new Set(tickers.map(s => s.toUpperCase()))];

  const chunk = 40, batches=[];
  for (let i=0;i<tickers.length;i+=chunk){
    const slice = tickers.slice(i,i+chunk);
    batches.push(fetch(`https://brapi.dev/api/quote/${slice.join(",")}?token=${TOKEN}`).then(r=>r.json()));
  }
  const settled = await Promise.allSettled(batches);
  const raw = settled.flatMap(x => x.status==="fulfilled" ? (x.value.results || x.value.stocks || []) : []);
  const arr = raw.map(mapQuote).filter(valid);
  arr.sort((a,b)=>(b.volume||0)-(a.volume||0));
  return arr;
}

// Ações: usa /quote/list só para rankear por volume; reidrata com /quote/{tickers}
async function fetchAcoesTop(){
  const url = `https://brapi.dev/api/quote/list?limit=${TOP_N*3}&sortBy=volume&sortOrder=desc&token=${TOKEN}`;
  const list = await fetch(url).then(r=>r.json());
  const stocks = (list.stocks || list.results || []).map(s => s.stock?.toUpperCase()).filter(Boolean);

  const hydrated = await fetchByTickers(stocks.slice(0, TOP_N*2)); // folga
  hydrated.sort((a,b)=>(b.volume||0)-(a.volume||0));
  return hydrated.slice(0, TOP_N);
}

// Minério: até 20 que estiverem cotando (sem placeholders)
async function fetchMinerioReal(){
  const data = await fetchByTickers(LISTS.minerio);
  return data.slice(0, Math.min(20, data.length));
}

async function fetchData(){
  switch(category){
    case "acoes":     return fetchAcoesTop();
    case "minerio":   return fetchMinerioReal();
    case "petroleo":  return (await fetchByTickers(LISTS.petroleo)).slice(0, TOP_N);
    case "bancos":    return (await fetchByTickers(LISTS.bancos)).slice(0, TOP_N);
    case "varejo":    return (await fetchByTickers(LISTS.varejo)).slice(0, TOP_N);
    default:          return fetchAcoesTop();
  }
}

// ====== BOLHAS ======
function createBubbles(data){
  bubbles = data.map(d => ({
    symbol: d.symbol,
    price: d.price,
    change: d.changePct,
    currency: d.currency,
    color: colorForChange(d.changePct),
    r: radiusFor(d.changePct, d.volume),
    x: rand(50, canvas.width-50),
    y: rand(HEADER_SAFE+20, canvas.height-50),
    vx: rand(-START_VEL, START_VEL),
    vy: rand(-START_VEL, START_VEL),
    phase: Math.random()*Math.PI*2,
    driftSeed: Math.random()*Math.PI*2
  }));
  for (let k=0;k<3;k++) resolveCollisions(true); // afastamento inicial
}

// ====== FÍSICA ======
function softSeparationForces(){
  for (let i=0;i<bubbles.length;i++){
    for (let j=i+1;j<bubbles.length;j++){
      const a=bubbles[i], b=bubbles[j];
      const dx=b.x-a.x, dy=b.y-a.y, dist=Math.hypot(dx,dy);
      if (!dist) continue;
      const want=(a.r+b.r)*NEIGHBOR_RANGE_MULT;
      if (dist<want){
        const nx=dx/dist, ny=dy/dist, k=(1-dist/want)*SOFT_REPULSE_STRENGTH;
        a.vx-=nx*k; a.vy-=ny*k; b.vx+=nx*k; b.vy+=ny*k;
      }
    }
  }
}
function resolveCollisions(init=false){
  for (let i=0;i<bubbles.length;i++){
    for (let j=i+1;j<bubbles.length;j++){
      const a=bubbles[i], b=bubbles[j];
      const dx=b.x-a.x, dy=b.y-a.y, dist=Math.hypot(dx,dy);
      const min=a.r+b.r+BORDER_WIDTH;
      if (dist<min && dist>0){
        const nx=dx/dist, ny=dy/dist, overlap=(min-dist)*0.6;
        a.x-=nx*overlap/2; a.y-=ny*overlap/2;
        b.x+=nx*overlap/2; b.y+=ny*overlap/2;
        if(!init){ const push=REPULSE_COLLIDE*0.5; a.vx-=nx*push; a.vy-=ny*push; b.vx+=nx*push; b.vy+=ny*push; }
      }
    }
  }
}
function wallConstraints(p){
  const L=p.r+WALL_MARGIN, R=canvas.width-p.r-WALL_MARGIN;
  const T=HEADER_SAFE+p.r, B=canvas.height-p.r-WALL_MARGIN;
  if(p.x<L){p.x=L;p.vx=Math.abs(p.vx);} if(p.x>R){p.x=R;p.vx=-Math.abs(p.vx);}
  if(p.y<T){p.y=T;p.vy=Math.abs(p.vy);} if(p.y>B){p.y=B;p.vy=-Math.abs(p.vy);}
}

// ====== DESENHO ======
function drawBubble(b){
  ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
  ctx.fillStyle=b.color; ctx.fill();

  // brilho nas bordas (3D sutil; sem brilho no centro)
  const ring=ctx.createRadialGradient(b.x,b.y,b.r*0.75,b.x,b.y,b.r);
  ring.addColorStop(0,"rgba(255,255,255,0)");
  ring.addColorStop(1,"rgba(255,255,255,0.85)");
  ctx.fillStyle=ring; ctx.fill();

  ctx.lineWidth=BORDER_WIDTH; ctx.strokeStyle="#fff"; ctx.stroke();

  // textos
  ctx.fillStyle="#fff"; ctx.textAlign="center"; ctx.textBaseline="middle";
  const f1=Math.max(11,Math.floor(b.r*0.4));
  const f2=Math.max(10,Math.floor(b.r*0.3));
  const f3=Math.max(9, Math.floor(b.r*0.25));

  ctx.font=`700 ${f1}px Arial`;
  ctx.fillText(b.symbol, b.x, b.y - b.r*0.3);

  ctx.font=`500 ${f2}px Arial`;
  ctx.fillText(formatMoney(b.price, b.currency), b.x, b.y);

  ctx.font=`600 ${f3}px Arial`;
  const sign=b.change>=0?"+":"";
  ctx.fillText(`${sign}${b.change.toFixed(2)}%`, b.x, b.y + b.r*0.3);
}
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(const b of bubbles) drawBubble(b);
}

// ====== LOOP ======
function step(now=performance.now()){
  let dt = now - lastTime; lastTime = now;
  dt = Math.min(32, Math.max(8, dt));
  const s = dt/16;

  softSeparationForces();

  const cx = canvas.width*0.5, cy = canvas.height*0.52;
  const holeR = Math.min(canvas.width, canvas.height)*CENTER_HOLE_RADIUS_FACTOR;

  for(const p of bubbles){
    // wobble
    const t = now*WOBBLE_FREQ + p.phase;
    p.vx += Math.sin(t)*WOBBLE_STRENGTH*s;
    p.vy += Math.cos(t)*WOBBLE_STRENGTH*s;

    // drift
    const w = now*DRIFT_FREQ + p.driftSeed;
    p.vx += Math.sin(w*0.9)*DRIFT_BASE*s;
    p.vy += Math.cos(w*1.1)*DRIFT_BASE*s;

    // “vazio” central + órbita
    const dx=p.x-cx, dy=p.y-cy, dist=Math.hypot(dx,dy);
    if(dist < holeR && dist>0.0001){
      const nx=dx/dist, ny=dy/dist, k=(1-dist/holeR)*CENTER_HOLE_STRENGTH;
      p.vx += nx*k*s; p.vy += ny*k*s;
    }
    if(dist>0.0001){
      const nx=dx/dist, ny=dy/dist, tx=-ny, ty=nx;
      const orb = ORBIT_STRENGTH*(holeR/(holeR+dist));
      p.vx += tx*orb*s; p.vy += ty*orb*s;
    }

    // atrito + limites
    p.vx = clamp(p.vx*Math.pow(FRICTION,s), -MAX_SPEED, MAX_SPEED);
    p.vy = clamp(p.vy*Math.pow(FRICTION,s), -MAX_SPEED, MAX_SPEED);

    // integra
    p.x  += p.vx*s; p.y  += p.vy*s;

    wallConstraints(p);
  }
  for(let k=0;k<COLLISION_PASSES;k++) resolveCollisions();
  draw();
  requestAnimationFrame(step);
}

// ====== BOTÕES ======
async function setCategory(cat){
  category = cat;
  const btns = document.querySelectorAll(".buttons button");
  btns.forEach(b=>b.classList.toggle("active", b.dataset.cat===cat));
  try{
    const data = await fetchData();
    bubbles = [];
    if (data && data.length) createBubbles(data);
  }catch(e){
    console.error("Erro ao carregar", cat, e);
    bubbles = [];
  }
}
document.querySelectorAll(".buttons button").forEach(b=>{
  b.addEventListener("click", ()=>setCategory(b.dataset.cat));
});

// (Opcional) Clique na bolha abre TradingView se o modal existir no HTML
canvas.addEventListener("click", (e)=>{
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  for (const b of bubbles){
    if (Math.hypot(x-b.x, y-b.y) <= b.r){
      const modal = document.getElementById("chartModal");
      const iframe = document.getElementById("tradingview-frame");
      if (modal && iframe){
        // TradingView para B3 geralmente funciona com "BMFBOVESPA:TICKER"
        iframe.src = `https://s.tradingview.com/widgetembed/?symbol=BMFBOVESPA:${encodeURIComponent(b.symbol)}&interval=1&theme=dark&style=1&locale=br`;
        modal.style.display = "block";
      }
      break;
    }
  }
});

// ====== START ======
setCategory("acoes");
requestAnimationFrame(step);
setInterval(()=>setCategory(category), REFRESH_MS);
