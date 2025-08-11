/************ CONFIG ************/
const TOKEN = "5bTDfSmR2ieax6y7JUqDAD";
const IS_MOBILE = matchMedia("(max-width: 820px)").matches ||
                  (navigator.maxTouchPoints || 0) > 0;

const TOP_N = IS_MOBILE ? 20 : 100;

/* Física mais suave no celular */
const HEADER_SAFE     = 54;
const WALL_MARGIN     = IS_MOBILE ? 18 : 10;
const FRICTION        = IS_MOBILE ? 0.998 : 0.985;
const MAX_SPEED       = IS_MOBILE ? 0.12  : 0.90;
const START_VEL       = IS_MOBILE ? 0.05  : 0.45;
const REPULSE         = IS_MOBILE ? 0.65  : 0.40;
const BORDER_WIDTH    = 2.5;
const COLLISION_PASSES= IS_MOBILE ? 5 : 1;

const MAX_RADIUS      = IS_MOBILE ? 46 : 80; // 🔹 Menor no celular
const CENTER_PULL     = IS_MOBILE ? 0.0015 : 0.0008;

const WOBBLE_STRENGTH = IS_MOBILE ? 0.010 : 0.01;
const WOBBLE_FREQ     = 0.0025;

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

function radiusFor(changePct, volume){
  const v = Math.max(1, Number(volume)||1);
  const volScale = Math.log10(v+10)*3;
  const varScale = Math.min(8, Math.abs(Number(changePct)||0));
  const base = 16;
  return clamp(base + varScale*3 + volScale, 18, MAX_RADIUS);
}

async function getJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}
const formatBRL = v => {
  const n = Number(v);
  return Number.isFinite(n) ? `R$ ${n.toFixed(2).replace('.',',')}` : "";
};

/************ LISTAS ************/
const LISTS = {
  minerio: ["VALE3","CMIN3","USIM5","USIM3","USIM6","CSNA3","GGBR4","GGBR3","GOAU4","GOAU3","BRAP4","BRAP3","FESA4","FESA3","PMAM3"],
  petroleo:["PETR3","PETR4","PRIO3","RRRP3","RECV3","ENAT3","CSAN3","VBBR3","RAIZ4","UGPA3"],
  bancos:  ["ITUB4","ITUB3","BBDC4","BBDC3","BBAS3","SANB11","SANB4","SANB3","BPAN4","ABCB4","BMGB4","BRSR6","BRSR3","PINE4","MODL11","MODL3","MODL4","BPAC11"],
  varejo:  ["MGLU3","VIIA3","LREN3","AMER3","ARZZ3","SOMA3","PETZ3","GUAR3","CEAB3","CRFB3","PCAR3","SBFG3","DMVF3","CASH3","NTCO3","GMAT3","LJQQ3","DTCY3"]
};

/************ FETCH ************/
async function fetchAcoesTop(){
  const url = `https://brapi.dev/api/quote/list?limit=${TOP_N*3}&sortBy=volume&sortOrder=desc&token=${TOKEN}`;
  const json = await getJSON(url);
  const arr = json.stocks || json.results || [];
  const norm = arr.map(it => ({
    symbol: it.symbol || it.stock,
    price: pickNum(it.regularMarketPrice, it.close, it.price, it.lastPrice),
    changePct: pickNum(it.regularMarketChangePercent, it.change_percent, it.change, it.pctChange),
    volume: pickNum(it.regularMarketVolume, it.volume, it.totalVolume)
  })).filter(x => x.symbol && x.price !== null && x.changePct !== null);
  norm.sort((a,b)=>(b.volume||0)-(a.volume||0));
  return norm.slice(0, TOP_N);
}

async function fetchByTickersTop(tickers){
  if (!tickers.length) return [];
  const chunk = 40;
  const batches = [];
  for (let i=0;i<tickers.length;i+=chunk){
    const slice = tickers.slice(i,i+chunk);
    batches.push(getJSON(`https://brapi.dev/api/quote/${slice.join(",")}?token=${TOKEN}`));
  }
  const results = (await Promise.allSettled(batches))
    .flatMap(r => r.status==="fulfilled" ? (r.value.results || r.value.stocks || []) : []);
  const mapped = results.map(it => ({
    symbol: it.symbol || it.stock,
    price: pickNum(it.regularMarketPrice, it.price, it.close, it.lastPrice),
    changePct: pickNum(it.regularMarketChangePercent, it.change_percent, it.change, it.pctChange),
    volume: pickNum(it.regularMarketVolume, it.volume, it.totalVolume)
  })).filter(x => x.symbol && x.price !== null && x.changePct !== null);
  mapped.sort((a,b)=>(b.volume||0)-(a.volume||0));
  return mapped.slice(0, TOP_N);
}

async function fetchData(){
  switch (category){
    case "acoes":     return fetchAcoesTop();
    case "minerio":   return fetchByTickersTop(LISTS.minerio);
    case "petroleo":  return fetchByTickersTop(LISTS.petroleo);
    case "bancos":    return fetchByTickersTop(LISTS.bancos);
    case "varejo":    return fetchByTickersTop(LISTS.varejo);
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
}

/************ FÍSICA ************/
function resolveCollisions(){
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
  const ring=ctx.createRadialGradient(b.x,b.y,b.r*0.75,b.x,b.y,b.r);
  ring.addColorStop(0,"rgba(255,255,255,0)");
  ring.addColorStop(1,"rgba(255,255,255,0.85)");
  ctx.fillStyle=ring; ctx.fill();
  ctx.lineWidth=BORDER_WIDTH; ctx.strokeStyle="#fff"; ctx.stroke();
  ctx.fillStyle="#fff"; ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.font=`700 ${Math.max(11,Math.floor(b.r*0.4))}px Arial`;
  ctx.fillText(b.symbol, b.x, b.y - b.r*0.3);
  ctx.font=`500 ${Math.max(10,Math.floor(b.r*0.3))}px Arial`;
  ctx.fillText(`${formatBRL(b.price)}`, b.x, b.y);
  ctx.font=`600 ${Math.max(9,Math.floor(b.r*0.25))}px Arial`;
  ctx.fillText(`${b.change.toFixed(2)}%`, b.x, b.y + b.r*0.3);
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

  for(const p of bubbles){
    const t = now * WOBBLE_FREQ + p.phase;
    p.vx += Math.sin(t) * WOBBLE_STRENGTH * s;
    p.vy += Math.cos(t) * WOBBLE_STRENGTH * s;
    p.vx = clamp(p.vx * Math.pow(FRICTION, s), -MAX_SPEED, MAX_SPEED);
    p.vy = clamp(p.vy * Math.pow(FRICTION, s), -MAX_SPEED, MAX_SPEED);
    p.x  += p.vx * s; p.y  += p.vy * s;
    wallConstraints(p);
  }
  resolveCollisions();
  draw();
  requestAnimationFrame(step);
}

/************ BOTÕES ************/
async function setCategory(cat){
  category = cat;
  const data = await fetchData();
  createBubbles(data);
}
document.querySelectorAll(".buttons button").forEach(b=>{
  b.addEventListener("click", ()=>setCategory(b.dataset.cat));
});

/************ START ************/
setCategory("acoes");
requestAnimationFrame(step);
setInterval(()=>setCategory(category), 30000);