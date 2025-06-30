
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("bubbles-container");
  const stocks = ["PETR4", "VALE3", "ITUB4", "MGLU3", "B3SA3"];

  stocks.forEach(stock => {
    const div = document.createElement("div");
    div.className = "bubble";
    div.innerText = stock;
    container.appendChild(div);
  });
});
