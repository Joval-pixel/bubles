let canvas = document.getElementById("bubbleCanvas");
let ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];

function createBubble(text, value) {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.max(30, Math.min(120, Math.abs(value) * 300)),
    color: value >= 0 ? "green" : "red",
    text: text,
    value: value,
    dx: (Math.random() - 0.5) * 2,
    dy: (Math.random() - 0.5) * 2,
  };
}

function drawBubble(b) {
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fillStyle = b.color;
  ctx.shadowBlur = 25;
  ctx.shadowColor = b.color;
  ctx.fill();
  ctx.closePath();

  ctx.fillStyle = "white";
  ctx.shadowBlur = 0;
  ctx.font = `bold ${Math.max(12, b.r / 4)}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText(b.text, b.x, b.y - 10);
  ctx.fillText((b.value > 0 ? "+" : "") + b.value.toFixed(2) + "%", b.x, b.y + 15);
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    b.x += b.dx;
    b.y += b.dy;

    if (b.x < b.r || b.x > canvas.width - b.r) b.dx *= -1;
    if (b.y < b.r || b.y > canvas.height - b.r) b.dy *= -1;

    drawBubble(b);
  }
  requestAnimationFrame(animate);
}

function changeTab(tab) {
  document.querySelectorAll(".menu button").forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");
}

fetch("https://brapi.dev/api/quote/list?token=5bTDfSmR2ieax6y7JUqDAD")
  .then(res => res.json())
  .then(data => {
    const list = data.stocks.slice(0, 50);
    for (let stock of list) {
      let change = stock.change_percent || 0;
      bubbles.push(createBubble(stock.stock, change));
    }
    animate();
  });