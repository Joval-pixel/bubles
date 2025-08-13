/******************* BUBLES — script.js (BRAPI fix, 10s refresh, mobile tuned) *******************
 * Botões: Ações, Minério, Petróleo, Bancos, Varejo
 * Fonte: BRAPI /quote/{TICKERS}  (evita /quote/list)
 * Ações: TOP 100 (desktop) / TOP 30 (mobile)
 * Minério / Petróleo / Bancos / Varejo: mesmas listas filtradas
 * Bolhas maiores nesses filtros (no MOBILE), menores em Ações
 * Movimento livre, anti-aglomeração, sem “ímã” no centro
 *************************************************************************************************/

console.log("Bubles JS v2025-08-13 prod-10s");

// ===== CONFIG =====
const TOKEN = "5bTDfSmR2ieax6y7JUqDAD";
const IS_MOBILE  = matchMedia("(max-width: 820px)").matches || (navigator.maxTouchPoints || 0) > 0;
const TOP_N      = IS_MOBILE ? 30 : 100;   // Ações
const REFRESH_MS = 10_000;                 // 10 segundos

// ===== FÍSICA / MOVIMENTO =====
const HEADER_SAFE      = 84;
const WALL_MARGIN      = IS_MOBILE ? 18 : 10;
const FRICTION         = IS_MOBILE ? 0.998 : 0.985;
const MAX_SPEED        = IS_MOBILE ? 0.11  : 0.90;
const START_VEL        = IS_MOBILE ? 0.045 : 0.45;
const REPULSE_COLLIDE  = IS_MOBILE ? 0.55  : 0.40;
const BORDER_WIDTH     = 2.5;
const COLLISION_PASSES = IS_MOBILE ? 5 : 1;

const MAX_RADIUS_BASE  = IS_MOBILE ? 44 : 80;         // Ações
const SOFT_REPULSE_STRENGTH = IS_MOBILE ? 0.005 : 0.0035;
const NEIGHBOR_RANGE_MULT   = 1.7;

// “vazio” central (anti-aglomeração)
const CENTER_HOLE_RADIUS_FACTOR = IS_MOBILE ? 0.34 : 0.30;
const CENTER_HOLE_STRENGTH      = IS_MOBILE ? 0.014 : 0.010;
const ORBIT_STRENGTH            = IS_MOBILE ? 0.009 : 0.006;

const DRIFT_BASE  = IS_MOBILE ? 0.004 : 0.003;
const DRIFT_FREQ  = 0.0018;
const WOBBLE_STRENGTH = 0.010;
const WOBBLE_FREQ = 0.0025;

// ===== CANVAS =====
const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener("resize", resize); resize();

// ===== STATUS (discreto) =====
function status(msg, ms=2500){
  let el = document.getElementById("statusBox");
  if(!el){
    el = document.createElement("div");
    el.id = "statusBox";
    el.style.cssText = "position:fixed;left:12px;bottom:12px;padding:8px 10px;border-radius:8px;background:rgba(0,0,0,.55);color:#fff;font:500 12px/1.2 Arial;z-index:9999;pointer-events:none;opacity:0;transition:opacity .2s";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = "1";
  clearTimeout(el._t);
  el._t = setTimeout(()=>el.style.opacity="0", ms);
}

// ===== ESTADO =====
let category = "acoes";
let bubbles  = [];
let lastTime = performance.now();

// ===== UTILS =====
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const rand  = (a,b)=>Math.random()*(b-a)+a;
const colorForChange = ch => ch>0 ? "#0a8f1f" : ch<0 ? "#b31212" : "#4a4a4a";

function formatMoney(v, currency="BRL"){
  if (!Number.isFinite(Number(v))) return "";
  const pre = (currency||"BRL").toUpperCase()==="USD" ? "US$ " : "R$ ";
  return pre + Number(v).toFixed(2).replace(".", ",");
}

// raio: filtros setoriais ficam 3× no MOBILE
function radiusFor(changePct, volume){
  const v = Math.max(1, Number(volume)||1);
  const volScale = Math.log10(v+10)*3;
  const varScale = Math.min(8, Math.abs(Number(changePct)||0));
  const base = 14; // um pouco menor no mobile para ações
  let r = base + varScale*3 + volScale;

  const bigCats = ["minerio","petroleo","bancos","varejo"];
  const isBig = IS_MOBILE && bigCats.includes(category);
  const minR = isBig ? 22 : 16;
  const maxR = isBig ? MAX_RADIUS_BASE*3 : MAX_RADIUS_BASE;

  if (isBig) r *= 3;
  return clamp(r, minR, maxR);
}

// ===== LISTAS =====
const ACES_UNIVERSE = [
  "VALE3","PETR4","PETR3","ITUB4","BBDC4","BBAS3","ELET3","ELET6","ABEV3","WEGE3","PRIO3","RENT3","EQTL3",
  "SUZB3","JBSS3","CSNA3","GGBR4","GOAU4","USIM5","VBBR3","UGPA3","CMIN3","RRRP3","LREN3","B3SA3","BRFS3",
  "EMBR3","BRAP4","NTCO3","CASH3","GMAT3","BRKM5","CRFB3","ASAI3","PCAR3","ITSA4","BBSE3","BBDC3","SANB11",
  "BPAC11","ABCB4","BMGB4","BRSR6","RAIZ4","ENAT3","SBSP3","HAPV3","KLBN11","MULT3","CYRE3","EZTC3","MRVE3",
  "CMIG4","CPFE3","TRPL4","ALPA4","VIVT3","TIMS3","QUAL3","YDUQ3","COGN3","MRFG3","BRML3","AZUL4","GOLL4"
];

const LISTS = {
  minerio: ["VALE3","CMIN3","CSNA3","GGBR4","GGBR3","GOAU4","GOAU3","BRAP4","BRAP3","USIM5","USIM3","FESA4","FESA3","CBAV3","PMAM3","PATI4","PATI3","EALT4","EALT3","MGEL4","AURA33"],
  petroleo:["PETR3","PETR4","PRIO3","RRRP3","RECV3","ENAT3","CSAN3","VBBR3","RAIZ4","UGPA3"],
  bancos:  ["ITUB4","ITUB3","BBDC4","BBDC3","BBAS3","SANB11","SANB4","SANB3","BPAN4","ABCB4","BMGB4","BRSR6","BRSR3","PINE4","MODL11","MODL3","MODL4","BPAC11"],
  varejo:  ["MGLU3","VIIA3","LREN3","AMER3","ARZZ3","SOMA3","PETZ3","GUAR3","CEAB3","CRFB3","PCAR3","SBFG3","DMVF3","CASH3","NTCO3","GMAT3","LJQQ3","DTCY3"]
};

// ===== REDE (só /quote/{tickers}) =====
async function getJSON(url, ms=12000){
  const p = fetch(url).then(r=>{ if(!r.ok) throw new Error(`${r.status} ${url}`); return r.json(); });
  return Promise.race([p, new Promise((_,rej)=>setTimeout(()=>rej(new Error("timeout")), ms))]);
}

function mapQuote(it){
  const symbol = (it.symbol || it.stock || it.code || it.ticker || "").toUpperCase();
  const price  = Number(it.regularMarketPrice);
  let changePct = Number(it.regularMarketChangePercent);
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
const isValid = q => q && q.symbol && Number.isFinite(q.price) && Number.isFinite(q.changePct);

async function fetchByTickers(tickers){
  if (!tickers?.length) return [];
  tickers = [...new Set(tickers.map(s => s.toUpperCase()))];
  const chunk = 40, batches=[];
  for (let i=0;i<tickers.length;i+=chunk){
    const slice = tickers.slice(i,i+chunk);
    const url = `https://brapi.dev/api/quote/${slice.join(",")}?token=${TOKEN}`;
    batches.push(getJSON(url).catch(()=>null));
  }
  const settled = await Promise.all(batches);
  const raw = settled.flatMap(x => x ? (x.results || x.stocks || []) : []);
  const arr = raw.map(mapQuote).filter(isValid);
  arr.sort((a,b)=>(b.volume||0)-(a.volume||0));
  return arr;
}

// Ações: universo fixo (líquidos) ranqueado por volume real
async function fetchAcoesTop(){
  const data = await fetchByTickers(ACES_UNIVERSE);
  return data.slice(0, TOP_N);
}

// Minério: até 20 (apenas os que estiverem cotando)
async function fetchMinerio(){
  const data = await fetchByTickers(LISTS.minerio);
  return data.slice(0, Math.min(20, data.length));
}

async function fetchData(){
  status("Carregando cotações…", 2000);
  try{
    switch(category){
      case "acoes":    return await fetchAcoesTop();
      case "minerio":  return await fetchMinerio();
      case "petroleo": return (await fetchByTickers(LISTS.petroleo)).slice(0, TOP_N);
      case "bancos":   return (await fetchByTickers(LISTS.bancos)).slice(0, TOP_N);
      case "varejo":   return (await fetchByTickers(LISTS.varejo)).slice(0, TOP_N);
      default:         return await fetchAcoesTop();
    }
  }catch(e){
    console.error("fetchData:", e);
    status("Erro ao buscar cotações", 2500);
    return [];
  }
}

// ===== BOLHAS =====
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

// ===== DESENHO =====
function drawBubble(b){
  ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
  ctx.fillStyle=b.color; ctx.fill();

  // brilho nas bordas (3D sutil)
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

// ===== LOOP =====
function step(now=performance.now()){
  let dt = now - lastTime; lastTime = now;
  dt = Math.min(32, Math.max(8, dt));
  const s = dt/16;

  softSeparationForces();

  const cx = canvas.width*0.5, cy = canvas.height*0.52;
  const holeR = Math.min(canvas.width, canvas.height)*CENTER_HOLE_RADIUS_FACTOR;

  for(const p of bubbles){
    const t = now*WOBBLE_FREQ + p.phase;
    p.vx += Math.sin(t)*WOBBLE_STRENGTH*s;
    p.vy += Math.cos(t)*WOBBLE_STRENGTH*s;

    const w = now*DRIFT_FREQ + p.driftSeed;
    p.vx += Math.sin(w*0.9)*DRIFT_BASE*s;
    p.vy += Math.cos(w*1.1)*DRIFT_BASE*s;

    // empurra para fora do centro se entrar no “vazio”
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

    p.vx = clamp(p.vx*Math.pow(FRICTION,s), -MAX_SPEED, MAX_SPEED);
    p.vy = clamp(p.vy*Math.pow(FRICTION,s), -MAX_SPEED, MAX_SPEED);
    p.x  += p.vx*s; p.y  += p.vy*s;

    wallConstraints(p);
  }
  for(let k=0;k<COLLISION_PASSES;k++) resolveCollisions();
  draw();
  requestAnimationFrame(step);
}

// ===== BOTÕES =====
async function setCategory(cat){
  category = cat;
  document.querySelectorAll(".buttons button").forEach(b=>{
    b.classList.toggle("active", b.dataset.cat===cat);
  });
  const data = await fetchData();
  bubbles = [];
  if (data && data.length){
    createBubbles(data);
    status(`OK: ${data.length} papéis`);
  }else{
    status("Sem dados recebidos");
  }
}
document.querySelectorAll(".buttons button").forEach(b=>{
  b.addEventListener("click", ()=>setCategory(b.dataset.cat));
});

// (Opcional) clique na bolha → TradingView (se houver modal/iframe no HTML)
canvas.addEventListener("click", (e)=>{
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  for (const b of bubbles){
    if (Math.hypot(x-b.x, y-b.y) <= b.r){
      const modal = document.getElementById("chartModal");
      const iframe = document.getElementById("tradingview-frame");
      if (modal && iframe){
        iframe.src = `https://s.tradingview.com/widgetembed/?symbol=BMFBOVESPA:${encodeURIComponent(b.symbol)}&interval=1&theme=dark&style=1&locale=br`;
        modal.style.display = "block";
      }
      break;
    }
  }
});

// ===== START =====
setCategory("acoes");
requestAnimationFrame(step);
setInterval(()=>setCategory(category), REFRESH_MS);
