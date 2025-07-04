const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

class Bubble {
  constructor(stock) {
    this.ticker = stock.stock;
    this.change = stock.change.toFixed(2);
    this.color = stock.change >= 0 ? "#00ff00" : "#ff0000";
    this.radius = Math.min(150, 30 + Math.abs(stock.change) * 50);
    this.x = Math.random() * (canvas.width - this.radius * 2) + this.radius;
    this.y = Math.random() * (canvas.height - this.radius * 2) + this.radius;
    this.dx = (Math.random() - 0.5) * 1.5;
    this.dy = (Math.random() - 0.5) * 1.5;
  }

  draw() {
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "white";
    ctx.font = `${Math.max(12, this.radius / 3)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(this.ticker, this.x, this.y - 5);
    ctx.fillText(`${this.change}%`, this.x, this.y + 15);
  }

  update() {
    if (this.x + this.radius > canvas.width || this.x - this.radius < 0) this.dx *= -1;
    if (this.y + this.radius > canvas.height || this.y - this.radius < 0) this.dy *= -1;
    this.x += this.dx;
    this.y += this.dy;
    this.draw();
  }
}

let bubbles = [];

fetch("https://brapi.dev/api/quote/list?sortBy=volume&limit=25&token=5bTDfSmR2ieax6y7JUqDAD")
  .then((res) => res.json())
  .then((data) => {
    const stocks = data.stocks.filter(s => s.stock && s.change !== null);
    bubbles = stocks.map(s => new Bubble(s));
    animate();
  });

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bubbles.forEach((b) => b.update());
  requestAnimationFrame(animate);
}