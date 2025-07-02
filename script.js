const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const API_KEY = "5bTDfSmR2ieax6y7JUqDAD"; // sua chave da Brapi

// Códigos de ações B3 para exibir bolhas
const symbols = ["VALE3", "PETR4", "ITUB4", "B3SA3", "WEGE3", "AMBEV3", "CIEL3", "SUZB3", "BBAS3"];

let bubbles = [];

function fetchData() {
  const url = `https://brapi.dev/api/quote/${symbols.join(",")}?token=${API_KEY}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      bubbles = data.results.map(stock => {
        return {
          symbol: stock.symbol,
          name: stock.longName || stock.name || stock.symbol,
          change: parseFloat(stock.changePercent),
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          dx: (Math.random() - 0.5) * 2,
          dy: (Math.random() - 0.5) * 2,
          radius: Math.min(100 + Math.abs(stock.changePercent) * 8, 150),
        };
      });
    });
}

function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    // Cor verde se positiva, vermelho se negativa
    ctx.beginPath();
    ctx.fillStyle = b.change >= 0 ? "#00cc66" : "#ff3333";
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();

    // Texto centralizado
    ctx.fillStyle = "#ffffff";
    ctx.font = `${Math.max(b.radius * 0.15, 12)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(b.symbol, b.x, b.y - 5);
    ctx.font = `${Math.max(b.radius * 0.1, 10)}px Arial`;
    ctx.fillText(`${b.change.toFixed(2)}%`, b.x, b.y + 15);
  }
}

function update() {
  for (let b of bubbles) {
    b.x += b.dx;
    b.y += b.dy;

    if (b.x + b.radius > canvas.width || b.x - b.radius < 0) b.dx *= -1;
    if (b.y + b.radius > canvas.height || b.y - b.radius < 0) b.dy *= -1;
  }
}

function animate() {
  update();
  drawBubbles();
  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

fetchData();
animate();
setInterval(fetchData, 10000); // atualiza a cada 10 segundos
