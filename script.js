function createBubbleElement(data) {
  const bubble = document.createElement("div");
  bubble.className = "bubble";

  const variation = parseFloat(data.changePercent);
  const isPositive = variation >= 0;

  const size = 60 + Math.min(Math.abs(variation) * 3, 120); // tamanho proporcional

  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;
  bubble.style.background = isPositive ? "#00ff4c" : "#ff1e1e";
  bubble.style.boxShadow = `0 0 20px ${isPositive ? "#00ff4c" : "#ff1e1e"}`;
  bubble.style.color = "#fff";
  bubble.style.fontSize = `${Math.max(size / 6, 12)}px`;

  // Texto da bolha
  bubble.innerHTML = `
    <div style="font-weight:bold;">${data.symbol}</div>
    <div>${variation.toFixed(2)}%</div>
  `;

  // Posicionamento aleatório e movimento leve
  bubble.style.position = "absolute";
  bubble.style.left = `${Math.random() * (window.innerWidth - size)}px`;
  bubble.style.top = `${Math.random() * (window.innerHeight - size)}px`;

  // Animação rebote
  let dx = (Math.random() - 0.5) * 0.8;
  let dy = (Math.random() - 0.5) * 0.8;

  function move() {
    let rect = bubble.getBoundingClientRect();
    let x = rect.left + dx;
    let y = rect.top + dy;

    if (x < 0 || x + size > window.innerWidth) dx *= -1;
    if (y < 0 || y + size > window.innerHeight) dy *= -1;

    bubble.style.left = `${rect.left + dx}px`;
    bubble.style.top = `${rect.top + dy}px`;

    requestAnimationFrame(move);
  }

  requestAnimationFrame(move);
  return bubble;
}

// Exemplo com dados fictícios (substitua pela sua API real)
const dataExemplo = [
  { symbol: "PETR4", changePercent: "2.34" },
  { symbol: "VALE3", changePercent: "-1.18" },
  { symbol: "ITUB4", changePercent: "0.76" },
  { symbol: "MGLU3", changePercent: "-3.52" },
  { symbol: "WEGE3", changePercent: "1.42" },
];

dataExemplo.forEach((d) => {
  const b = createBubbleElement(d);
  document.body.appendChild(b);
});