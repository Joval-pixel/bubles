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

/************ MAPA DE FONTES (ENDPOINTS CORRETOS) ************/
const SOURCES = {
  acoes: {
    url: () => `https://brapi.dev/api/quote/list?token=${TOKEN}&limit=${MAX_BUBBLES}`,
    pickArray: j => j.stocks || j.results || [],
    norm: it => ({
      symbol: it.symbol || it.stock || it.code || it.ticker,
      price: pickNum(it.regularMarketPrice, it.close, it.price, it.lastPrice),
      changePct: pickNum(it.regularMarketChangePercent, it.change_percent, it.change, it.pctChange),
      volume: pickNum(it.regularMarketVolume, it.volume, it.totalVolume)
    })
  },
  criptos: {
    // ✅ endpoint correto para cripto
    url: () => `https://brapi.dev/api/quote/crypto?token=${TOKEN}&limit=${MAX_BUBBLES}`,
    pickArray: j => j.coins || j.results || [],
    norm: it => ({
      symbol: (it.symbol || it.coin || it.name || "").toUpperCase(),
      price: pickNum(it.regularMarketPrice, it.price, it.lastPrice),
      changePct: pickNum(it.regularMarketChangePercent, it.change24h, it.change, it.pctChange),
      volume: pickNum(it.volume24h, it.totalVolume, it.volume)
    })
  },
  commodities: {
    // ✅ endpoint correto para commodities
    url: () => `https://brapi.dev/api/quote/commodities?token=${TOKEN}`,
    pickArray: j => j.results || j.stocks || j.data || [],
    norm: it => ({
      symbol: it.symbol || it.code,
      price: pickNum(it.regularMarketPrice, it.price, it.last, it.close),
      changePct: pickNum(it.regularMarketChangePercent, it.change_percent, it.change, it.pctChange),
      volume: pickNum(it.regularMarketVolume, it.volume)
    })
  },
  opcoes: {
    // ✅ opções listadas (se o provedor retornar)
    url: () => `https://brapi.dev/api/quote/options?token=${TOKEN}&limit=${MAX_BUBBLES}`,
    pickArray: j => j.results || j.options || j.stocks || [],
    norm: it => ({
      symbol: it.symbol || it.ticker || it.code,
      price: pickNum(it.regularMarketPrice, it.price, it.lastPrice),
      changePct: pickNum(it.regularMarketChangePercent, it.change_percent, it.change, it.pctChange),
      volume: pickNum(it.regularMarketVolume, it.volume, it.totalVolume)
    })
  },
  frequencia: {
    // ✅ “frequência de mercado” = mais negociados (por volume)
    url: () => `https://brapi.dev/api/quote/list?token=${TOKEN}&limit=${MAX_BUBBLES}&sortBy=volume&sortOrder=desc`,
    pickArray: j => j.stocks || [],
    norm: it => ({
      symbol: it.symbol || it.stock,
      price: pickNum(it.regularMarketPrice, it.close, it.price),
      changePct: pickNum(it.regularMarketChangePercent, it.change),
      volume: pickNum(it.regularMarketVolume, it.volume)
    })
  }
};

/************ BUSCA E NORMALIZAÇÃO ************/
async function fetchData(){
  const src = SOURCES[category] || SOURCES.acoes;
  let data = [];
  try{
    const res = await fetch(src.url());
    const json = await res.json();
    const arr = src.pickArray(json) || [];
    data = arr.map(src.norm)
      .filter(x => x && x.symbol && x.price !== null && x.changePct !== null);
  }catch(e){
    console.error("Erro buscando", category, e);
  }
  return data.slice(0, MAX_BUBBLES);
}

/************ CONSTRUÇÃO DAS BOLHAS ************/
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
      vx: rand(-0.45, 0.45),
      vy: rand(-0.45, 0.45)
    };
  });
  for (let k=0;k<3;k++) resolveCollisions(true); // afastamento inicial
}

/************ FÍSICA: COLISÃO E PAREDES ************/
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

/************ DESENHO (3D, contorno e texto) ************/
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
  ctx.font=`500 ${f2}px system-ui,Arial`; ctx.fillText(`R$ ${b.price.toFixed(2).replace('.',',')}`,b.x,b.y+2);
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

/************ PÚBLICO (botões) ************/
async function setCategory(cat){
  category = cat;
  const data = await fetchData();
  createBubbles(data);
}

/************ START ************/
setCategory("acoes");
step();

// Atualiza periodicamente a categoria visível
setInterval(()=>setCategory(category), 30000);
