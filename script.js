const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function desenharBolha(x, y, r, cor) {
  const grad = ctx.createRadialGradient(x, y, r * 0.3, x, y, r);
  grad.addColorStop(0, "#fff");
  grad.addColorStop(1, cor);

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
}

function desenhar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  desenharBolha(200, 200, 60, "red");
  desenharBolha(350, 300, 50, "limegreen");
  requestAnimationFrame(desenhar);
}

desenhar();