const container = document.getElementById("bubble-container");

fetch("https://brapi.dev/api/quote/VALE3,PETR4,ITUB4,PRIO3,BBAS3?token=5bTDfSmR2ieax6y7JUqDAD")
  .then((res) => res.json())
  .then((data) => {
    data.results.forEach((stock, i) => {
      if (stock.changePercent === null) return;

      const change = parseFloat(stock.changePercent);
      const bubble = document.createElement("div");
      bubble.className = "bubble";

      const size = 80 + Math.abs(change) * 10;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.backgroundColor = change > 0 ? "green" : change < 0 ? "red" : "gray";
      bubble.style.left = `${Math.random() * 80}%`;
      bubble.style.top = `${Math.random() * 80}%`;

      bubble.innerText = `${stock.symbol} ${change.toFixed(2)}%`;
      container.appendChild(bubble);
    });
  })
  .catch((error) => {
    console.error("Erro ao buscar dados:", error);
  });