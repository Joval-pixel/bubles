const container = document.getElementById("bubble-container");

const symbols = "VALE3,PETR4,ITUB4,PRIO3,BBAS3";
const token = "5bTDfSmR2ieax6y7JUqDAD";
const url = `https://brapi.dev/api/quote/${symbols}?token=${token}`;

fetch(url)
  .then(res => res.json())
  .then(data => {
    if (!data.results || !Array.isArray(data.results)) {
      console.error("Erro na resposta da API:", data);
      return;
    }

    data.results.forEach(stock => {
      const change = stock.changePercent;

      // Verifica se o valor existe e é um número
      if (change === null || isNaN(change)) {
        console.warn(`Sem dados de variação para ${stock.symbol}`);
        return;
      }

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
  .catch(error => {
    console.error("Erro ao buscar dados:", error);
  });