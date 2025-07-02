fetch("https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=60&token=5bTDfSmR2ieax6y7JUqDAD")
  .then(res => res.json())
  .then(data => {
    const stocks = data.stocks || [];
    const container = document.getElementById("bubbles");
    container.innerHTML = "";

    stocks.forEach(stock => {
      // 1) busca o campo correto
      let raw = stock.changePercent ?? stock.changesPercentage ?? 0;
      raw = raw.toString().replace("%","");

      // 2) valor numérico
      let change = parseFloat(raw);
      if (isNaN(change)) change = 0;

      // 3) monta a bolha
      const bubble = document.createElement("div");
      bubble.className = "bubble";

      // cor e tamanho
      const color = change > 0 ? "#4CAF50"
                   : change < 0 ? "#F44336"
                   : "#FFC107";
      bubble.style.backgroundColor = color;
      const size = Math.abs(change) * 20 + 50;
      bubble.style.width  = `${size}px`;
      bubble.style.height = `${size}px`;

      // rótulo
      const name = stock.shortName || stock.symbol;
      bubble.innerHTML = `<strong>${name}<br>${change.toFixed(2)}%</strong>`;

      container.appendChild(bubble);
    });
  })
  .catch(err => {
    console.error("Erro na API Brapi:", err);
    document.getElementById("bubbles").textContent = "Erro carregando dados.";
  });
