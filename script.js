/************ CONFIG ************/
console.log("Bubles JS v-anti-cluster");
const TOKEN = "5bTDfSmR2ieax6y7JUqDAD";
const IS_MOBILE = matchMedia("(max-width: 820px)").matches ||
                  (navigator.maxTouchPoints || 0) > 0;

const TOP_N = IS_MOBILE ? 30 : 250;

/* Física (mobile mais lento) */
const HEADER_SAFE      = 84;
const WALL_MARGIN      = IS_MOBILE ? 18 : 10;
const FRICTION         = IS_MOBILE ? 0.698 : 0.685;
const MAX_SPEED        = IS_MOBILE ? 0.12  : 0.90;
const START_VEL        = IS_MOBILE ? 0.05  : 0.15;
const REPULSE_COLLIDE  = IS_MOBILE ? 0.90  : 0.50; // choque imediato
const BORDER_WIDTH     = 2.5;
const COLLISION_PASSES = IS_MOBILE ? 5 : 2;

const MAX_RADIUS_BASE  = IS_MOBILE ? 46 : 80;     // normal
const CENTER_PULL      = IS_MOBILE ? 0.20 : 0.10;

/* Anti-agrupamento (repulsão de longo alcance) */
const SOFT_REPULSE_STRENGTH = IS_MOBILE ? 0.40 : 0.30;   // força
const NEIGHBOR_RANGE_MULT   = 1.6; // alcance ~1.6x (r1+r2)

/* Vento/drift para flutuar */
const DRIFT_STRENGTH  = IS_MOBILE ? 0.60 : 0.40;
const DRIFT_FREQ      = 0.40;

/* Wobble leve */
const WOBBLE_STRENGTH = IS_MOBILE ? 0.10 : 0.10;
const WOBBLE_FREQ     = 0.30;

/************ CANVAS ************/
const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener("resize", resize); resize();

/************ STATE ************/
let category = "acoes";
let bubbles = [];
let lastTime = performance.now();

/************ UTILS ************/
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const rand  = (a,b)=>Math.random()*(b-a)+a;
const colorForChange = ch => ch>0 ? "#0a8f1f" : ch<0 ? "#b31212" : "#4a4a4a";
const pickNum = (...xs)=> { for (const x of xs){ const n=Number(x); if(Number.isFinite(n)) return n; } return null; };
const formatBRL = v => Number.isFinite(Number(v)) ? `R$ ${Number(v).toFixed(2).replace('.',',')}` : "";

/* Raio: 3× MAIOR no CELULAR somente para estas categorias */
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
  return clamp(r, minR, maxR);
}

async function getJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

/************ LISTAS ************/
const LISTS = {
  Principais Ações: ["PETR3","PETR4","PRIO3","RRRP3","RECV3","ENAT3","CSAN3","VBBR3","RAIZ4","UGPA3""VALE3","CMIN3","CSNA3","GGBR4","GGBR3","GOAU4","GOAU3","BRAP4","BRAP3","USIM5","USIM3","FESA4","FESA3","CBAV3","PMAM3","PATI4","PATI3","EALT4","EALT3","MGEL4","AURA33""ITUB4","ITUB3","BBDC4","BBDC3","BBAS3","SANB11","SANB4","SANB3","BPAN4","ABCB4","BMGB4","BRSR6","BRSR3","PINE4","MODL11","MODL3","MODL4","BPAC11""MGLU3","VIIA3","LREN3","AMER3","ARZZ3","SOMA3","PETZ3","GUAR3","CEAB3","CRFB3","PCAR3","SBFG3","DMVF3","CASH3","NTCO3","GMAT3","LJQQ3","DTCY3"],
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

/* Minério real — até 20, sem placeholders */
async function fetchMinerioReal(){
  const data = await fetchByTickers(LISTS.minerio);
  return data.slice(0, Math.min(20, data.length));
}

/************ DISPATCH ************/
async function fetchData(){
  switch (category){
    case "acoes":     return fetchAcoesTop();
    case "minerio":   return (await fetchByTickers(LISTS.minerio)).slice(0, TOP_N);
    case "petroleo":  return (await fetchByTickers(LISTS.petroleo)).slice(0, TOP_N);
    case "bancos":    return (await fetchByTickers(LISTS.bancos)).slice(0, TOP_N);
    case "varejo":    return (await fetchByTickers(LISTS.varejo)).slice(0, TOP_N);
    default:          return fetchAcoesTop();
  }
}

/************ BOLHAS ************/
function createBubbles(data){
  bubbles = data.map(d => ({
    symbol: d.symbol,
    price: d.price,
    change: d.changePct,
    color: colorForChange(d.changePct),
    r: radiusFor(d.changePct, d.volume),
    x: rand(50, canvas.width-50),
    y: rand(100, canvas.height-50),
    vx: rand(-START_VEL, START_VEL),
    vy: rand(-START_VEL, START_VEL),
    phase: Math.random()*Math.PI*2
  }));
  for (let k=0;k<3;k++) resolveCollisions(true); // afastamento inicial
}

/************ FÍSICA ************/
function softSeparationForces(dtNow){
  // repulsão de longo alcance (anti-agrupamento)
  for (let i=0;i<bubbles.length;i++){
    for (let j=i+1;j<bubbles.length;j++){
      const a=bubbles[i], b=bubbles[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.hypot(dx,dy);
      if (!dist) continue;
      const want = (a.r + b.r) * NEIGHBOR_RANGE_MULT;
      if (dist < want){
        const nx = dx/dist, ny = dy/dist;
        // força decresce com a distância (mais forte quando muito perto)
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
          const push = REPULSE_COLLIDE*0.9;
          a.vx -= nx*push; a.vy -= ny*push;
          b.vx += nx*push; b.vy += ny*push;
        }
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

/************ DESENHO ************/
function drawBubble(b){
  ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
  ctx.fillStyle=b.color; ctx.fill();

  // brilho nas bordas (sem luz no centro)
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

  // vento/drift global para flutuar
  const windX = Math.sin(now * DRIFT_FREQ) * DRIFT_STRENGTH;
  const windY = Math.cos(now * DRIFT_FREQ * 0.9) * DRIFT_STRENGTH;

  // repulsão suave (anti-agrupamento)
  softSeparationForces(now);

  for(const p of bubbles){
    // leve “wobble”
    const t = now * WOBBLE_FREQ + p.phase;
    p.vx += Math.sin(t) * WOBBLE_STRENGTH * s;
    p.vy += Math.cos(t) * WOBBLE_STRENGTH * s;

    // vento
    p.vx += windX * s;
    p.vy += windY * s;

    // puxar muito levemente ao centro (quase nada)
    p.vx += (canvas.width*0.5  - p.x) * CENTER_PULL * s;
    p.vy += (canvas.height*0.55 - p.y) * CENTER_PULL * s;

    // atrito e limites
    p.vx = clamp(p.vx * Math.pow(FRICTION, s), -MAX_SPEED, MAX_SPEED);
    p.vy = clamp(p.vy * Math.pow(FRICTION, s), -MAX_SPEED, MAX_SPEED);

    // integrar
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
  document.querySelectorAll(".buttons button").forEach(b=>{
    b.classList.toggle("active", b.dataset.cat===cat);
  });
  try{
    const data = await fetchData();
    createBubbles(data);
  }catch(e){
    console.error("Erro ao carregar", cat, e);
    bubbles = []; draw();
  }
}
document.querySelectorAll(".buttons button").forEach(b=>{
  b.addEventListener("click", ()=>setCategory(b.dataset.cat));
});

/************ START ************/
setCategory("acoes");
requestAnimationFrame(step);
setInterval(()=>setCategory(category), 30000);
