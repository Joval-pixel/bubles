let canvas = document.getElementById("bubbleCanvas");
let ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 100;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 100;
});

let bubbles = [];

function createBubble(name, value, change) {
  let radius = 30 + Math.min(Math.abs(change), 100); // tamanho relativo à variação
  let color = change >= 0 ? "#00cc00" : "#ff3333";
  let border = "white";

  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    dx: (Math.random() - 0.5) * 0.8,
    dy: (Math.random() - 0.5) * 0.8,
    radius,
    name,
    value,
    change,
    color,
    border
  };
}

function drawBubble(b) {
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
  ctx.fillStyle = b.color;
  ctx.shadowColor = b.border;
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = b.border;
  ctx.stroke();
  ctx.closePath();

  // texto
  ctx.fillStyle = "white";
  ctx.font = `${Math.max(12, b.radius / 3)}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText(b.name, b.x, b.y);
  ctx.font = `${Math.max(10, b.radius / 4)}px Arial`;
  ctx.fillText(`${b.change.toFixed(2)}%`, b.x, b.y + 15);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bubbles.forEach((b) => {
    b.x += b.dx;
    b.y += b.dy;

    // colisão com borda
    if (b.x + b.radius > canvas.width || b.x - b.radius < 0) b.dx *= -1;
    if (b.y + b.radius > canvas.height || b.y - b.radius < 0) b.dy *= -1;

    drawBubble(b);
  });
  requestAnimationFrame(animate);
}

function loadBubbles(tipo) {
  bubbles = [];

  const ativos =
    tipo === "acoes"
      ? ["PETR4", "VALE3", "ITUB4", "BBDC4", "MGLU3", "WEGE3"]
      : ["BTC", "ETH", "ADA", "XRP", "SOL", "DOGE"];

  ativos.forEach((ticker) => {
    fetch(`https://brapi.dev/api/quote/${ticker}?token=5bTDfSmR2ieax6y7JUqDAD`)
      .then((res) => res.json())
      .then((data) => {
        const quote = data.results[0];
        const name = quote.symbol;
        const value = quote.regularMarketPrice;
        const change = quote.regularMarketChangePercent;
        bubbles.push(createBubble(name, value, change));
      });
  });
}

loadBubbles("acoes");
animate();