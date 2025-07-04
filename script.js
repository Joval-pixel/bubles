const container = document.getElementById('bubble-container');
const modal = document.getElementById('modal');
const chart = document.getElementById('chart');

const brapiKey = '5bTDfSmR2ieax6y7JUqDAD';
const tickers = ['VALE3', 'PETR4', 'ITUB4', 'BBDC4', 'BBAS3', 'MGLU3', 'AZUL4', 'RAIZ4', 'COGN3', 'VVAR3'];

async function carregarBrapi() {
  try {
    const response = await fetch(`https://brapi.dev/api/quote/${tickers.join(',')}?token=${brapiKey}`);
    const data = await response.json();
    criarBolhas(data.stocks);
  } catch (e) {
    console.error('Erro ao carregar dados da Brapi:', e);
  }
}

function criarBolhas(stocks) {
  container.innerHTML = '';
  stocks.forEach(stock => {
    const bubble = document.createElement('div');
    const valor = stock.changePercent;
    const variacao = parseFloat(valor);
    const cor = variacao < 0 ? 'red' : 'green';

    bubble.className = `bubble ${cor}`;
    bubble.style.width = `${50 + Math.abs(variacao) * 5}px`;
    bubble.style.height = bubble.style.width;
    bubble.style.top = `${Math.random() * 80}vh`;
    bubble.style.left = `${Math.random() * 80}vw`;
    bubble.style.fontSize = `${Math.max(10, 12 + Math.abs(variacao))}px`;
    bubble.innerHTML = `${stock.stock}<br>${variacao.toFixed(2)}%`;

    bubble.onclick = () => abrirGrafico(stock.stock);
    container.appendChild(bubble);
  });
}

function abrirGrafico(ticker) {
  modal.style.display = 'flex';
  chart.innerHTML = `
    <iframe src="https://s.tradingview.com/widgetembed/?symbol=BMFBOVESPA:${ticker}&theme=dark&style=1&locale=br" allowfullscreen></iframe>
  `;
}

function fecharModal() {
  modal.style.display = 'none';
  chart.innerHTML = '';
}

window.onload = carregarBrapi;