fetch("https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=60&token=5bTDfSmR2ieax6y7JUqDAD")
  .then(res => res.json())
  .then(data => {
    const stocks = data.stocks;
    const container = document.getElementById("bubbles");
    container.innerHTML = "";

    stocks.forEach(stock => {
      // 1) Pega a porcentagem de mudança, lidando com os dois nomes de propriedade possíveis
      let raw = stock.changePercent ?? stock.changesPercentage ?? 0;
      // 2) Se for string com "%", remove e parseia
      let change = parseFloat(raw.toString().replace("%", ""));
      if (isNaN(change)) change = 0;

      // 3) Cria a bolha
      const bubble = document.createElement("div");
      bubble.className = "bubble";

      // 4) Cor e tamanho
      const color = change > 0 ? "#4CAF50" : change < 0 ? "#F44336" : "#FFC107";
      bubble.style.backgroundColor = color;
      bubble.style.width  = `${Math.abs(change) * 20 + 50}px`;
      bubble.style.height = bubble.style.width;

      // 5) Rótulo: shortName (ou symbol) + valor formatado
      const name = stock.shortName || stock.symbol;
      const label = `${name}\n${change.toFixed(2)}%`;
      bubble.innerHTML = `<strong>${label.replace("\n", "<br>")}</strong>`;

      container.appendChild(bubble);
    });
  })
  .catch(err => console.error("Erro na API Brapi:", err));
