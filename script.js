document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("bubbles-container");

  try {
    const res = await fetch(`https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&token=${API_KEY}`);
    const data = await res.json();
    const stocks = data.stocks.slice(0, 50); // mostrar 50 ações mais negociadas

    stocks.forEach(stock => {
      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.innerHTML = `
        ${stock.stock}<br/>
        ${stock.close.toFixed(2)}<br/>
        <small style="color:${stock.change >= 0 ? '#0f0' : '#f00'}">
          ${stock.change.toFixed(2)}%
        </small>
      `;
      container.appendChild(bubble);
    });
  } catch (err) {
    container.innerHTML = "<p style='color:red;'>Erro ao carregar dados 😢</p>";
    console.error(err);
  }
});
