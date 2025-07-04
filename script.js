const container = document.getElementById("bubble-container");
const apiKey = "5bTDfSmR2ieax6y7JUqDAD";
const tickers = ["VALE3", "PETR4", "ITUB4", "BBDC4", "BBAS3", "MGLU3", "WEGE3", "RAIZ4", "AZUL4", "JBSS3"];

async function fetchData() {
  try {
    const res = await fetch(`https://brapi.dev/api/quote/${tickers.join(",")}?token=${apiKey}`);
    const data = await res.json();
    renderBubbles(data.results);
  } catch (err) {
    console.error("Erro ao buscar dados da Brapi:", err);
  }
}

function renderBubbles(stocks) {
  container.innerHTML = "";

  stocks.forEach(stock => {
    const change = stock.regularMarketChangePercent ?? stock.change_percent ?? 0;
    const color = change >= 0 ? "green" : "red";
    const size = 50 + Math.min(Math.abs(change), 10) * 5;

    const bubble = document.createElement("div");
    bubble.className = `bubble ${color}`;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.top = `${Math.random() * 80}vh`;
    bubble.style.left = `${Math.random() * 90}vw`;
    bubble.innerHTML = `${stock.symbol}<br>${change.toFixed(2)}%`;

    container.appendChild(bubble);
  });
}

fetchData();
setInterval(fetchData, 60000); // atualiza a cada 1 min