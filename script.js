const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];

function loadData(type) {
  let url = "";
  const token = "5bTDfSmR2ieax6y7JUqDAD";

  if (type === "acoes") url = `https://brapi.dev/api/quote/list?token=${token}&limit=100`;
  else if (type === "criptos") url = `https://brapi.dev/api/crypto?token=${token}`;
  else if (type === "commodities") url = `https://brapi.dev/api/quote/commodities?token=${token}`;
  else if (type === "opcoes") url = `https://brapi.dev/api/quote/list?token=${token}&limit=100&sortBy=volume_desc`;
  else if (type === "frequencia") url = `https://brapi.dev/api/quote/list?token=${token}&limit=60&sortBy=volume_desc`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const items = data.stocks || data.coins || data.results || [];
      createBubbles(items);
    });
}

function createBubbles(data) {
  bubbles = data.map((item) => {
    const symbol = item.symbol || item.name || "???";
    const price = parseFloat(item.regularMarketPrice || item.price || item.lastPrice || 0);
    const change = parseFloat(item.change || item.regularMarketChangePercent || 0);
    const volume = parseFloat(item.volume || item.regularMarketVolume || 1000);
    const radius = Math.max(20, Math.min(50, volume / 30000));

    let color = "#555";
    if (change > 0) color = "#006400";      // Verde escuro
    else if (change < 0) color = "#8B0000"; // Vermelho escuro

    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: radius,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
      symbol,
      price: `R$${price.toFixed(2).replace(".", ",")}`,
      color,
    };
  });
}

function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const b of bubbles) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
    ctx.fillStyle = b.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.fillStyle = "white";
    ctx.font = `${Math.max(10, b.r / 2)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(b.symbol, b.x, b.y - 5);
    ctx.fillText(b.price, b.x, b.y + 12);
  }
}

function update() {
  for (const b of bubbles) {
    b.x += b.dx;
    b.y += b.dy;

    if (b.x + b.r > canvas.width || b.x - b.r < 0) b.dx *= -1;
    if (b.y + b.r > canvas.height || b.y - b.r < 0) b.dy *= -1;
  }
}

function animate() {
  drawBubbles();
  update();
  requestAnimationFrame(animate);
}

loadData("acoes");
animate();