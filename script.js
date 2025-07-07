const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];
let tipoAtual = 'acoes';

const cores = {
  alta: '#00cc66',
  baixa: '#ff3333',
};

function criarBolhas(dados) {
  bubbles = dados.slice(0, 60).map((item, i) => {
    const variacao = parseFloat(item.changePercent);
    const raio = Math.min(100, Math.max(30, Math.abs(variacao) * 3));
    const cor = variacao >= 0 ? cores.alta : cores.baixa;
    const texto = `${item.symbol}\n${variacao.toFixed(2)}%`;

    return {
      x: Math.random() * (canvas.width - raio * 2) + raio,
      y: Math.random() * (canvas.height - raio * 2) + raio,
      dx: (Math.random() - 0.5) * 1.5,
      dy: (Math.random() - 0.5) * 1.5,
      raio,
      cor,
      texto,
    };
  });
}

function desenharBolhas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.raio, 0, Math.PI * 2);
    ctx.fillStyle = b.cor;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = `${Math.max(10, b.raio / 4)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const [linha1, linha2] = b.texto.split('\n');
    ctx.fillText(linha1, b.x, b.y - 8);
    ctx.fillText(linha2, b.x, b.y + 8);
  }
}

function animar() {
  for (let b of bubbles) {
    b.x += b.dx;
    b.y += b.dy;

    if (b.x - b.raio < 0 || b.x + b.raio > canvas.width) b.dx *= -1;
    if (b.y - b.raio < 0 || b.y + b.raio > canvas.height) b.dy *= -1;
  }
  desenharBolhas();
  requestAnimationFrame(animar);
}

function loadBubbles(tipo) {
  tipoAtual = tipo;
  let url = '';
  if (tipo === 'acoes') {
    url = 'https://brapi.dev/api/quote/list?sortBy=volume&limit=60&token=5bTDfSmR2ieax6y7JUqDAD';
  } else if (tipo === 'criptos') {
    url = 'https://brapi.dev/api/quote/list?search=BTC,ETH,ADA,XRP,SOL,MATIC,DOGE,DOT,LTC,AVAX&token=5bTDfSmR2ieax6y7JUqDAD';
  }

  fetch(url)
    .then(res => res.json())
    .then(json => criarBolhas(json.stocks || []));
}

loadBubbles('acoes');
animar();