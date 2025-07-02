fetch("https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=5&token=SEU_TOKEN_AQUI")
  .then(res => res.json())
  .then(data => {
    const stocks = data.stocks;
    const container = document.getElementById("bubbles");
    container.innerHTML = "";

    const MAX_SIZE = 200; // px — você pode ajustar

    stocks.forEach(stock => {
      const bubble = document.createElement("div");
      bubble.className = "bubble";

      // pego o % de mudança: se existir changesPercentage uso ela, senão uso change (valor absoluto)
      // e transformo em número. Se vier como string "3.14%", tiro o % antes.
      let changePercent;
      if (stock.changesPercentage) {
        changePercent = parseFloat(stock.changesPercentage.replace("%",""));
      } else {
        changePercent = parseFloat(stock.change);
      }

      // cor
      const color = changePercent > 0
        ? "#4CAF50"
        : changePercent < 0
          ? "#F44336"
          : "#FFC107";

      // tamanho bruto
      const rawSize = Math.abs(changePercent) * 20 + 50;

      // aplico limite
      const size = Math.min(rawSize, MAX_SIZE);

      bubble.style.backgroundColor = color;
      bubble.style.width  = `${size}px`;
      bubble.style.height = `${size}px`;

      // texto interno
      bubble.innerHTML = `
        <strong>${stock.stock}</strong><br>
        ${changePercent.toFixed(2)}%
      `;

      container.appendChild(bubble);
    });
  })
  .catch(err => console.error("Erro na Brapi:", err));
