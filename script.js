const canvas = document.getElementById('bolhasCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 90;

let bolhas = [];
let tipoAtual = 'acoes';
const apiKey = '5bTDfSmR2ieax6y7JUqDAD';

async function carregarBolhas(tipo) {
  tipoAtual = tipo;
  bolhas = [];

  const tickers = tipo === 'acoes'
    ? ['PETR4','VALE3','ITUB4','BBDC4','ABEV3','BBAS3','WEGE3','PETR3','MGLU3','B3SA3','GGBR4','ELET3','CSNA3','RAIL3','PRIO3','RENT3','HAPV3','JBSS3','ASAI3','CPLE6','BRKM5','CMIG4','EMBR3','VBBR3','UGPA3','ENEV3','TIMS3','SANB11','CRFB3','ALPA4','MRVE3','LREN3','COGN3','ELET6','MULT3','BEEF3','TOTS3','CVCB3','YDUQ3','AZUL4','RRRP3','ECOR3','DXCO3','CSAN3','IGTI11','SOMA3','AMER3','POSI3','SUZB3','RAIZ4','PETZ3','SMTO3','CYRE3','HYPE3','BIDI11','BRFS3','QUAL3','VIVT3','BRAP4','MOVI3']
    : ['BTC','ETH','ADA','XRP','SOL','DOGE','MATIC','DOT','AVAX','SHIB','LINK','LTC','BCH','ATOM','XLM','XMR','APT','SAND','AXS','FTM'];

  const promises = tickers.map(ticker => {
    const prefix = tipo === 'acoes' ? '' : 'CRYPTO:';
    return fetch(`https://brapi.dev/api/quote/${prefix}${ticker}?token=${apiKey}`)
      .then(r => r.json())
      .then(d => {
        const info = d.results[0];
        if (!info) return null;

        const variacao = info.change_percent;
        const cor = variacao >= 0 ? 'rgba(0,200,0,0.8)' : 'rgba(255,0,0,0.8)';
        const borda = 'white';
        const raio = 20 + Math.min(Math.abs(variacao) * 3, 60);
        const nome = info.stock || info.symbol;

        return {
          nome,
          variacao: variacao.toFixed(2) + '%',
          raio,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          dx: (Math.random() - 0.5) * 1,
          dy: (Math.random() - 0.5) * 1,
          cor,
          borda
        };
      });
  });

  const resultados = await Promise.all(promises);
  bolhas = resultados.filter(b => b);
}

function desenharBolhas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bolhas) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.raio, 0, Math.PI * 2);
    ctx.fillStyle = b.cor;
    ctx.shadowBlur = 15;
    ctx.shadowColor = b.cor;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = b.borda;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // texto
    ctx.fillStyle = 'white';
    ctx.font = `${Math.max(b.raio / 3, 10)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(b.nome, b.x, b.y - 5);
    ctx.fillText(b.variacao, b.x, b.y + 12);
  }
}

function atualizarBolhas() {
  for (let b of bolhas) {
    b.x += b.dx;
    b.y += b.dy;

    if (b.x - b.raio < 0 || b.x + b.raio > canvas.width) b.dx *= -1;
    if (b.y - b.raio < 0 || b.y + b.raio > canvas.height) b.dy *= -1;
  }
}

function animar() {
  requestAnimationFrame(animar);
  atualizarBolhas();
  desenharBolhas();
}

carregarBolhas('acoes');
animar();