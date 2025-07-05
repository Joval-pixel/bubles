const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let bolhas = [];

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

function gerarBolhas() {
  bolhas = [];
  for (let i = 0; i < 40; i++) {
    const variacao = (Math.random() * 8 - 4).toFixed(2);
    const volume = Math.random() * 1000000;
    const raio = 30 + Math.min(Math.abs(variacao) * 15 + volume / 500000, 100);
    const simbolo = gerarTicker();
    const cor = variacao >= 0 ? "green" : "red";
    const brilho = variacao >= 0 ? "rgba(0,255,0,0.6)" : "rgba(255,0,0,0.6)";
    bolhas.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      raio,
      simbolo,
      variacao,
      cor,
      brilho
    });
  }
}

function gerarTicker() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const tamanho = Math.random() > 0.7 ? 5 : 4;
  let ticker = "";
  for (let i = 0; i < tamanho; i++) {
    ticker += letras.charAt(Math.floor(Math.random() * letras.length));
  }
  return ticker;
}

function desenharBolhas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let b of bolhas) {
    // brilho forte nas bordas
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.raio, 0, 2 * Math.PI);
    ctx.shadowBlur = 30;
    ctx.shadowColor = b.brilho;
    ctx.fillStyle = b.cor;
    ctx.fill();

    // texto centralizado
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fff";
    ctx.font = `${Math.max(b.raio / 4, 12)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(b.simbolo, b.x, b.y - 5);
    ctx.fillText(`${b.variacao}%`, b.x, b.y + 15);
  }
}

function atualizarBolhas() {
  for (let b of bolhas) {
    b.x += b.vx;
    b.y += b.vy;

    // colisão com borda
    if (b.x - b.raio < 0 || b.x + b.raio > canvas.width) b.vx *= -1;
    if (b.y - b.raio < 0 || b.y + b.raio > canvas.height) b.vy *= -1;

    // colisão entre bolhas
    for (let outro of bolhas) {
      if (b === outro) continue;
      const dx = b.x - outro.x;
      const dy = b.y - outro.y;
      const dist = Math.hypot(dx, dy);
      const minDist = b.raio + outro.raio;

      if (dist < minDist) {
        const ang = Math.atan2(dy, dx);
        const mov = (minDist - dist) / 2;
        b.x += Math.cos(ang) * mov;
        b.y += Math.sin(ang) * mov;
        outro.x -= Math.cos(ang) * mov;
        outro.y -= Math.sin(ang) * mov;

        [b.vx, outro.vx] = [outro.vx, b.vx];
        [b.vy, outro.vy] = [outro.vy, b.vy];
      }
    }
  }
}

function animar() {
  atualizarBolhas();
  desenharBolhas();
  requestAnimationFrame(animar);
}

function trocarAba(aba) {
  document.querySelectorAll("#menu button").forEach(btn => btn.classList.remove("ativo"));
  event.target.classList.add("ativo");
  gerarBolhas();
}

gerarBolhas();
animar();