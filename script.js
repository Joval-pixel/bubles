/************ CONFIG VISUAL + FÍSICA ************/
const TOKEN = "5bTDfSmR2ieax6y7JUqDAD";
const MAX_BUBBLES = 120;
const HEADER_SAFE = 84;
const WALL_MARGIN = 10;
const FRICTION = 0.985;
const MAX_SPEED = 0.9;
const REPULSE = 0.4;
const BORDER_WIDTH = 2.5;

/************ CANVAS ************/
const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
addEventListener("resize", resize); resize();

/************ STATE ************/
let category = "acoes";
let bubbles = [];

/************ UTILS ************/
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const rand = (a,b)=>Math.random()*(b-a)+a;
const colorForChange = ch => ch>0 ? "#0a8f1f" : ch<0 ? "#b31212" : "#4a4a4a";
const pickNum = (...xs)=> { for (const x of xs){ const n=Number(x); if(Number.isFinite(n)) return n; } return null; };
const radiusFor = (chg, vol) => {
  const v = Math.max(1, Number(vol)||1);
  const volScale = Math.log10(v+10)*3;
  const varScale = Math.min(8, Math.abs(Number(chg)||0));
  const base = 22;
  return clamp(base + varScale*3 + volScale, 24, 90);
};
async function getJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}
function currencySymbol(code){
  switch((code||"").toUpperCase()){
    case "BRL": return "R$";
    case "USD": return "US$";
    case "EUR": return "€";
    case "GBP": return "£";
    default: return ""; // se não vier, não mostra prefixo
  }
}
function formatPrice(value, curr){
  const sym = currencySymbol(curr);
  const v = Number(value);
  if (!Number.isFinite(v)) return "";
  // 2 casas p/ a maioria; ouro/commodities ok com 2
  return `${sym} ${v.toFixed(2).replace(".", ",")}`;
}

/************ AÇÕES / FREQUÊNCIA ************/
async function fetchAcoes(params=""){
  const url = `https://brapi.dev/api/quote/list?limit=${MAX_BUBBLES}${params}&token=${TOKEN}`;
  const json = await getJSON(url);
  const arr = json.stocks || json.results || [];
  return arr.map(it => ({
    symbol: it.symbol || it.stock || it.code || it.ticker,
    price: pickNum(it.regularMarketPrice, it.close, it.price, it.lastPrice),
    changePct: pickNum(it.regularMarketChangePercent, it.change_percent, it.change, it.pctChange),
    volume: pickNum(it.regularMarketVolume, it.volume, it.totalVolume),
    currency: (it.currency || "BRL")
  })).filter(x => x.symbol && x.price !== null && x.changePct !== null);
}

/************ CRIPTOS (v2 em BRL) ************/
const POPULAR_COINS = [
  "BTC","ETH","USDT","BNB","SOL","XRP","ADA","DOGE","TRX","TON","DOT","LTC",
  "AVAX","LINK","MATIC","XLM","ATOM","BCH","ETC","HBAR","NEAR","APT","ARB",
  "OP","SUI","ICP","FIL","AAVE","ALGO"
];
async function fetchCriptos(){
  let coins = [];
  try{
    const avail = await getJSON(`https://brapi.dev/api/v2/crypto/available?token=${TOKEN}`);
    const listed = (avail.coins || []).map(c => String(c).toUpperCase());
    const set = new Set();
    for (const c of POPULAR_COINS) if (listed.includes(c)) set.add(c);
    for (const c of listed) if (set.size < MAX_BUBBLES) set.add(c);
    coins = Array.from(set).slice(0, 80);
  }catch{
    coins = POPULAR_COINS.slice(0, 40);
  }
  if (!coins.length) return [];
  const url = `https://brapi.dev/api/v2/crypto?coin=${coins.join(",")}&currency=BRL&token=${TOKEN}`;
  const json = await getJSON(url);
  const arr = json.coins || [];
  return arr.map(it => ({
    symbol: (it.coin || it.symbol || "").toUpperCase(),
    price: pickNum(it.regularMarketPrice, it.price, it.lastPrice),
    changePct: pickNum(it.regularMarketChangePercent, it.regularMarketChangePercent24h, it.change24h, it.change),
    volume: pickNum(it.regularMarketVolume, it.volume24h, it.volume),
    currency: it.currency || "BRL"
  })).filter(x => x.symbol && x.price !== null && x.changePct !== null);
}

/************ COMMODITIES (cotação com moeda correta) ************/
/* Usamos futuros do Yahoo via /quote/<tickers> — em USD na maioria */
const COMMO_TICKERS = [
  "CL=F","NG=F",           // Petróleo WTI, Gás Natural
  "GC=F","SI=F","HG=F",    // Ouro, Prata, Cobre
  "ZC=F","ZS=F","ZW=F",    // Milho, Soja, Trigo
  "KC=F","SB=F","CC=F",    // Café, Açúcar, Cacau
  "LCO=F"                  // Brent (ICE)
];
async function fetchCommodities(){
  try{
    const url = `https://brapi.dev/api/quote/${COMMO_TICKERS.join(",")}?token=${TOKEN}`;
    const json = await getJSON(url);
    const arr = json.results || json.stocks || json || [];
    const norm = arr.map(it => ({
      symbol: it.symbol || it.code,
      price: pickNum(it.regularMarketPrice, it.price, it.last, it.close),
      changePct: pickNum(it.regularMarketChangePercent, it.change_percent, it.change, it.pctChange),
      volume: pickNum(it.regularMarketVolume, it.volume),
      currency: it.currency || "USD"  // <- moeda vinda da API, padrão USD
    })).filter(x => x.symbol && x.price !== null && x.changePct !== null);
    if (norm.length) return norm.slice(0, MAX_BUBBLES);
  }catch(e){
    console.warn("commodities fallback:", e.message);
  }
  // fallback: setores relacionados (em BRL)
  const sectors = encodeURIComponent("Energy Minerals,Non-Energy Minerals,Process Industries");
  const data = await fetchAcoes(`&sector=${sectors}&sortBy=volume&sortOrder=desc`);
  return data.slice(0, MAX_BUBBLES);
}

/************ OPÇÕES (fallback) ************/
async function fetchOpcoes(){
  try{
    const json = await getJSON(`https://brapi.dev/api/quote/options?token=${TOKEN}&limit=${MAX_BUBBLES}`);
    const arr = json.results || json.options || [];
    const norm = arr.map(it => ({
      symbol: it.symbol || it.ticker || it.code,
      price: pickNum(it.regularMarketPrice, it.price, it.lastPrice),
      changePct: pickNum(it.regularMarketChangePercent, it.change_percent, it.change, it.pctChange),
      volume: pickNum(it.regularMarketVolume, it.volume, it.totalVolume),
      currency: it.currency || "BRL"
    })).filter(x => x.symbol && x.price !== null && x.changePct !== null);
    if (norm.length) return norm.slice(0, MAX_BUBBLES);
  }catch(e){
    console.warn("opcoes fallback:", e.message);
  }
  // fallback: maiores oscilações
  const data = await fetchAcoes(`&sortBy=change_abs&sortOrder=desc`);
  return data.slice(0, MAX_BUBBLES);
}

/************ DISPATCH ************/
async function fetchData(){
  switch (category){
    case "acoes":        return fetchAcoes();
    case "criptos":      return fetchCriptos();       // BRL
    case "commodities":  return fetchCommodities();   // USD (mostra US$)
    case "opcoes":       return fetchOpcoes();
    case "frequencia":   return fetchAcoes(`&sortBy=volume&sortOrder=desc`);
    default:             return fetchAcoes();
  }
}

/************ BUILD BUBBLES ************/
function createBubbles(data){
  bubbles = data.slice(0, MAX_BUBBLES).map(d => {
    const r = radiusFor(d.changePct, d.volume);
    return {
      symbol: d.symbol,
      price: d.price,
      change: d.changePct,
      currency: d.currency || (category==="criptos"?"BRL":"USD"),
      color: colorForChange(d.changePct),
      r,
      x: rand(r+WALL_MARGIN, canvas.width-r-WALL_MARGIN),
      y: rand(Math.max(HEADER_SAFE+r, r+WALL_MARGIN), canvas.height-r-WALL_MARGIN),
      vx: rand(-0.45, 0.45),
      vy: rand(-0.45, 0.45)
    };
  });
  for (let k=0;k<3;k++) resolveCollisions(true);
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
  // base
  ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
  ctx.fillStyle=b.color; ctx.fill();

  // brilho de borda (sem luz no centro)
  const ring=ctx.createRadialGradient(b.x,b.y,b.r*0.72,b.x,b.y,b.r);
  ring.addColorStop(0,"rgba(255,255,255,0)");
  ring.addColorStop(1,"rgba(255,255,255,0.85)");
  ctx.fillStyle=ring; ctx.fill();

  // contorno
  ctx.lineWidth=BORDER_WIDTH; ctx.strokeStyle="#fff"; ctx.stroke();

  // texto
  ctx.fillStyle="#fff"; ctx.textAlign="center"; ctx.textBaseline="middle";
  const f1=Math.max(11,Math.floor(b.r*0.42));
  const f2=Math.max(10,Math.floor(b.r*0.34));
  const f3=Math.max(9, Math.floor(b.r*0.30));
  ctx.font=`700 ${f1}px system-ui,Arial`; ctx.fillText(b.symbol,b.x,b.y-f1*0.45);
  ctx.font=`500 ${f2}px system-ui,Arial`; ctx.fillText(`${formatPrice(b.price, b.currency)}`,b.x,b.y+2);
  ctx.font=`600 ${f3}px system-ui,Arial`;
  const sign=b.change>=0?"+":""; ctx.fillText(`${sign}${b.change.toFixed(2)}%`,b.x,b.y+f2*0.9);
}
function draw(){ ctx.clearRect(0,0,canvas.width,canvas.height); for(const b of bubbles) drawBubble(b); }

/************ LOOP ************/
function step(){
  for(const p of bubbles){
    p.vx = clamp(p.vx*FRICTION, -MAX_SPEED, MAX_SPEED);
    p.vy = clamp(p.vy*FRICTION, -MAX_SPEED, MAX_SPEED);
    p.x += p.vx; p.y += p.vy;
    wallConstraints(p);
  }
  resolveCollisions();
  draw();
  requestAnimationFrame(step);
}

/************ BOTÕES ************/
async function setCategory(cat){
  category = cat;
  try{
    const data = await fetchData();
    createBubbles(data);
  }catch(e){
    console.error("Erro ao carregar", cat, e);
    bubbles = []; draw();
  }
}

/************ START ************/
setCategory("acoes");
step();
setInterval(()=>setCategory(category), 30000);
