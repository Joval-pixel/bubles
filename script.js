fetch("https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=5&token=SEU_TOKEN_AQUI")
  .then(res => res.json())
  .then(data => {
    const stocks = data.stocks;
    const container = document.getElementById("bubbles");
    container.innerHTML = "";

    const MAX_SIZE = 200; // px — tamanho máximo da bolha

    stocks.forEach(stock => {
      const bubble = document.createElement("div");
      bubble.className = "bubble";

      // calcula variação em %
      const change = parseFloat(stock.changePercent);

      // escolhe cor
      const color = change > 0 
        ? "#4CAF50" 
        : change < 0 
          ? "#F44336" 
          : "#FFC107";

      // calcula tamanho base (pode ajustar o multiplicador)
      const rawSize = Math.abs(change) * 20 + 50;

      // aplica limite máximo
      const size = Math.min(rawSize, MAX_SIZE);

      bubble.style.backgroundColor = color;
      bubble.style.width  = `${size}px`;
      bubble.style.height = `${size}px`;

      // conteúdo texto
      bubble.innerHTML = `
        <strong>${stock.stock}</strong><br>
        ${change.toFixed(2)}%
      `;

      container.appendChild(bubble);
    });
  })
  .catch(error => console.error("Erro ao buscar dados da API Brapi:", error));
