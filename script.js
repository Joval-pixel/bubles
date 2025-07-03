const apiKey = '5bTDfSmR2ieax6y7JUqDAD';
const symbols = ['VALE3', 'PETR4', 'ITUB4', 'BBDC4', 'BBAS3', 'ABEV3', 'B3SA3', 'MGLU3', 'WEGE3', 'RENT3'];

async function getStockData() {
  const url = `https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&token=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.stocks.slice(0, 100);
}

function createBubble(stock) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${stock.changesPercentage >= 0 ? 'positive' : 'negative'}`;
  
  const nome = stock.stock;
  const variacao = stock.changesPercentage?.toFixed(2);
  const preco = stock.price?.toFixed(2);
  
  const texto = `
    <span>${nome}</span>
    <span>${variacao > 0 ? '+' : ''}${variacao}%</span>
    <span>R$ ${preco}</span>
  `;
  
  bubble.innerHTML = texto;
  const tamanho = Math.min(Math.max(Math.abs(variacao) * 10 + stock.volume / 10000000, 60), 150);
  
  bubble.style.width = `${tamanho}px`;
  bubble.style.height = `${tamanho}px`;
  bubble.style.left = `${Math.random() * (window.innerWidth - tamanho)}px`;
  bubble.style.top = `${Math.random() * (window.innerHeight - tamanho)}px`;

  bubble.onclick = () => abrirModal(stock.stock);

  return bubble;
}

async function renderBubbles() {
  const container = document.getElementById("bubble-container");
  const stocks = await getStockData();

  stocks.forEach(stock => {
    if (stock.stock && stock.changesPercentage != null) {
      const bubble = createBubble(stock);
      container.appendChild(bubble);
    }
  });
}

function abrirModal(symbol) {
  const modal = document.getElementById("modal");
  const grafico = document.getElementById("grafico");
  modal.style.display = "block";
  grafico.innerHTML = `
    <iframe src="https://s.tradingview.com/embed-widget/symbol-overview/?locale=br#${symbol}"
      width="100%" height="400" frameborder="0" allowfullscreen></iframe>`;
}

function fecharModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("grafico").innerHTML = "";
}

renderBubbles();