
const apiKey = "5bTDfSmR2ieax6y7JUqDAD";
const symbols = ["PETR4", "VALE3", "ITUB4", "BBDC4", "MGLU3"];
const container = document.getElementById("bubble-container");

fetch(`https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=5&token=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    data.stocks.forEach(stock => {
      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.style.backgroundColor = stock.change < 0 ? "#e74c3c" : "#2ecc71";
      bubble.innerText = `${stock.symbol}
${stock.change.toFixed(2)}%`;
      bubble.style.width = bubble.style.height = `${60 + Math.abs(stock.change * 10)}px`;
      container.appendChild(bubble);
    });
  })
  .catch(err => {
    container.innerText = "Erro ao carregar dados da bolsa.";
    console.error(err);
  });
