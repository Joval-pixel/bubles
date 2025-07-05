const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let width, height;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

let tab = "acoes";
let bubbles = [];

function setTab(t) {
  tab = t;
  document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  loadData();
}

function toggleRanking() {
  const panel = document.getElementById("rankingPanel");
  panel.style.display = panel.style.display === "none" ? "block" : "none";
}

function loadData() {
  fetch(`https://brapi.dev/api/quote/list?sortBy=change&sortOrder=desc&token=5bTDfSmR2ieax6y7JUqDAD`)
    .then(res => res.json())
    .then(data => {
      let ativos = data.stocks.slice(0, 50); // 50 bolhas
      bubbles = ativos.map((a, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 20 + Math.abs(a.change) * 10,
        dx: (Math.random() - 0.5) * 0.8,
        dy: (Math.random() - 0.5) * 0.8,
        symbol: a.symbol,
        change: a.change
      }));

      let rank = ativos.slice(0, 10).map(a => `${a.symbol}: ${a.change.toFixed(2)}%`).join('<br>');
      document.getElementById("rankingPanel").innerHTML = rank;
    });
}
loadData();

function draw() {
  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < bubbles.length; i++) {
    let b = bubbles[i];

    // Colisão básica com bordas
    if (b.x - b.r < 0 || b.x + b.r > width) b.dx *= -1;
    if (b.y - b.r < 0 || b.y + b.r > height) b.dy *= -1;

    // Movimento
    b.x += b.dx;
    b.y += b.dy;

    // Cor com brilho suave
    let color = b.change > 0 ? [0, 255, 0] : [255, 0, 0];
    let gradient = ctx.createRadialGradient(b.x, b.y, b.r * 0.3, b.x, b.y, b.r);
    gradient.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},1)`);
    gradient.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0.2)`);

    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();

    // Texto centralizado e proporcional
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${Math.max(10, b.r / 3)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(b.symbol, b.x, b.y - 10);
    ctx.font = `bold ${Math.max(8, b.r / 3.5)}px sans-serif`;
    ctx.fillText(b.change.toFixed(2) + "%", b.x, b.y + 10);
  }

  requestAnimationFrame(draw);
}
draw();