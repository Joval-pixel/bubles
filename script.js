const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let bubbles = [];

function resizeCanvas() {
  const isMobile = window.innerWidth <= 768;
  const sidePanelWidth = isMobile ? 0 : 220;
  canvas.width = window.innerWidth - sidePanelWidth;
  canvas.height = window.innerHeight;
  drawBubbles();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function getRandomBubble() {
  const tickers = ["VALE3", "PETR4", "ITUB4", "ARML3", "SEQL3", "EMET11", "PDGR3", "MRVE3", "AZEV4"];
  const name = tickers[Math.floor(Math.random() * tickers.length)];
  const change = (Math.random() * 6 - 3).toFixed(2); // -3% a +3%
  return {
    name,
    change: parseFloat(change),
    radius: 30 + Math.abs(change) * 10,
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    dx: Math.random() * 1 - 0.5,
    dy: Math.random() * 1 - 0.5,
  };
}

function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let bubble of bubbles) {
    bubble.x += bubble.dx;
    bubble.y += bubble.dy;

    // bordas
    if (bubble.x < bubble.radius || bubble.x > canvas.width - bubble.radius) bubble.dx *= -1;
    if (bubble.y < bubble.radius || bubble.y > canvas.height - bubble.radius) bubble.dy *= -1;

    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.radius, 0, 2 * Math.PI);
    ctx.fillStyle = bubble.change >= 0 ? "limegreen" : "red";
    ctx.shadowColor = bubble.change >= 0 ? "limegreen" : "red";
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    // texto
    ctx.fillStyle = "white";
    ctx.font = `${Math.max(10, bubble.radius / 3)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(`${bubble.name}`, bubble.x, bubble.y - 5);
    ctx.fillText(`${bubble.change}%`, bubble.x, bubble.y + 12);
  }
}

function animate() {
  drawBubbles();
  requestAnimationFrame(animate);
}

function updateSidebar() {
  const sorted = [...bubbles].sort((a, b) => b.change - a.change);
  const top = sorted.slice(0, 3);
  const bottom = sorted.slice(-3).reverse();
  const volume = sorted.sort((a, b) => b.radius - a.radius).slice(0, 3);

  const format = (b) => `<li>${b.name} <b>${b.change > 0 ? "+" : ""}${b.change.toFixed(2)}%</b></li>`;

  document.getElementById("altas").innerHTML = top.map(format).join("");
  document.getElementById("quedas").innerHTML = bottom.map(format).join("");
  document.getElementById("volume").innerHTML = volume.map(format).join("");
}

// Inicialização
for (let i = 0; i < 80; i++) {
  bubbles.push(getRandomBubble());
}

setInterval(updateSidebar, 3000);
animate();