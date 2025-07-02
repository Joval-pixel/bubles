fetch("https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=5&token=5bTDfSmR2ieax6y7JUqDAD")
  .then(res => res.json())
  .then(data => {
    const stocks = data.stocks;
    const container = document.getElementById("bubbles");
    container.innerHTML = "";

    stocks.forEach(stock => {
      const symbol = stock.stock || stock.symbol || "???";

      // Tentamos extrair de 'changesPercentage', se não tiver, usamos 'change' com fallback 0
      let change = 0;

      if (typeof stock.changesPercentage === "string") {
        const match = stock.changesPercentage.match(/-?\d+(\.\d+)?/);
        if (match) change = parseFloat(match[0]);
      } else if (typeof stock.change === "number") {
        change = stock.change;
      }

      const color = change > 0 ? "#4CAF50" : change < 0 ? "#F44336" : "#FFC107";

      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.style.backgroundColor = color;
      bubble.style.width = `${Math.abs(change) * 20 + 50}px`;
      bubble.style.height = bubble.style.width;

      bubble.innerHTML = `<strong>${symbol}</strong><br>${change.toFixed(2)}%`;
      container.appendChild(bubble);
    });
  })
  .catch(error => console.error("Erro ao buscar dados da API Brapi:", error));
