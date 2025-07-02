const apiKey = '5bTDfSmR2ieax6y7JUqDAD';
const symbols = ['VALE3', 'PETR4', 'ITUB4', 'BBAS3', 'PRIO3']; // pode adicionar/remover

const container = document.getElementById('bubbles-container');

async function fetchStock(symbol) {
  const url = `https://brapi.dev/api/quote/${symbol}?token=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    const result = data.results[0];
    return {
      symbol: result.symbol,
      change: result.regularMarketChangePercent,
    };
  } catch (error) {
    console.error(`Erro ao buscar ${symbol}:`, error);
    return null;
  }
}

function createBubble(stock) {
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  const change = parseFloat(stock.change);

  bubble.style.backgroundColor =
    change > 0 ? 'green' : change < 0 ? 'red' : 'gray';

  bubble.style.width = bubble.style.height =
    60 + Math.min(Math.abs(change) * 10, 100) + 'px';

  bubble.style.left = Math.random() * 80 + 'vw';
  bubble.style.top = Math.random() * 60 + 60 + 'px';

  bubble.innerText = `${stock.symbol}\n${change.toFixed(2)}%`;
  container.appendChild(bubble);
}

async function renderBubbles() {
  container.innerHTML = '';
  for (const symbol of symbols) {
    const stock = await fetchStock(symbol);
    if (stock) createBubble(stock);
  }
}

renderBubbles();
setInterval(renderBubbles, 30000); // atualiza a cada 30s