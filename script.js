const container = document.getElementById("bubbles");

fetch("https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=100&token=5bTDfSmR2ieax6y7JUqDAD")
  .then((res) => res.json())
  .then((data) => {
    const stocks = data.stocks;

    container.innerHTML = "";

    stocks.forEach((stock) => {
      const change = parseFloat(stock.changePercent);
      const volume = parseFloat(stock.volume || 1);

      const bubble = document.createElement("div");
      bubble.className = "bubble " + (change >= 0 ? "positive" : "negative");

      const size = Math.min(200, Math.max(50, Math.abs(change) * 10 + Math.log10(volume) * 5));
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;

      // Posição aleatória (limitada à tela)
      const posX = Math.random() * (window.innerWidth - size);
      const posY = Math.random() * (window.innerHeight - size);
      bubble.style.left = `${posX}px`;
      bubble.style.top = `${posY}px`;

      const changeFormatted = `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;

      bubble.innerHTML = `<span>${stock.stock}<br>${changeFormatted}</span>`;

      container.appendChild(bubble);
    });
  })
  .catch((err) => {
    console.error("Erro ao carregar dados da Brapi:", err);
  });