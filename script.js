/************ CONFIG ************/
const TOKEN = "5bTDfSmR2ieax6y7JUqDAD";

/* Detecta mobile (tela pequena ou toque) */
const IS_MOBILE = matchMedia("(max-width: 820px)").matches ||
                  (navigator.maxTouchPoints || 0) > 0;

/* Quantidade de bolhas por botão (top por volume) */
const TOP_N = IS_MOBILE ? 30 : 100;

/* Física – mobile BEM mais suave/lento */
const HEADER_SAFE     = 84;
const WALL_MARGIN     = IS_MOBILE ? 18 : 10;
const FRICTION        = IS_MOBILE ? 0.996 : 0.985; // + atrito no mobile
const MAX_SPEED       = IS_MOBILE ? 0.20  : 0.90;  // 🔹 mais lento no mobile
const START_VEL       = IS_MOBILE ? 0.07  : 0.45;  // 🔹 menor no mobile
const REPULSE         = IS_MOBILE ? 0.70  : 0.40;  // + repulsão
const BORDER_WIDTH    = 2.5;
const COLLISION_PASSES= IS_MOBILE ? 5 : 1;         // + colisões por quadro
const MAX_RADIUS      = IS_MOBILE ? 55 : 90;       // 🔹 bolhas menores no mobile
const CENTER_PULL     = IS_MOBILE ? 0.0020 : 0.0008; // puxa levemente ao centro

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
  const base = 18; // 🔹 reduzido p/ bolhas menores no celular
  return clamp(base + varScale*3 + volScale, 20, MAX_RADIUS);
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

/************ LISTAS POR SEGMENTO ************/
const LISTS = {
  minerio: ["VALE3","CMIN3","USIM5","USIM3","USIM6","CSNA3","GGBR4","GGBR3","GOAU4","GOAU3","BRAP4","BRAP3","FESA4","FESA3","PMAM3"],
  petroleo:["PETR3","PETR4","PRIO3","RRRP3","RECV3","ENAT3","CSAN3","VBBR3","RAIZ4","UGPA3"],
  bancos:  ["ITUB4","ITUB3","BBDC4","BBDC3","BBAS3","SANB11","SANB4","SANB3","BPAN4","ABCB4","BMGB4","BRSR6","BRSR3","PINE4","MODL11","MODL3","MODL4","BPAC11"],
  varejo:  ["MGLU3","VIIA3","LREN3","AMER3","ARZZ3","SOMA3","PETZ3","GUAR3","CEAB3","CRFB3","PCAR3","SBFG3","DMVF3","CASH3","NTCO3","GMAT3","LJQQ3","DTCY3"]
};

/************ AÇÕES TOP (por volume) ************/
async function fetchAcoesTop(){
  const url = `https://brapi.dev/api/quote/list?limit=${TOP_N*3}&sortBy=volume&sortOrder=desc&token=${TOKEN}`;
  const json = await getJSON(url);
  const arr = json.stocks || json.results || [];
  const norm = arr.map(it => ({
    symbol: it.symbol || it.stock || it.code || it.ticker,
    price: pickNum(it.regularMarketPrice, it.close, it.price, it.lastPrice),
    changePct: pickNum(it.regularMarketChangePercent, it.change_percent, it.change, it.pctChange),
    volume: pickNum(it.regularMarketVolume, it.volume, it.totalVolume)
  })).filter(x => x.symbol && x.price !== null && x.changePct !== null);
  norm.sort((a,b)=>(b.volume||0)-(a.volume||0));
  return norm.slice(0, TOP_N);
}

/************ POR LISTA + TOP (por volume) ************/
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
    symbol: it.symbol || it.stock || it.code,
    price: pickNum(it.regularMarketPrice, it.price, it.close, it.lastPrice),
    changePct: pickNum(it.regularMarketChangePercent, it.change_percent, it.change, it.pctChange),
    volume: pickNum(it.regularMarketVolume, it.volume, it.totalVolume)
  })).filter(x => x.symbol && x.price !== null && x.changePct !== null);
  mapped.sort((a,b)=>(b.volume||0)-(a.volume||0));
  return mapped.slice(0, TOP_N);
}

/************ DISPATCH ************/
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

/************ BUILD BOLHAS ************/
function createBubbles(data){
  bubbles = data.map(d => {
    const r = radiusFor(d.changePct, d.volume);
    return {
      symbol: d.symbol,
      price: d.price,
      change: d.changePct,
      color: colorForChange(d.changePct),
      r,
      x: rand(r+WALL_MARGIN, canvas.width-r-WALL_MARGIN),
      y: rand(Math.max(HEADER_SAFE+r, r+WALL_MARGIN), canvas.height-r-WALL_MARGIN),
      vx: rand(-START_VEL, START_VEL),
      vy: rand(-START_VEL, START_VEL)
    };
  });
  // afastamento inicial mais forte
  for (let k=0;k<4;k++) resolveCollisions(true);
}

/************ FÍSICA ************/
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
          const push = REPULSE*0.5;
          a.vx -= nx*push; a.vy -= ny*push;
          b.vx += nx*push; b.vy += ny*push;
        }
      }
    }
  }
}
function wallConstraints(p){
  const L=p.r+WALL_MARGIN, R=canvas.width-p.r-WALL_MARGIN;
  const T=Math.max(HEADER_SAFE+p.r,p.r+WALL_MARGIN), B=canvas.height-p.r-WALL_MARGIN;
  if(p.x<L){p.x=L;p.vx=Math.abs(p.vx);} if(p.x>R){p.x=R;p.vx=-Math.abs(p.vx);}
  if(p.y<T){p.y=T;p.vy=Math.abs(p.vy);} if(p.y>B){p.y=B;p.vy=-Math.abs(p.vy);}
}

/************ DESENHO ************/
function drawBubble(b){
  ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
  ctx.fillStyle=b.color; ctx.fill();

  // brilho nas bordas (sem luz no centro)
  const ring=ctx.createRadialGradient(b.x,b.y,b.r*0.72,b.x,b.y,b.r);
  ring.addColorStop(0,"rgba(255,255,255,0)");
  ring.addColorStop(1,"rgba(255,255,255,0.85)");
  ctx.fillStyle=ring; ctx.fill();

  ctx.lineWidth=BORDER_WIDTH; ctx.strokeStyle="#fff"; ctx.stroke();

  // texto
  ctx.fillStyle="#fff"; ctx.textAlign="center"; ctx.textBaseline="middle";
  const f1=Math.max(11,Math.floor(b.r*0.42));
  const f2=Math.max(10,Math.floor(b.r*0.34));
  const f3=Math.max(9, Math.floor(b.r*0.30));
  ctx.font=`700 ${f1}px system-ui,Arial`; ctx.fillText(b.symbol,b.x,b.y-f1*0.45);
  ctx.font=`500 ${f2}px system-ui,Arial`; ctx.fillText(`${formatBRL(b.price)}`,b.x,b.y+2);
  ctx.font=`600 ${f3}px system-ui,Arial`;
  const sign=b.change>=0?"+":""; ctx.fillText(`${sign}${b.change.toFixed(2)}%`,b.x,b.y+f2*0.9);
}
function draw(){ ctx.clearRect(0,0,canvas.width,canvas.height); for(const b of bubbles) drawBubble(b); }

/************ LOOP (delta-time) ************/
function step(now = performance.now()){
  let dt = now - lastTime;
  lastTime = now;
  dt = Math.min(32, Math.max(8, dt)); // 8–32ms
  const s = dt / 16;

  for(const p of bubbles){
    // puxa levemente para o centro (evita correr para as bordas)
    const cx = (canvas.width  * 0.5 - p.x) * CENTER_PULL;
    const cy = (canvas.height * 0.55 - p.y) * CENTER_PULL;
    p.vx += cx * s; p.vy += cy * s;

    // suaviza e limita
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