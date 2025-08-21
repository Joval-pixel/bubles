/************ CONFIG ************/
console.log("Bubles JS v2025-08-14 (fix: canvas visível + z-index + retina)");
const TOKEN = "5bTDfSmR2ieax6y7JUqDAD";
const IS_MOBILE = matchMedia("(max-width: 720px)").matches ||
                  (navigator.maxTouchPoints || 0) > 0;

const TOP_N = IS_MOBILE ? 25 : 200;

/* Física (mobile mais rapido) */
const DEFAULT_HEADER_SAFE = 84;
const WALL_MARGIN      = IS_MOBILE ? 18 : 10;
const FRICTION         = IS_MOBILE ? 0.998 : 0.985;
const MAX_SPEED        = IS_MOBILE ? 0.35  : 0.90;
const START_VEL        = IS_MOBILE ? 0.05  : 0.45;
const REPULSE_COLLIDE  = IS_MOBILE ? 0.55  : 0.40;
const BORDER_WIDTH     = 2.5;
const COLLISION_PASSES = IS_MOBILE ? 5 : 1;

const MAX_RADIUS_BASE  = IS_MOBILE ? 46 : 80;     // base

/* Anti-agrupamento (repulsão de longo alcance) */
const SOFT_REPULSE_STRENGTH = IS_MOBILE ? 0.005 : 0.0035;
const NEIGHBOR_RANGE_MULT   = 1.7;

/* “Buraco” central + órbita */
const CENTER_HOLE_RADIUS_FACTOR = IS_MOBILE ? 0.32 : 0.28;
const CENTER_HOLE_STRENGTH      = IS_MOBILE ? 0.012 : 0.008;
const ORBIT_STRENGTH            = IS_MOBILE ? 0.009 : 0.006;

/* Vento/drift + wobble */
const DRIFT_BASE        = IS_MOBILE ? 0.004 : 0.003;
const DRIFT_FREQ        = 0.0018;
const WOBBLE_STRENGTH   = IS_MOBILE ? 0.010 : 0.010;
const WOBBLE_FREQ       = 0.0025;

/************ CANVAS (retina) ************/
const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });

function resize(){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const w = window.innerWidth;
  const h = window.innerHeight;

  // tamanho visual
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";

  // tamanho real (retina)
  canvas.width  = Math.max(1, Math.floor(w * dpr));
  canvas.height = Math.max(1, Math.floor(h * dpr));

  // Desenhar em coordenadas de CSS px
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", resize, { passive:true });
addEventListener("orientationchange", () => setTimeout(resize, 200));
resize();

/************ STATE ************/
let category = "acoes";
let bubbles = [];
let lastTime = performance.now();

/************ DOM helpers ************/
const headerEl  = document.querySelector(".header");
const statusBar = document.getElementById("statusBar");
function headerHeight(){
  try { return Math.ceil(headerEl?.getBoundingClientRect().height || DEFAULT_HEADER_SAFE); }
  catch { return DEFAULT_HEADER_SAFE; }
}
function stageSize(){
  return { w: canvas.clientWidth || window.innerWidth,
           h: canvas.clientHeight || window.innerHeight };
}
function boundsPad(){ return WALL_MARGIN + Math.max(8, BORDER_WIDTH * 1.25); }
const setStatus = (t)=> statusBar && (statusBar.textContent = t || "");

/************ UTILS ************/
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const rand  = (a,b)=>Math.random()*(b-a)+a;
const colorForChange = ch => ch>0 ? "#0a8f1f" : ch<0 ? "#b31212" : "#4a4a4a";
const pickNum = (...xs)=> { for (const x of xs){ const n=Number(x); if(Number.isFinite(n)) return n; } return null; };
const formatBRL = v => Number.isFinite(Number(v)) ? `R$ ${Number(v).toFixed(2).replace('.',',')}` : "";

/* Raio (1× no mobile p/ categorias setoriais) */
function radiusFor(changePct, volume){
  const v = Math.max(1, Number(volume)||1);
  const volScale = Math.log10(v+10)*3;
  const varScale = Math.min(8, Math.abs(Number(changePct)||0));
  const base = 4;
  let r = base + varScale*3 + volScale;

  const bigCats = ["minerio","petroleo","bancos","varejo"];
  const isBig = IS_MOBILE && bigCats.includes(category);
  const minR = 18;
  const maxR = isBig ? MAX_RADIUS_BASE*3 : MAX_RADIUS_BASE;

  if (isBig) r *= 3;
  return clamp(r, minR, maxR);
}

async function getJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

/************ LISTAS (setores) ************/
const LISTS = {
  minerio: ["VALE3","CMIN3","CSNA3",
    "GGBR4","GGBR3","GOAU4","GOAU3",
    "BRAP4","BRAP3",
    "USIM5","USIM3",
    "FESA4","FESA3",
    "CBAV3","PMAM3",
    "PATI4","PATI3",
    "EALT4","EALT3",
    "MGEL4","AURA33"
  ],
  petroleo:["PETR3","PETR4","PRIO3","RRRP3","RECV3","ENAT3","CSAN3","VBBR3","RAIZ4","UGPA3"],
  bancos:  ["ITUB4","ITUB3","BBDC4","BBDC3","BBAS3","SANB11","SANB4","SANB3","BPAN4","ABCB4","BMGB4","BRSR6","BRSR3","PINE4","MODL11","MODL3","MODL4","BPAC11"],
  varejo:  ["MGLU3","VIIA3","LREN3","AMER3","ARZZ3","SOMA3","PETZ3","GUAR3","CEAB3","CRFB3","PCAR3","SBFG3","DMVF3","CASH3","NTCO3","GMAT3","LJQQ3","DTCY3"]
};

/************ MAP + VALID ************/
function mapQuote(it){
  const symbol = (it.symbol || it.stock || it.code || it.ticker || "").toUpperCase();
  const price  = pickNum(it.regularMarketPrice, it.price, it.close, it.lastPrice);
  let changePct = pickNum(it.regularMarketChangePercent, it.change_percent, it.change, it.pctChange);
  if (!Number.isFinite(changePct)) {
    const prev = pickNum(it.regularMarketPreviousClose, it.previousClose, it.prevClose);
    if (Number.isFinite(price) && Number.isFinite(prev) && prev !== 0) {
      changePct = ((price / prev) - 1) * 100;
    }
  }
  const volume = pickNum(it.regularMarketVolume, it.volume, it.totalVolume);
  return { symbol, price, changePct, volume };
}
const valid = q => q && q.symbol && Number.isFinite(q.price) && Number.isFinite(q.changePct);

/************ FETCHERS ************/
async function fetchAcoesTop(){
  const url = `https://brapi.dev/api/quote/list?limit=${TOP_N*3}&sortBy=volume&sortOrder=desc&token=${TOKEN}`;
  const json = await getJSON(url);
  const arr = json.stocks || json.results || [];
  const norm = arr.map(mapQuote).filter(valid);
  norm.sort((a,b)=>(b.volume||0)-(a.volume||0));
  return norm.slice(0, TOP_N);
}

async function fetchByTickers(tickers){
  if (!tickers.length) return [];
  const chunk = 40;
  const batches = [];
  for (let i=0;i<tickers.length;i+=chunk){
    const slice = tickers.slice(i,i+chunk);
    batches.push(getJSON(`https://brapi.dev/api/quote/${slice.join(",")}?token=${TOKEN}`));
  }
  const results = (await Promise.allSettled(batches))
    .flatMap(r => r.status==="fulfilled" ? (r.value.results || r.value.stocks || []) : []);
  const mapped = results.map(mapQuote).filter(valid);
  mapped.sort((a,b)=>(b.volume||0)-(a.volume||0));
  return mapped;
}

/* Minério real — até 20 */
async function fetchMinerioReal(){
  const data = await fetchByTickers(LISTS.minerio);
  return data.slice(0, Math.min(20, data.length));
}

/************ DISPATCH ************/
async function fetchData(){
  switch (category){
    case "acoes":     return fetchAcoesTop();
    case "minerio":   return fetchMinerioReal();
    case "petroleo":  return (await fetchByTickers(LISTS.petroleo)).slice(0, TOP_N);
    case "bancos":    return (await fetchByTickers(LISTS.bancos)).slice(0, TOP_N);
    case "varejo":    return (await fetchByTickers(LISTS.varejo)).slice(0, TOP_N);
    default:          return fetchAcoesTop();
  }
}

/************ BOLHAS ************/
function createBubbles(data){
  const { w, h } = stageSize();
  const pad = boundsPad();
  const hh  = headerHeight();

  bubbles = data.map(d => ({
    symbol: d.symbol,
    price: d.price,
    change: d.changePct,
    color: colorForChange(d.changePct),
    r: radiusFor(d.changePct, d.volume),

    x: rand(pad + 50,  w - pad - 50),
    y: rand(hh + pad + 20,  h - pad - 50),

    vx: rand(-START_VEL, START_VEL),
    vy: rand(-START_VEL, START_VEL),
    phase: Math.random()*Math.PI*2,
    driftSeed: Math.random()*Math.PI*2
  }));

  for (let k=0;k<(IS_MOBILE?5:3);k++) resolveCollisions(true);
}

/************ FÍSICA ************/
function softSeparationForces(){
  for (let i=0;i<bubbles.length;i++){
    for (let j=i+1;j<bubbles.length;j++){
      const a=bubbles[i], b=bubbles[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.hypot(dx,dy);
      if (!dist) continue;
      const want = (a.r + b.r) * NEIGHBOR_RANGE_MULT;
      if (dist < want){
        const nx = dx/dist, ny = dy/dist;
        const k = (1 - dist/want) * SOFT_REPULSE_STRENGTH;
        a.vx -= nx * k; a.vy -= ny * k;
        b.vx += nx * k; b.vy += ny * k;
      }
    }
  }
}

function resolveCollisions(init=false){
  for (let i=0;i<bubbles.length;i++){
    for (let j=i+1;j<bubbles.length;j++){
      const a=bubbles[i], b=bubbles[j];
      const dx=b.x-a.x, dy=b.y-a.y;
      const dist=Math.hypot(dx,dy);
      const min=a.r+b.r+BORDER_WIDTH;
      if (dist < min && dist>0){
        const nx=dx/dist, ny=dy/dist;
        const overlap=(min-dist)*0.6;
        a.x -= nx*overlap/2; a.y -= ny*overlap/2;
        b.x += nx*overlap/2; b.y += ny*overlap/2;
        if(!init){
          const push = REPULSE_COLLIDE*0.5;
          a.vx -= nx*push; a.vy -= ny*push;
          b.vx += nx*push; b.vy += ny*push;
        }
      }
    }
  }
}

function wallConstraints(p){
  const { w, h } = stageSize();
  const pad = boundsPad();
  const hh  = headerHeight();

  const L = p.r + pad;
  const R = w - p.r - pad;
  const T = hh + p.r + pad;
  const B = h - p.r - pad;

  if(p.x < L){ p.x = L; p.vx = Math.abs(p.vx); }
  if(p.x > R){ p.x = R; p.vx = -Math.abs(p.vx); }
  if(p.y < T){ p.y = T; p.vy = Math.abs(p.vy); }
  if(p.y > B){ p.y = B; p.vy = -Math.abs(p.vy); }
}

/************ DESENHO ************/
function drawBubble(b){
  ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
  ctx.fillStyle=b.color; ctx.fill();

  // brilho na borda
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
  ctx.fillText(`${formatBRL(b.price)}`, b.x, b.y);

  ctx.font=`600 ${f3}px Arial`;
  const sign=b.change>=0?"+":"";
  ctx.fillText(`${sign}${b.change.toFixed(2)}%`, b.x, b.y + b.r*0.3);
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(const b of bubbles) drawBubble(b);
}

/************ LOOP ************/
function step(now = performance.now()){
  let dt = now - lastTime;
  lastTime = now;
  dt = Math.min(32, Math.max(8, dt));
  const s = dt / 16;

  softSeparationForces();

  const { w, h } = stageSize();
  const cx = w * 0.5;
  const cy = h * 0.52;
  const holeR = Math.min(w, h) * CENTER_HOLE_RADIUS_FACTOR;

  for(const p of bubbles){
    const t = now * WOBBLE_FREQ + p.phase;
    p.vx += Math.sin(t) * WOBBLE_STRENGTH * s;
    p.vy += Math.cos(t) * WOBBLE_STRENGTH * s;

    const wv = now * DRIFT_FREQ + p.driftSeed;
    p.vx += Math.sin(wv*0.9) * DRIFT_BASE * s;
    p.vy += Math.cos(wv*1.1) * DRIFT_BASE * s;

    const dx = p.x - cx, dy = p.y - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < holeR && dist > 0.0001){
      const nx = dx / dist, ny = dy / dist;
      const k = (1 - dist / holeR) * CENTER_HOLE_STRENGTH;
      p.vx += nx * k * s;
      p.vy += ny * k * s;
    }
    if (dist > 0.0001){
      const nx = dx / dist, ny = dy / dist;
      const tx = -ny, ty = nx;
      const orb = ORBIT_STRENGTH * (holeR / (holeR + dist));
      p.vx += tx * orb * s;
      p.vy += ty * orb * s;
    }

    p.vx = clamp(p.vx * Math.pow(FRICTION, s), -MAX_SPEED, MAX_SPEED);
    p.vy = clamp(p.vy * Math.pow(FRICTION, s), -MAX_SPEED, MAX_SPEED);

    p.x  += p.vx * s; p.y  += p.vy * s;

    wallConstraints(p);
  }

  for(let k=0;k<COLLISION_PASSES;k++) resolveCollisions();
  draw();
  requestAnimationFrame(step);
}

/************ BOTÕES ************/
async function setCategory(cat){
  category = cat;
  document.querySelectorAll(".buttons .btn").forEach(b=>{
    b.classList.toggle("active", b.dataset.cat===cat);
  });
  try{
    setStatus("Carregando cotações…");
    const data = await fetchData();
    createBubbles(data);
    setStatus(`Ao vivo • ${cat.toUpperCase()} (${data.length})`);
  }catch(e){
    console.error("Erro ao carregar", cat, e);
    setStatus("Erro ao carregar dados.");
    bubbles = []; draw();
  }
}
document.querySelectorAll(".buttons .btn").forEach(b=>{
  b.addEventListener("click", ()=>setCategory(b.dataset.cat));
});

/************ START ************/
setCategory("acoes");
requestAnimationFrame(step);

/* Atualiza preços/variação a cada 30s (sem resetar posições) */
setInterval(async ()=>{
  try{
    const data = await fetchData();
    const bySym = new Map(data.map(d => [d.symbol, d]));
    for (const p of bubbles){
      const d = bySym.get(p.symbol);
      if (!d) continue;
      p.price  = d.price;
      p.change = d.changePct;
      p.color  = colorForChange(d.changePct);
      p.r      = radiusFor(d.changePct, d.volume);
    }
    setStatus(`Atualizado • ${new Date().toLocaleTimeString()}`);
  }catch(e){
    console.warn("Falha ao atualizar:", e?.message || e);
  }
}, 30000);