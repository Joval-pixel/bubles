/******** BUBLES – SAFE START (mock imediato + swap ao vivo) ********/
console.log("Bubles SafeStart v2025-08-14c");

const TOKEN = "5bTDfSmR2ieax6y7JUqDAD";
const IS_MOBILE = matchMedia("(max-width: 820px)").matches || (navigator.maxTouchPoints||0)>0;
const TOP_N = IS_MOBILE ? 35 : 200;

/* --------- Mini HUD de debug (aparece no canto) ---------- */
function hud(msg){
  let el = document.getElementById("hud");
  if(!el){
    el = document.createElement("div");
    el.id = "hud";
    Object.assign(el.style,{
      position:"fixed",left:"10px",bottom:"10px",color:"#ddd",background:"rgba(0,0,0,.35)",
      padding:"6px 10px",borderRadius:"8px",font:"12px/1.2 system-ui,Arial",zIndex:99999
    });
    document.body.appendChild(el);
  }
  el.textContent = msg;
}

/* ---------- Canvas (cria se não existir) ---------- */
let canvas = document.getElementById("bubbleCanvas");
if(!canvas){
  canvas = document.createElement("canvas");
  canvas.id = "bubbleCanvas";
  document.body.appendChild(canvas);
}
const ctx = canvas.getContext("2d");

function resize(){
  const dpr = Math.max(1, devicePixelRatio||1);
  const w = innerWidth, h = innerHeight;
  canvas.style.width = w+"px"; canvas.style.height = h+"px";
  canvas.width = Math.floor(w*dpr); canvas.height = Math.floor(h*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
addEventListener("resize", resize);
addEventListener("orientationchange", ()=>setTimeout(resize,200));
resize();

/* --------- Física/estilo compactos --------- */
const BORDER = 2.5, WALL = IS_MOBILE?18:10, HH = 84;
const MAXR = IS_MOBILE?46:80;
const FRICTION = IS_MOBILE?0.998:0.985, MAXV = IS_MOBILE?0.12:0.9, V0 = IS_MOBILE?0.05:0.45;

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rand=(a,b)=>Math.random()*(b-a)+a;
const BRL=v=>`R$ ${Number(v).toFixed(2).replace('.',',')}`;
const color=ch=>ch>0?"#0a8f1f":ch<0?"#b31212":"#4a4a4a";

function radius(changePct, volume){
  const v=Math.max(1,Number(volume)||1);
  const volScale=Math.log10(v+10)*3;
  const varScale=Math.min(8,Math.abs(Number(changePct)||0));
  let r=16+varScale*3+volScale;
  const bigCats=["minerio","petroleo","bancos","varejo"];
  if (IS_MOBILE && bigCats.includes(category)) r*=3;
  return clamp(r, 18, (IS_MOBILE && bigCats.includes(category))? MAXR*3 : MAXR);
}

/* --------- Estado --------- */
let category="acoes";
let bubbles=[], last=performance.now(), alive=true;

/* --------- Mock instantâneo --------- */
const ACES = [
  "VALE3","PETR4","ITUB4","BBDC4","BBAS3","WEGE3","PRIO3","RENT3","EQTL3","SUZB3",
  "CSNA3","GGBR4","GOAU4","USIM5","VBBR3","UGPA3","CMIN3","RRRP3","LREN3","B3SA3",
  "BRFS3","EMBR3","BRAP4","NTCO3","CASH3","GMAT3","BRKM5","CRFB3","ASAI3","PCAR3",
  "ITSA4","BBSE3","SANB11","BPAC11","HAPV3","KLBN11","MULT3","CYRE3","EZTC3","MRVE3"
];
const LISTS = {
  minerio:["VALE3","CMIN3","CSNA3","GGBR4","GOAU4","BRAP4","USIM5","FESA4","CBAV3","PMAM3","PATI4","EALT4","AURA33"],
  petroleo:["PETR4","PETR3","PRIO3","RRRP3","RECV3","ENAT3","CSAN3","VBBR3","RAIZ4","UGPA3"],
  bancos:["ITUB4","ITUB3","BBDC4","BBDC3","BBAS3","SANB11","SANB4","SANB3","BPAN4","ABCB4","BMGB4","BRSR6","BRSR3","PINE4","BPAC11"],
  varejo:["MGLU3","VIIA3","LREN3","AMER3","ARZZ3","SOMA3","PETZ3","GUAR3","CEAB3","CRFB3","PCAR3","SBFG3","DMVF3","CASH3","NTCO3","GMAT3"]
};
function mockFrom(list, n){
  return (list.slice(0,n)).map((s,i)=>({
    symbol:s, price: 10 + (i%20)*2 + Math.random()*5,
    change: (Math.random()*6 - 3), volume: 1e6 + Math.random()*5e6
  }));
}

/* --------- Bubbles helpers --------- */
function createBubbles(arr){
  const w=canvas.clientWidth||innerWidth, h=canvas.clientHeight||innerHeight;
  const L=WALL+8, T=HH+WALL+8, R=w-WALL-8, B=h-WALL-8;
  bubbles = arr.map(d=>({
    symbol:d.symbol, price:d.price, change:d.change, color:color(d.change),
    r: radius(d.change, d.volume),
    x: rand(L+50,R-50), y: rand(T+20,B-50),
    vx: rand(-V0,V0), vy: rand(-V0,V0)
  }));
}
function drawBubble(b){
  const g = ctx.createRadialGradient(b.x,b.y,b.r*0.75,b.x,b.y,b.r);
  g.addColorStop(0,"rgba(255,255,255,0)"); g.addColorStop(1,"rgba(255,255,255,.85)");
  ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
  ctx.fillStyle=b.color; ctx.fill(); ctx.fillStyle=g; ctx.fill();
  ctx.lineWidth=BORDER; ctx.strokeStyle="#fff"; ctx.stroke();
  ctx.fillStyle="#fff"; ctx.textAlign="center"; ctx.textBaseline="middle";
  const f1=Math.max(11,Math.floor(b.r*0.4)), f2=Math.max(10,Math.floor(b.r*0.3)), f3=Math.max(9,Math.floor(b.r*0.25));
  ctx.font=`700 ${f1}px Arial`; ctx.fillText(b.symbol, b.x, b.y-b.r*0.3);
  ctx.font=`500 ${f2}px Arial`; ctx.fillText(BRL(b.price), b.x, b.y);
  ctx.font=`600 ${f3}px Arial`; const s=b.change>=0?"+":""; ctx.fillText(`${s}${b.change.toFixed(2)}%`, b.x, b.y+b.r*0.3);
}
function physicsStep(dt){
  const s=dt/16, w=canvas.clientWidth||innerWidth, h=canvas.clientHeight||innerHeight;
  const L=WALL, R=w-WALL, T=HH+WALL, B=h-WALL;
  for(const p of bubbles){
    p.vx*=Math.pow(FRICTION,s); p.vy*=Math.pow(FRICTION,s);
    p.vx=clamp(p.vx,-MAXV,MAXV); p.vy=clamp(p.vy,-MAXV,MAXV);
    p.x+=p.vx*s; p.y+=p.vy*s;
    if(p.x<p.r+L){p.x=p.r+L;p.vx=Math.abs(p.vx);} if(p.x>R-p.r){p.x=R-p.r;p.vx=-Math.abs(p.vx);}
    if(p.y<p.r+T){p.y=p.r+T;p.vy=Math.abs(p.vy);} if(p.y>B-p.r){p.y=B-p.r;p.vy=-Math.abs(p.vy);}
  }
}
function render(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(const b of bubbles) drawBubble(b);
}
function loop(t=performance.now()){
  if(!alive) return;
  const dt = Math.min(32, Math.max(8, t-last)); last=t;
  physicsStep(dt); render(); requestAnimationFrame(loop);
}

/* --------- Fetch com timeout + fallback --------- */
function mapQuote(it){
  const symbol=(it.symbol||it.stock||it.code||it.ticker||"").toUpperCase();
  const price = Number(it.regularMarketPrice ?? it.price ?? it.close ?? it.lastPrice);
  let change = Number(it.regularMarketChangePercent ?? it.change_percent ?? it.change ?? it.pctChange);
  if(!Number.isFinite(change)){
    const prev=Number(it.regularMarketPreviousClose ?? it.previousClose ?? it.prevClose);
    if(Number.isFinite(price)&&Number.isFinite(prev)&&prev!==0) change=((price/prev)-1)*100;
  }
  const volume = Number(it.regularMarketVolume ?? it.volume ?? it.totalVolume);
  return { symbol, price, change, volume };
}
const valid=q=>q&&q.symbol&&Number.isFinite(q.price)&&Number.isFinite(q.change);

async function getJSON(url, timeout=10000){
  const ctl=new AbortController(); const to=setTimeout(()=>ctl.abort("timeout"),timeout);
  try{
    const res = await fetch(url,{signal:ctl.signal,cache:"no-store"});
    if(!res.ok) throw new Error(res.status+" "+url);
    return await res.json();
  } finally { clearTimeout(to); }
}
async function fetchByTickers(tks){
  try{
    const chunk=40, batches=[];
    for(let i=0;i<tks.length;i+=chunk){
      const slice=tks.slice(i,i+chunk).join(",");
      batches.push(getJSON(`https://brapi.dev/api/quote/${slice}?range=1d&interval=1d&token=${TOKEN}`));
    }
    const results=(await Promise.allSettled(batches)).flatMap(r=>r.status==="fulfilled"?(r.value.results||r.value.stocks||[]):[]);
    const arr=results.map(mapQuote).filter(valid);
    arr.sort((a,b)=>(b.volume||0)-(a.volume||0));
    if(!arr.length) throw new Error("empty");
    return arr;
  }catch(e){
    hud("Brapi falhou — usando mock");
    return mockFrom(tks, tks.length);
  }
}
async function fetchList(limit){
  try{
    const j = await getJSON(`https://brapi.dev/api/quote/list?limit=${limit}&sortBy=volume&sortOrder=desc&token=${TOKEN}`);
    const tks=(j.stocks||j.results||[]).map(x=>(x.stock||x.symbol||x.ticker||"").toUpperCase()).filter(Boolean);
    if(!tks.length) throw new Error("no list");
    return fetchByTickers(tks.slice(0,limit));
  }catch(e){
    hud("List falhou — mock universo");
    return fetchByTickers(ACES.slice(0,limit));
  }
}
async function fetchData(){
  if(category==="acoes") return (await fetchList(TOP_N));
  if(category==="minerio") return (await fetchByTickers(LISTS.minerio)).slice(0, Math.min(20, LISTS.minerio.length));
  if(category==="petroleo") return (await fetchByTickers(LISTS.petroleo)).slice(0,TOP_N);
  if(category==="bancos")   return (await fetchByTickers(LISTS.bancos)).slice(0,TOP_N);
  if(category==="varejo")   return (await fetchByTickers(LISTS.varejo)).slice(0,TOP_N);
  return fetchList(TOP_N);
}

/* --------- SafeStart: mostra mock já e troca quando vier o real --------- */
function startCategory(cat){
  category = cat;

  // 1) Mock imediato (visual instantâneo)
  const seed = category==="acoes" ? ACES : (LISTS[category] || ACES);
  const mock = mockFrom(seed, category==="minerio" ? Math.min(20,seed.length) : Math.min(TOP_N,seed.length));
  createBubbles(mock);
  hud(`Mock inicial • ${category.toUpperCase()} (${mock.length})`);
  if(!alive){ alive=true; requestAnimationFrame(loop); }

  // 2) Busca real em paralelo e faz swap
  (async ()=>{
    try{
      const data = await fetchData();
      if (!data || !data.length) throw new Error("sem dados");
      const mapped = data.map(d=>({symbol:d.symbol, price:d.price, change:d.changePct??d.change, volume:d.volume}));
      createBubbles(mapped);
      hud(`Ao vivo • ${category.toUpperCase()} (${mapped.length})`);
    }catch(e){
      console.warn("Live falhou:", e?.message||e);
      // mock já está na tela; apenas mantém HUD
      hud(`Offline (mock) • ${category.toUpperCase()}`);
    }
  })();
}

/* --------- Botões (se existirem) --------- */
document.querySelectorAll(".buttons button").forEach(b=>{
  b.addEventListener("click", ()=>startCategory(b.dataset.cat));
});

/* --------- Start geral --------- */
startCategory("acoes");

/* Atualizações periódicas (tenta real; se falhar, mantém atuais) */
setInterval(async ()=>{
  try{
    const data = await fetchData();
    const by = new Map(data.map(d=>[d.symbol,d]));
    for(const p of bubbles){
      const d = by.get(p.symbol); if(!d) continue;
      p.price = Number(d.price); p.change = Number(d.changePct??d.change);
      p.color = color(p.change); p.r = radius(p.change, d.volume);
    }
    hud(`Atualizado • ${new Date().toLocaleTimeString()}`);
  }catch(e){
    console.warn("Update falhou:", e?.message||e);
    hud("Atualização falhou (mantendo tela)");
  }
}, 30000);