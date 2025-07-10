const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bolhas = [];

function criarBolhas(dados) {
  bolhas = dados.slice(0, 60).map((dado) => {
    const raio = 30 + Math.abs(dado.changePercent) * 1.5;
    return {
      ...dado,
      raio,
      x: Math.random() * (canvas.width - raio * 2) + raio,
      y: Math.random() * (canvas.height - raio * 2) + raio,
      vx: (Math.random() - 0.5) * 0.1, // velocidade muito mais lenta
      vy: (Math.random() - 0.5) * 0.1
    };
  });
}

function desenharBolhas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const b of bolhas) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.raio, 0, 2 * Math.PI);
    ctx.fillStyle = b.changePercent >= 0 ? "#00cc00" : "#cc0000";
    ctx.shadowColor = b.changePercent >= 0 ? "#00ff00" : "#ff0000";
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2;
    ctx.strokeStyle = "white";
    ctx.stroke();

    // Texto
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "bold 12px Arial";
    ctx.fillText(b.symbol, b.x, b.y - 10);
    ctx.font = "bold 16px Arial";
    ctx.fillText((b.changePercent > 0 ? "+" : "") + b.changePercent.toFixed(2) + "%", b.x, b.y + 10);
  }
}

function detectarColisao() {
  for (let i = 0; i < bolhas.length; i++) {
    for (let j = i + 1; j < bolhas.length; j++) {
      const a = bolhas[i];
      const b = bolhas[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distancia = Math.sqrt(dx * dx + dy * dy);
      const somaRaios = a.raio + b.raio;

      if (distancia < somaRaios) {
        const angulo = Math.atan2(dy, dx);
        const sobreposicao = somaRaios - distancia;

        // separa
        a.x -= Math.cos(angulo) * sobreposicao / 2;
        a.y -= Math.sin(angulo) * sobreposicao / 2;
        b.x += Math.cos(angulo) * sobreposicao / 2;
        b.y += Math.sin(angulo) * sobreposicao / 2;

        // rebote
        a.vx *= -1;
        a.vy *= -1;
        b.vx *= -1;
        b.vy *= -1;
      }
    }
  }
}

function atualizar() {
  for (const b of bolhas) {
    b.x += b.vx;
    b.y += b.vy;

    if (b.x - b.raio < 0 || b.x + b.raio > canvas.width) b.vx *= -1;
    if (b.y - b.raio < 0 || b.y + b.raio > canvas.height) b.vy *= -1;
  }
  detectarColisao();
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
    url = "https://brapi.dev/api/quote/list?search=CALL&sortBy=volume&sortOrder=desc&limit=60&token=5bTDfSmR2ieax6y7JUqDAD";
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    const lista = data.stocks || data.coins || [];
    const dadosFormatados = lista.map((item) => ({
      symbol: item.symbol || item.coin || item.name || "???",
      changePercent: item.change || item.changePercent || 0
    }));
    criarBolhas(dadosFormatados);
  } catch (e) {
    console.error("Erro ao buscar dados:", e);
  }
}

carregarBolas("acoes");
animar();