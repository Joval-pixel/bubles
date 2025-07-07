const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bolhas = [];

function criarBolhas(dados) {
  bolhas = dados.slice(0, 60).map((dado) => {
    const raio = 30 + Math.abs(dado.changePercent) * 2;
    return {
      symbol: dado.symbol,
      changePercent: dado.changePercent,
      x: Math.random() * (canvas.width - raio * 2) + raio,
      y: Math.random() * (canvas.height - raio * 2) + raio,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      raio: raio,
      cor: dado.changePercent >= 0 ? "#00cc00" : "#ff3333"
    };
  });
}

function desenharBolhas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bolhas.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.raio, 0, 2 * Math.PI);
    ctx.fillStyle = b.cor;
    ctx.fill();
    ctx.shadowColor = "white";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "white";
    ctx.font = `${Math.max(12, b.raio / 3)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(b.symbol, b.x, b.y - 5);
    ctx.font = `bold ${Math.max(12, b.raio / 4)}px Arial`;
    ctx.fillText(`${b.changePercent > 0 ? '+' : ''}${b.changePercent.toFixed(2)}%`, b.x, b.y + 12);
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
    const dados = ativos.map(item => ({
      symbol: item.symbol || item.coin || "N/A",
      changePercent: item.change || item.changePercent || 0
    }));
    criarBolhas(dados);
  } catch (e) {
    console.error("Erro ao carregar dados:", e);
  }
}

carregarBolas("acoes");
animar();