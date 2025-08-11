// ====== CONFIG ======
const TOKEN = "5bTDfSmR2ieax6y7JUqDAD";
const MAX_BUBBLES = 120;
const HEADER_SAFE = 84;         // área segura abaixo do header
const WALL_MARGIN = 10;         // margem contra paredes
const FRICTION = 0.985;         // suaviza movimento
const MAX_SPEED = 0.9;          // velocidade máxima
const REPULSE = 0.4;            // força mínimo de repulsão em colisão
const BORDER_WIDTH = 2.5;       // borda branca

// ====== CANVAS ======
const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
addEventListener("resize", resize);
resize();

// ====== STATE ======
let category = "acoes";
let bubbles = [];

// ====== UTILS ======
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => Math.random() * (b - a) + a;

// cores vivas e escuras
function colorForChange(ch){
  if (ch > 0) return "#0a8f1f";     // verde escuro vivo
  if (ch < 0) return "#b31212";     // vermelho escuro vivo
  return "#4a4a4a";                 // cinza escuro
}

// raio proporcional à variação + volume
function radiusFor(change, volume){
  const vol = Math.max(1, Number(volume) || 1);
  const volScale = Math.log10(vol + 10) * 3;     // compressão log
  const varScale = Math.min(8, Math.abs(Number(change) || 0)); // até 8%
  const base = 22; // mínimo visual maior
  return clamp(base + varScale * 3 + volScale, 22, 90);
}

// lê preço/variação/volume de forma robusta (corrige cotações)
function pickNumber(...cands){
  for (const c of cands){
    const n = Number(c);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

// ====== DATA ======
async function fetchData(){
  let url;

  switch (category){
    case "criptos":
      url = `https://brapi.dev/api/crypto?token=${TOKEN}`;
      break;
    case "commodities":
      url = `https://brapi.dev/api/quote/commodities?token=${TOKEN}`;
      break;
    case "opcoes":
    case "frequencia":
    case "acoes":
    default:
      // lista consolidada da B3
      url = `https://brapi.dev/api/quote/list?token=${TOKEN}&limit=${MAX_BUBBLES}`;
  }

  const res = await fetch(url);
  const json = await res.json();

  // Normalização dos itens
  const items = json.stocks || json.coins || json.results || json || [];
  const norm = items.map((it) => {
    // símbolos possíveis
    const symbol = it.symbol || it.stock || it.code || it.ticker || it.coin || it.name || "???";

    // preço e variação (mais de um campo possível na BRAPI)
    const price = pickNumber(
      it.regularMarketPrice, it.close, it.price, it.lastPrice, it.buyPrice
    );
    const changePct = pickNumber(
      it.regularMarketChangePercent, it.change_percent, it.change, it.pctChange, it.varPct
    );
    const volume = pickNumber(
      it.regularMarketVolume, it.volume, it.totalVolume
    );

    return { symbol, price, changePct, volume };
  }).filter(x => x.symbol && x.price !== null && x.changePct !== null);

  return norm.slice(0, MAX_BUBBLES);
}

// ====== BUILD BUBBLES ======
function createBubbles(data){
  bubbles = data.map(d => {
    const r = radiusFor(d.changePct, d.volume);
    return {
      symbol: d.symbol,
      price: d.price,
      change: d.changePct,
      color: colorForChange(d.changePct),
      r,
      x: rand(r + WALL_MARGIN, canvas.width - r - WALL_MARGIN),
      y: rand(Math.max(HEADER_SAFE + r, r + WALL_MARGIN),
              canvas.height - r - WALL_MARGIN),
      vx: rand(-0.45, 0.45),
      vy: rand(-0.45, 0.45)
    };
  });

  // pequena iteração inicial para afastar bolhas que nascem sobrepostas
  for (let k = 0; k < 3; k++) resolveCollisions(true);
}

// ====== PHYSICS ======
function resolveCollisions(init = false){
  for (let i=0;i<bubbles.length;i++){
    for (let j=i+1;j<bubbles.length;j++){
      const a = bubbles[i], b = bubbles[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      const min = a.r + b.r + BORDER_WIDTH;

      if (dist < min && dist > 0){
        // vetor normal
        const nx = dx / dist, ny = dy / dist;
        const overlap = (min - dist) * 0.6;

        // separa
        a.x -= nx * overlap / 2;
        a.y -= ny * overlap / 2;
        b.x += nx * overlap / 2;
        b.y += ny * overlap / 2;

        // aplica pequena repulsão nas velocidades
        if (!init){
          const push = REPULSE * 0.5;
          a.vx -= nx * push; a.vy -= ny * push;
          b.vx += nx * push; b.vy += ny * push;
        }
      }
    }
  }
}

function wallConstraints(p){
  const left = p.r + WALL_MARGIN;
  const right = canvas.width - p.r - WALL_MARGIN;
  const top = Math.max(HEADER_SAFE + p.r, p.r + WALL_MARGIN);
  const bottom = canvas.height - p.r - WALL_MARGIN;

  if (p.x < left){ p.x = left; p.vx = Math.abs(p.vx); }
  if (p.x > right){ p.x = right; p.vx = -Math.abs(p.vx); }
  if (p.y < top){ p.y = top; p.vy = Math.abs(p.vy); }
  if (p.y > bottom){ p.y = bottom; p.vy = -Math.abs(p.vy); }
}

// ====== DRAW ======
function drawBubble(b){
  // preenchimento base
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
  ctx.fillStyle = b.color;
  ctx.fill();

  // anel de brilho nas bordas (não no centro)
  const ring = ctx.createRadialGradient(b.x, b.y, b.r*0.72, b.x, b.y, b.r);
  ring.addColorStop(0, "rgba(255,255,255,0)");
  ring.addColorStop(1, "rgba(255,255,255,0.85)");
  ctx.fillStyle = ring;
  ctx.fill();

  // contorno branco forte
  ctx.lineWidth = BORDER_WIDTH;
  ctx.strokeStyle = "#fff";
  ctx.stroke();

  // texto centralizado
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const f1 = Math.max(11, Math.floor(b.r * 0.42));
  const f2 = Math.max(10, Math.floor(b.r * 0.34));
  const f3 = Math.max(9,  Math.floor(b.r * 0.30));
  ctx.font = `700 ${f1}px system-ui,Arial`;
  ctx.fillText(b.symbol, b.x, b.y - f1*0.45);
  ctx.font = `500 ${f2}px system-ui,Arial`;
  ctx.fillText(`R$ ${b.price.toFixed(2).replace('.', ',')}`, b.x, b.y + 2);
  ctx.font = `600 ${f3}px system-ui,Arial`;
  const sign = b.change >= 0 ? "+" : "";
  ctx.fillText(`${sign}${b.change.toFixed(2)}%`, b.x, b.y + f2*0.9);
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for (const b of bubbles) drawBubble(b);
}

// ====== LOOP ======
function step(){
  // integração
  for (const p of bubbles){
    p.vx = clamp(p.vx * FRICTION, -MAX_SPEED, MAX_SPEED);
    p.vy = clamp(p.vy * FRICTION, -MAX_SPEED, MAX_SPEED);
    p.x += p.vx;
    p.y += p.vy;
    wallConstraints(p);
  }

  resolveCollisions();
  draw();
  requestAnimationFrame(step);
}

// ====== PUBLIC API ======
async function setCategory(cat){
  category = cat;
  const data = await fetchData();
  createBubbles(data);
}

// ====== START ======
setCategory("acoes");
step();

// Opcional: atualizar cotações periodicamente
setInterval(()=>setCategory(category), 30000);
