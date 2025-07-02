fetch("https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=5&token=5bTDfSmR2ieax6y7JUqDAD")
  .then(res => res.json())
  .then(data => {
    const stocks = data.stocks;
    const container = document.getElementById("bubbles");
    container.innerHTML = "";

    stocks.forEach(stock => {
      const changeStr = stock.changesPercentage || "0";
      const match = changeStr.match(/-?\d+(\.\d+)?/); // extrai número mesmo com % e parênteses
      const change = match ? parseFloat(match[0]) : 0;

      const color = change > 0 ? "#4CAF50" : change < 0 ? "#F44336" : "#FFC107";

      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.style.backgroundColor = color;
      bubble.style.width = `${Math.abs(change) * 20 + 50}px`;
      bubble.style.height = bubble.style.width;

      bubble.innerHTML = `<strong>${stock.stock}</strong><br>${change.toFixed(2)}%`;
      container.appendChild(bubble);
    });
  })
  .catch(error => console.error("Erro ao buscar dados da API Brapi:", error));
