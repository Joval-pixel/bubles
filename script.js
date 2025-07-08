const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bolhas = [];

function criarBolhas(dados) {
  bolhas = dados.slice(0, 60).map((item, i) => {
    const change = item.changePercent || 0;
    const raio = 40;
    return {
      symbol: item.symbol,
      change,
      logo: item.logo || `https://raw.githubusercontent.com/raphaelfabeni/stocks-logo/master/logos/${item.symbol}.png`,
      x: Math.random() * (canvas.width - raio * 2) + raio,
      y: Math.random() * (canvas.height - raio * 2) + raio,
      vx: Math.random() * 0.5 - 0.25,
      vy: Math.random() * 0.5 - 0.25,
      raio,
    };
  });
}

function desenharBolhas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bolhas.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.raio, 0, Math.PI * 2);
    ctx.fillStyle = b.change >= 0 ? "#00cc00" : "#ff3333";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#fff";
    ctx.stroke();

    const img = new Image();
    img.src = b.logo;
    img.onload = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.raio - 10, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, b.x - 20, b.y - 20, 40, 40);
      ctx.restore();
    };

    ctx.fillStyle = "white";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(b.symbol, b.x, b.y + b.raio - 15);
    ctx.fillText((b.change > 0 ? "+" : "") + b.change.toFixed(2) + "%", b.x, b.y + b.raio);
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
  const token = "5bTDfSmR2ieax6y7JUqDAD";
  if (tipo === "acoes") {
    url = `https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=60&token=${token}`;
  } else if (tipo === "criptos") {
    url = `https://brapi.dev/api/crypto?limit=60&token=${token}`;
  } else if (tipo === "opcoes") {
    url = `https://brapi.dev/api/quote/list?search=CALL&limit=60&token=${token}`;
  }

  const res = await fetch(url);
  const json = await res.json();
  const ativos = json.stocks || json.coins || [];

  const dados = ativos.map(a => ({
    symbol: a.symbol || a.coin,
    changePercent: a.change || a.changePercent || 0,
  }));

  criarBolhas(dados);
}

carregarBolas("acoes");
animar();