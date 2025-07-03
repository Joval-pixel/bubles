
fetch("https://brapi.dev/api/quote/list?sortBy=variation&sortOrder=desc&limit=30&token=5bTDfSmR2ieax6y7JUqDAD")
  .then(res => res.json())
  .then(data => {
    const stocks = data.stocks;
    const container = document.getElementById("bubbles");
    container.innerHTML = "";

    stocks.forEach(stock => {
      const bubble = document.createElement("div");
      const change = parseFloat(stock.change);
      const isPositive = change > 0;

      bubble.className = `bubble ${isPositive ? "positive" : "negative"}`;

      const variation = `${isPositive ? "+" : ""}${change.toFixed(2)}%`;
      bubble.innerHTML = `<span>${stock.stock}<br>${variation}</span>`;

      const size = Math.min(200, Math.max(60, Math.abs(change) * 8));
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;

      const posX = Math.random() * (window.innerWidth - size);
      const posY = Math.random() * (window.innerHeight - size);
      bubble.style.left = `${posX}px`;
      bubble.style.top = `${posY}px`;

      container.appendChild(bubble);
    });
  })
  .catch(err => console.error("Erro na API:", err));
