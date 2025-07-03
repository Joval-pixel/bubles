const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let bolhas = [];
let categoriaAtual = "acoes";
let setorAtual = "Todos";

function ajustarCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
ajustarCanvas();
window.addEventListener("resize", ajustarCanvas);

function criarBolhas(dados) {
  bolhas = dados.map((acao, i) => {
    const variacao = parseFloat(acao.change).toFixed(2);
    const volume = parseFloat(acao.volume) || 0;
    const raioBase = Math.min(100, Math.max(20, Math.abs(variacao) * 6 + volume / 100000000));

    return {
      simbolo: acao.stock,
      preco: acao.close,
      variacao: variacao,
      setor: acao.sector || "Outros",
      raio: raioBase,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      dx: (Math.random() - 0.5) * 0.7,
      dy: (Math.random() - 0.5) * 0.7,
      cor: variacao > 0 ? "rgba(0,255,0,0.8)" : variacao < 0 ? "rgba(255,0,0,0.8)" : "gray"
    };
  });
  desenharSetores(bolhas);
}

function desenharSetores(bolhas) {
  const setores = ["Todos", ...new Set(bolhas.map(b => b.setor))];
  const container = document.getElementById("setores");
  container.innerHTML = "";
  setores.forEach(s => {
    const btn = document.createElement("button");
    btn.innerText = s;
    btn.className = s === "Todos" ? "active" : "";
    btn.onclick = () => {
      setorAtual = s;
      document.querySelectorAll("#setores button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    };
    container.appendChild(btn);
  });
}

function desenharBolhas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bolhas.forEach(b => {
    if (setorAtual !== "Todos" && b.setor !== setorAtual) return;

    // Movimentação e colisão com borda
    b.x += b.dx;
    b.y += b.dy;
    if (b.x - b.raio < 0 || b.x + b.raio > canvas.width) b.dx *= -1;
    if (b.y - b.raio < 0 || b.y + b.raio > canvas.height) b.dy *= -1;

    // Gradiente de brilho
    const grad = ctx.createRadialGradient(b.x, b.y, 10, b.x, b.y, b.raio);
    grad.addColorStop(0, "#fff");
    grad.addColorStop(1, b.cor);
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.raio, 0, Math.PI * 2);
    ctx.fill();

    // Texto
    ctx.fillStyle = "#fff";
    ctx.font = `${Math.max(10, b.raio / 3)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(`${b.simbolo} ${b.variacao}%`, b.x, b.y + 4);
  });

  requestAnimationFrame(desenharBolhas);
}

canvas.addEventListener("click", e => {
  const x = e.clientX, y = e.clientY;
  const bolha = bolhas.find(b =>
    Math.hypot(b.x - x, b.y - y) < b.raio &&
    (setorAtual === "Todos" || b.setor === setorAtual)
  );
  if (bolha) {
    window.open(`https://s.tradingview.com/widgetembed/?symbol=BMF%3A${bolha.simbolo}&frameElementId=tradingview_bolha`, "_blank");
  }
});

function showCategory(categoria) {
  categoriaAtual = categoria;
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelector(`.tab:nth-child(${categoria === "acoes" ? 1 : categoria === "cripto" ? 2 : 3})`).classList.add("active");

  let endpoint;
  if (categoria === "acoes") {
    endpoint = "https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=100&token=5bTDfSmR2ieax6y7JUqDAD";
  } else if (categoria === "cripto") {
    endpoint = "https://brapi.dev/api/quote/list?search=BTC,ETH,MATIC,ADA,SOL,AVAX,DOGE,DOT,XRP&token=5bTDfSmR2ieax6y7JUqDAD";
  } else {
    endpoint = "https://brapi.dev/api/quote/list?search=PETR4,VALE3,CMIG4,ITUB4,WEGE3&token=5bTDfSmR2ieax6y7JUqDAD";
  }

  fetch(endpoint)
    .then(res => res.json())
    .then(data => criarBolhas(data.stocks));
}

showCategory("acoes");
desenharBolhas();