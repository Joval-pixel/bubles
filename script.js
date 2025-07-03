const container = document.getElementById("bubbles-container");

fetch("https://brapi.dev/api/quote/list?sortBy=change&sortOrder=desc&limit=50&token=5bTDfSmR2ieax6y7JUqDAD")
  .then(res => res.json())
  .then(data => {
    const stocks = data.stocks;

    stocks.forEach((stock, i) => {
      const change = parseFloat(stock.changePercent);
      if (isNaN(change)) return;

      const bubble = document.createElement("div");
      bubble.className = `bubble ${change > 0 ? 'positive' : 'negative'}`;

      // Tamanho da bolha proporcional ao desempenho
      const size = Math.min(200, Math.max(50, Math.abs(change) * 8));
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;

      // Posição aleatória segura
      bubble.style.left = `${Math.random() * (window.innerWidth - size)}px`;
      bubble.style.top = `${Math.random() * (window.innerHeight - size - 60) + 60}px`;

      // Conteúdo da bolha
      bubble.innerHTML = `
        <span>${stock.stock}</span>
        <span>${change > 0 ? '+' : ''}${change.toFixed(2)}%</span>
      `;

      container.appendChild(bubble);
    });
  })
  .catch(error => console.error("Erro ao buscar dados:", error));