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
  const volScale = Math.log10(v+10)*3;      // comprime volumes grandes
  const varScale = Math.min(8, Math.abs(Number(chg)||0));
  const base = 22;
  return clamp(base + varScale*3 + volScale, 24, 90);
};
async function getJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}
function formatBRL(v){
  const n = Number(v);
  return Number.isFinite(n) ? `R$ ${n.toFixed(2).replace('.',',')}` : "";
}

/************ LISTAS POR CATEGORIA (tickers B3) ************/
/* usamos listas estáveis para garantir que sempre haja dados,
   e filtramos client-side quando possível (se a BRAPI retornar setor) */
const LISTS = {
  minerio: [
    "VALE3","CMIN3","USIM5","USIM3","CSNA3","GGBR4","GOAU4","BRAP4","BRAP3",
    "PMAM3","FESA4","FESA3"
  ],
  petroleo: [
    "PETR3","PETR4","PRIO3","RRRP3","RECV3","BRDT3","UGPA3","ENAT3","PETZ3" // PETZ só se quiser tirar, deixe
  ],
  bancos: [
    "ITUB4","ITUB3","BBDC4","BBDC3","BBAS3","SANB11","SANB4","SANB3",
    "BPAN4","ABCB4","BMGB4","BRSR6","BRSR3","AGRO3","PINE4","MODL11"
  ],
  varejo: [
    "MGLU3","VIIA3","LREN3","AMER3","ARZZ3","PETZ3","SOMA3","GUAR3",
    "CEAB3","CRFB3","PCAR3"
  ]
};

/************ AÇÕES (todas) ************/
async function fetchAcoesAll(){
  const url = `https://brapi.dev/api/quote/list?limit=${MAX_BUBBLES}&token=${TOKEN}`;
  const json = await getJSON(url);
  const arr = json.stocks || json.results || [];
  return arr.map(it => ({
    symbol: it.symbol || it.stock || it.code || it.ticker,
    price: pickNum(it.regularMarketPrice, it.close, it.price, it.lastPrice),
    changePct: pickNum(it.regularMarketChangePercent, it.change_percent, it.change, it.pctChange),
    volume: pickNum(it.regularMarketVolume, it.volume, it.totalVolume)
  })).filter(x => x.symbol && x.price !== null && x.changePct !== null);
}

/************ POR LISTA DE TICKERS ************/
async function fetchByTickers(tickers){
  if (!tickers.length) return [];
  const chunk = 40; // evitar URL muito longa
  const batches = [];
  for (let i=0;i<tickers.length;i+=chunk){
    const slice = tickers.slice(i,i+chunk);
    const url = `https://brapi.dev/api/quote/${slice.join(",")}?token=${TOKEN}`;
    batches.push(getJSON(url));
  }
  const results = (await Promise.allSettled(batches))
    .flatMap(r => r.status==="fulfilled" ? (r.value.results || r.value.stocks || []) : []);
  const map = results.map(it => ({
    symbol: it.symbol || it.stock || it.code,
    price: pickNum(it.regularMarketPrice, it.price, it.close, it.lastPrice),
    changePct: pickNum(it.regularMarketChangePercent, it.change_percent, it.change, it.pctChange),
    volume: pickNum(it.regularMarketVolume, it.volume, it.totalVolume)
  })).filter(x => x.symbol && x.price !== null && x.changePct !== null);
  return map.slice(0, MAX_BUBBLES);
}

/************ DISPATCH POR CATEGORIA ************/
async function fetchData(){
  switch (category){
    case "acoes":     return fetchAcoesAll();
    case "minerio":   return fetchByTickers(LISTS.minerio);
    case "petroleo":  return fetchByTickers(LISTS.petroleo);
    case "bancos":    return fetchByTickers(LISTS.bancos);
    case "varejo":    return fetchByTickers(LISTS.varejo);
    default:          return fetchAcoesAll();
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
      color: colorForChange(d.changePct),
      r,
      x: rand(r+WALL_MARGIN, canvas.width-r-WALL_MARGIN),
      y: rand(Math.max(HEADER_SAFE+r, r+WALL_MARGIN), canvas.height-r-WALL_MARGIN),
      vx: rand(-0.45, 0.45),
      vy: rand(-0.45, 0.45)
    };
  });
  for (let k=0;k<3;k++) resolveCollisions(true); // afastamento inicial
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

/************ DESENHO (3D nas bordas, contorno e texto) ************/
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
  ctx.font=`500 ${f2}px system-ui,Arial`; ctx.fillText(`${formatBRL(b.price)}`,b.x,b.y+2);
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
// liga cliques
document.querySelectorAll(".buttons button").forEach(b=>{
  b.addEventListener("click", ()=>setCategory(b.dataset.cat));
});

/************ START ************/
setCategory("acoes");
step();
// atualizar periodicamente a categoria visível
setInterval(()=>setCategory(category), 30000);
