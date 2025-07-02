fetch("https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=5&token=5bTDfSmR2ieax6y7JUqDAD")
  .then(res => res.json())
  .then(data => {
    const stocks = data.stocks;
    const container = document.getElementById("bubbles");
    container.innerHTML = "";

    stocks.forEach(stock => {
      const changeAbs = stock.change;
      const percent = (changeAbs / stock.close) * 100;
      const color = percent > 0 ? "#4CAF50" : percent < 0 ? "#F44336" : "#FFC107";
      const size = Math.abs(percent) * 20 + 50;

      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.style.backgroundColor = color;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;

      // aqui uso stock.name (nome completo) e o percent calculado
      bubble.innerHTML = `
        <strong>${stock.name}</strong><br>
        ${percent.toFixed(2)}%
      `;

      container.appendChild(bubble);
    });
  })
  .catch(error => console.error("Erro ao buscar dados da API Brapi:", error));
