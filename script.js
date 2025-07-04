const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const data = [
  { symbol: "BBDC3", change: -0.07 },
  { symbol: "PETR3", change: 0.11 },
  { symbol: "TIMP3", change: -0.62 },
  { symbol: "MRFG3", change: 1.33 },
  { symbol: "PDGR3", change: 4.17 }
];

function drawBubble(x, y, radius, color, text) {
  const gradient = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(1, color);

  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.shadowColor = color;
  ctx.shadowBlur = 25;
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#fff";
  ctx.font = `${Math.max(radius / 4, 12)}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText(text.split("\n")[0], x, y - 10);
  ctx.fillText(text.split("\n")[1], x, y + 12);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let x = 100;
  let y = canvas.height / 2;

  data.forEach((item) => {
    const change = item.change;
    const baseSize = 30;
    const radius = baseSize + Math.abs(change) * 25;
    const color = change >= 0 ? "#00ff00" : "#ff0000";
    const text = `${item.symbol}\n${change.toFixed(2)}%`;
    drawBubble(x, y, radius, color, text);
    x += radius * 2 + 20;
  });
}

draw();

function showCategory(name) {
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
  const button = Array.from(document.querySelectorAll(".tab")).find(b => b.textContent.toLowerCase().includes(name));
  if (button) button.classList.add("active");
}