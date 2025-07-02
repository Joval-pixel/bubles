const container = document.getElementById("bubbles");

fetch("https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=50&token=5bTDfSmR2ieax6y7JUqDAD")
  .then(res => res.json())
  .then(data => {
    const stocks = data.stocks;

    container.innerHTML = "";

    stocks.forEach((stock, index) => {
      const bubble = document.createElement("div");
      bubble.className = "bubble";

      const change = parseFloat(stock.changePercent || 0);
      const color = change > 0 ? "#21c55d" : change < 0 ? "#ef4444" : "#a3a3a3";

      const size = Math.min(Math.max(Math.abs(change) * 20 + 50, 50), 180);

      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.backgroundColor = color;

      const x = Math.random() * (window.innerWidth - size);
      const y = Math.random() * (window.innerHeight - size);

      bubble.style.left = `${x}px`;
      bubble.style.top = `${y}px`;

      const label = `${stock.stock}\n${change.toFixed(2)}%`;
      bubble.textContent = label;

      container.appendChild(bubble);
    });
  })
  .catch(error => console.error("Erro ao buscar dados:", error));