const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

let bolhas = [];

function carregar(tipo) {
  let url = "";
  if (tipo === "acoes") {
    url = "https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=60&token=5bTDfSmR2ieax6y7JUqDAD";
  } else if (tipo === "criptos") {
    url = "https://brapi.dev/api/crypto?limit=60&token=5bTDfSmR2ieax6y7JUqDAD";
  } else if (tipo === "opcoes") {
    url = "https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=60&search=CALL&token=5bTDfSmR2ieax6y7JUqDAD";
  }

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const ativos = data.stocks || data.coins || [];
      bolhas = ativos.map(a => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        r: 40,
        code: a.symbol || a.coin || "",
        pct: a.changePercent?.toFixed(2) || a.change?.toFixed(2) || "0",
        logo: a.logo || a.image || "",
        up: (a.changePercent || a.change || 0) >= 0
      }));
    });
}

function desenharBolhas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const b of bolhas) {
    // movimento
    b.x += b.vx;
    b.y += b.vy;

    // colisão com bordas
    if (b.x - b.r < 0 || b.x + b.r > canvas.width) b.vx *= -1;
    if (b.y - b.r < 0 || b.y + b.r > canvas.height) b.vy *= -1;

    // desenhar bolha
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
    ctx.fillStyle = b.up ? "#00cc00" : "#ff3333";
    ctx.shadowColor = "white";
    ctx.shadowBlur = 5;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "white";
    ctx.stroke();

    // desenhar logo
    if (b.logo) {
      const img = new Image();
      img.src = b.logo;
      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y - 10, 12, 0, Math.PI * 2, true);
      ctx.clip();
      ctx.drawImage(img, b.x - 12, b.y - 22, 24, 24);
      ctx.restore();
    }

    // texto: código
    ctx.fillStyle = "white";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(b.code, b.x, b.y + 5);

    // texto: variação
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.fillText((b.pct > 0 ? "+" : "") + b.pct + "%", b.x, b.y + 22);
  }
}

function animar() {
  desenharBolhas();
  requestAnimationFrame(animar);
}

carregar("acoes");
animar();