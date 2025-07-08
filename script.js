const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bolhas = [];

function criarBolhas(dados) {
  bolhas = dados.slice(0, 60).map(dado => {
    const raio = 20 + Math.abs(dado.changePercent * 2);
    const x = Math.random() * (canvas.width - raio * 2) + raio;
    const y = Math.random() * (canvas.height - raio * 2) + raio;
    const cor = dado.changePercent >= 0 ? "#00cc00" : "#ff3333";
    return {
      ...dado,
      x,
      y,
      vx: Math.random() * 0.5 - 0.25,
      vy: Math.random() * 0.5 - 0.25,
      raio,
      cor
    };
  });
}

function desenharBolhas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const b of bolhas) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.raio, 0, 2 * Math.PI);
    ctx.fillStyle = b.cor;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(b.symbol, b.x, b.y - 6);
    ctx.fillText((b.changePercent > 0 ? "+" : "") + b.changePercent.toFixed(2) + "%", b.x, b.y + 10);
  }
}

function atualizar() {
  for (const b of bolhas) {
    b.x += b.vx;
    b.y += b.vy;
    if (b.x - b.raio < 0 || b.x + b.raio > canvas.width) b.vx *= -1;
    if (b.y - b.raio < 0 || b.y + b.raio > canvas.height) b.vy *= -1;
  }
}

function animar() {
  atualizar();
  desenharBolhas();
  requestAnimationFrame(animar);
}

async function carregarBolas(tipo) {
  let url = "";
  if (tipo === "acoes") {
    url = "https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=60&token=5bTDfSmR2ieax6y7JUqDAD";
  } else if (tipo === "criptos") {
    url = "https://brapi.dev/api/crypto?limit=60&token=5bTDfSmR2ieax6y7JUqDAD";
  } else if (tipo === "opcoes") {
    url = "https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=60&search=CALL&token=5bTDfSmR2ieax6y7JUqDAD";
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    const ativos = data.stocks || data.coins || [];
    const filtrados = ativos.map(a => ({
      symbol: a.symbol || a.coin || a.name,
      changePercent: a.change || a.changePercent || 0
    }));
    criarBolhas(filtrados);
  } catch (e) {
    console.error("Erro ao carregar dados:", e);
  }
}

carregarBolas("acoes");
animar();
