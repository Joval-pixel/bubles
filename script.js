const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];

function createBubble(text, value, color) {
  const radius = 40 + Math.abs(value) * 10;
  return {
    x: Math.random() * (canvas.width - radius * 2) + radius,
    y: Math.random() * (canvas.height - radius * 2) + radius,
    r: radius,
    dx: (Math.random() - 0.5) * 1.5,
    dy: (Math.random() - 0.5) * 1.5,
    text,
    value,
    color
  };
}

function drawBubble(b) {
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fillStyle = b.color;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "white";
  ctx.stroke();
  ctx.closePath();

  ctx.fillStyle = "white";
  ctx.font = `${b.r / 3}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText(b.text, b.x, b.y - 5);
  ctx.fillText(`${b.value.toFixed(2)}%`, b.x, b.y + b.r / 4);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bubbles.forEach(b => {
    b.x += b.dx;
    b.y += b.dy;

    // bounce
    if (b.x + b.r > canvas.width || b.x - b.r < 0) b.dx *= -1;
    if (b.y + b.r > canvas.height || b.y - b.r < 0) b.dy *= -1;

    drawBubble(b);
  });

  requestAnimationFrame(animate);
}

function initBubbles() {
  bubbles = [];
  const tickers = [
    { name: "PETR4", value: 1.24 },
    { name: "VALE3", value: -0.75 },
    { name: "ITUB4", value: 2.15 },
    { name: "BBDC4", value: -1.02 },
    { name: "BBAS3", value: 0.58 },
    { name: "MGLU3", value: -2.37 }
  ];

  tickers.forEach(t => {
    const color = t.value >= 0 ? "#009933" : "#cc0000"; // verde escuro ou vermelho vivo
    bubbles.push(createBubble(t.name, t.value, color));
  });
}

function changeCategory(cat) {
  document.querySelectorAll("button").forEach(btn => btn.classList.remove("active"));
  const btn = [...document.querySelectorAll("button")].find(b => b.textContent.toLowerCase().includes(cat));
  if (btn) btn.classList.add("active");
  initBubbles(); // Simula troca de dados
}

initBubbles();
animate();