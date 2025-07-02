fetch("https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=60&token=5bTDfSmR2ieax6y7JUqDAD")
  .then(res => res.json())
  .then(data => {
    const stocks = data.stocks;
    const container = document.getElementById("bubbles");
    container.innerHTML = "";

    stocks.forEach(stock => {
      let changeStr = stock.changesPercentage || "";
      let change = parseFloat(changeStr.toString().replace('%', ''));
      if (isNaN(change)) change = 0;

      const bubble = document.createElement("div");
      bubble.className = "bubble";

      const color = change > 0 ? "#4CAF50" : change < 0 ? "#F44336" : "#FFC107";
      bubble.style.backgroundColor = color;
      bubble.style.width = `${Math.abs(change) * 20 + 50}px`;
      bubble.style.height = bubble.style.width;

      const label = `${stock.symbol}\n${change.toFixed(2)}%`;
      bubble.innerHTML = `<strong>${label.replace("\n", "<br>")}</strong>`;

      container.appendChild(bubble);
    });
  })
  .catch(error => console.error("Erro ao buscar dados da API Brapi:", error));
