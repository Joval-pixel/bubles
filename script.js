const container = document.getElementById("bubbles");

const dadosFicticios = [
  { stock: "PETR4", changePercent: 2.45, volume: 30000000 },
  { stock: "VALE3", changePercent: -1.23, volume: 25000000 },
  { stock: "ITUB4", changePercent: 0.75, volume: 18000000 },
];

dadosFicticios.forEach((stock) => {
  const change = stock.changePercent;
  const volume = stock.volume;

  const bubble = document.createElement("div");
  bubble.className = "bubble " + (change >= 0 ? "positive" : "negative");

  const size = Math.min(200, Math.max(50, Math.abs(change) * 10 + Math.log10(volume) * 5));
  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;

  const posX = Math.random() * (window.innerWidth - size);
  const posY = Math.random() * (window.innerHeight - size);
  bubble.style.left = `${posX}px`;
  bubble.style.top = `${posY}px`;

  const changeFormatted = `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;

  bubble.innerHTML = `<span>${stock.stock}<br>${changeFormatted}</span>`;

  container.appendChild(bubble);
});