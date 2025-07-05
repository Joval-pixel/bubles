const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

let bolhas = [];

function gerarBolhas() {
  const ativos = [
    { symbol: "AZUL4", change: 8.12 },
    { symbol: "PETR4", change: -2.14 },
    { symbol: "VALE3", change: 1.34 },
    { symbol: "MGLU3", change: -0.85 },
    { symbol: "BBDC4", change: 0.56 },
    { symbol: "ITUB4", change: -0.12 },
    { symbol: "LREN3", change: 2.5 },
    { symbol: "ABEV3", change: -1.3 },
    { symbol: "GGBR4", change: 0.8 },
    { symbol: "BBAS3", change: 1.95 }
  ];

  return ativos.map((a) => {
    const raio = Math.min(120, 40 + Math.abs(a.change) * 10); // limite de tamanho
    return {
      ...a,
      x: Math.random() * width,
      y: Math.random() * height,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      r: raio,
      cor: a.change >= 0 ? "rgba(0,255,0,0.35)" : "rgba(255,0,0,0.35)"
    };
  });
}

function desenharBolha(b) {
  const grad = ctx.createRadialGradient(b.x, b.y, b.r * 0.2, b.x, b.y, b.r);
  grad.addColorStop(0, "rgba(255,255,255,0.2)");
  grad.addColorStop(1, b.cor);

  ctx.beginPath();
  ctx.fillStyle = grad;
  ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = `${Math.max(b.r * 0.3, 12)}px Arial`;
  ctx.fillText(b.symbol, b.x, b.y - 4);
  ctx.font = `${Math.max(b.r * 0.25, 10)}px Arial`;
  ctx.fillText(`${b.change.toFixed(2)}%`, b.x, b.y + 14);
}

function animar() {
  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < bolhas.length; i++) {
    const b = bolhas[i];
    b.x += b.dx;
    b.y += b.dy;

    if (b.x - b.r < 0 || b.x + b.r > width) b.dx *= -1;
    if (b.y - b.r < 0 || b.y + b.r > height) b.dy *= -1;

    // colisão com outras bolhas
    for (let j = i + 1; j < bolhas.length; j++) {
      const b2 = bolhas[j];
      const dx = b2.x - b.x;
      const dy = b2.y - b.y;
      const dist = Math.hypot(dx, dy);
      const minDist = b.r + b2.r;

      if (dist < minDist) {
        const angle = Math.atan2(dy, dx);
        const targetX = b.x + Math.cos(angle) * minDist;
        const targetY = b.y + Math.sin(angle) * minDist;
        const ax = (targetX - b2.x) * 0.05;
        const ay = (targetY - b2.y) * 0.05;

        b.dx -= ax;
        b.dy -= ay;
        b2.dx += ax;
        b2.dy += ay;
      }
    }

    desenharBolha(b);
  }

  requestAnimationFrame(animar);
}

function filtrar(categoria) {
  document.querySelectorAll("#menu button").forEach(btn => btn.classList.remove("ativo"));
  event.target.classList.add("ativo");

  bolhas = gerarBolhas(); // Aqui você pode carregar diferentes dados por aba futuramente
}

window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
});

bolhas = gerarBolhas();
animar();