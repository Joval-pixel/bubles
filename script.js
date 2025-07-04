const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
let width, height;

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}
resize();
window.onresize = resize;

let bubbles = [];

function fetchData() {
  fetch("https://brapi.dev/api/quote/list?sortBy=change&sortOrder=desc&token=5bTDfSmR2ieax6y7JUqDAD")
    .then(res => res.json())
    .then(data => {
      const stocks = data.stocks.slice(0, 30);
      bubbles = stocks.map(stock => {
        const value = parseFloat(stock.change || 0);
        const radius = Math.max(30, Math.abs(value) * 20 + 30);
        return {
          label: stock.stock,
          value: value.toFixed(2) + "%",
          radius: radius,
          x: Math.random() * (width - radius * 2) + radius,
          y: Math.random() * (height - radius * 2) + radius,
          dx: (Math.random() - 0.5) * 0.5,
          dy: (Math.random() - 0.5) * 0.5,
          color: value >= 0 ? "#00ff00" : "#ff0000",
          glow: value >= 0 ? "rgba(0,255,0,0.5)" : "rgba(255,0,0,0.5)"
        };
      });
    });
}

function drawBubbles() {
  ctx.clearRect(0, 0, width, height);
  for (const b of bubbles) {
    ctx.beginPath();
    ctx.shadowBlur = 25;
    ctx.shadowColor = b.glow;
    ctx.fillStyle = b.color;
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#fff";
    ctx.font = `${Math.min(20, b.radius / 2)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(b.label, b.x, b.y - 10);
    ctx.fillText(b.value, b.x, b.y + 15);
  }
}

function animate() {
  for (const b of bubbles) {
    b.x += b.dx;
    b.y += b.dy;

    if (b.x - b.radius < 0 || b.x + b.radius > width) b.dx *= -1;
    if (b.y - b.radius < 0 || b.y + b.radius > height) b.dy *= -1;
  }

  drawBubbles();
  requestAnimationFrame(animate);
}

function setTab(tab) {
  document.querySelectorAll(".tab").forEach(btn => btn.classList.remove("active"));
  document.querySelector(`.tab:contains(${tab.charAt(0).toUpperCase() + tab.slice(1)})`)?.classList.add("active");
  fetchData();
}

fetchData();
animate();
setInterval(fetchData, 30000);