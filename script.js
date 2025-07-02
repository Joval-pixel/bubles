fetch("https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=60&token=5bTDfSmR2ieax6y7JUqDAD")
  .then(res => res.json())
  .then(data => {
    console.log(data.stocks.slice(0,3)); // <-- veja no console como vêm os campos
    const stocks = data.stocks || [];
    const container = document.getElementById("bubbles");
    container.innerHTML = "";

    stocks.forEach(stock => {
      // pega o campo correto:
      // note: o retorno vem como "-1.23%", com o % no final
      let raw = stock.changesPercentage ?? "0%";
      raw = raw.replace("%","");       // tira o “%”
      let change = parseFloat(raw);    // converte pra número
      if (isNaN(change)) change = 0;

      // rótulo: shortName ou símbolo
      const label = `${stock.shortName || stock.symbol}\n${change.toFixed(2)}%`;

      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.textContent = label;

      // cor
      bubble.style.backgroundColor =
        change > 0  ? "#4CAF50" :
        change < 0  ? "#F44336" :
                      "#FFC107";

      // tamanho
      const size = Math.abs(change) * 20 + 50;
      bubble.style.width  = `${size}px`;
      bubble.style.height = `${size}px`;

      container.appendChild(bubble);
    });
  })
  .catch(err => {
    console.error("Erro na API Brapi:", err);
    document.getElementById("bubbles").textContent = "Erro carregando dados.";
  });
