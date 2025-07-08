const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bolhas = [];

function criarBolhas(dados) {
  bolhas = dados.slice(0, 60).map(dado => {
    const raio = 30 + Math.abs(dado.changePercent) * 1.5;
    const x = Math.random() * (canvas.width - raio * 2) + raio;
    const y = Math.random() * (canvas.height - raio * 2) + raio;
    const cor = dado.changePercent >= 0 ? "#00ff00" : "#ff0000";
    const borda = "#fff";

    return {
      ...dado,
      x, y, raio,
      vx: Math.random() * 0.6 - 0.3,
      vy: Math.random() * 0.6 - 0.3,
      cor, borda
    };
  });
}

function desenharBolhas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bolhas.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.raio, 0, Math.PI * 2);
    ctx.fillStyle = b.cor;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = b.borda;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(b.symbol, b.x, b.y - 6);
    ctx.font = "bold 14px Arial";
    ctx.fillText((b.changePercent > 0 ? "+" : "") + b.changePercent.toFixed(2) + "%", b.x, b.y + 10);
  });
}

function atualizar() {
  bolhas.forEach(b => {
    b.x += b.vx;
    b.y += b.vy;

    if (b.x - b.raio < 0 || b.x + b.raio > canvas.width) b.vx *= -1;
    if (b.y - b.raio < 0 || b.y + b.raio > canvas.height) b.vy *= -1;
  });
}

function animar() {
  atualizar();
  desenharBolhas();
  requestAnimationFrame(animar);
}

async function carregar(tipo) {
  let url = "";
  if (tipo === "acoes")
    url = "https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=60&token=5bTDfSmR2ieax6y7JUqDAD";
  else if (tipo === "criptos")
    url = "https://brapi.dev/api/crypto?limit=60&token=5bTDfSmR2ieax6y7JUqDAD";
  else if (tipo === "opcoes")
    url = "https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&search=CALL&limit=60&token=5bTDfSmR2ieax6y7JUqDAD";

  try {
    const res = await fetch(url);
    const json = await res.json();
    const lista = json.stocks || json.coins || [];
    const dados = lista.map(a => ({
      symbol: a.symbol || a.coin || "??",
      changePercent: a.changePercent || a.change || 0
    }));
    criarBolhas(dados);
  } catch (e) {
    console.error("Erro ao buscar dados", e);
  }
}

carregar("acoes");
animar();