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
    this.change = parseFloat(stock.change).toFixed(2);
    this.color = this.change >= 0 ? "#00ff00" : "#ff0000";
    this.radius = Math.min(80, 20 + Math.abs(this.change) * 15);
    this.x = Math.random() * (canvas.width - 2 * this.radius) + this.radius;
    this.y = Math.random() * (canvas.height - 2 * this.radius) + this.radius;
    this.dx = (Math.random() - 0.5) * 0.5;
    this.dy = (Math.random() - 0.5) * 0.5;
  }

  draw() {
    ctx.save();
    ctx.beginPath();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${Math.max(10, this.radius / 3)}px Arial`;
    ctx.fillText(this.ticker, this.x, this.y - 10);
    ctx.fillText(`${this.change}%`, this.x, this.y + 10);
    ctx.restore();
  }

  update(bubbles) {
    this.x += this.dx;
    this.y += this.dy;

    // bordas
    if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) this.dx *= -1;
    if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) this.dy *= -1;

    // colisão
    for (let other of bubbles) {
      if (other === this) continue;
      let dx = other.x - this.x;
      let dy = other.y - this.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      let minDist = this.radius + other.radius;

      if (dist < minDist) {
        let angle = Math.atan2(dy, dx);
        let targetX = this.x + Math.cos(angle) * minDist;
        let targetY = this.y + Math.sin(angle) * minDist;
        let ax = (targetX - other.x) * 0.05;
        let ay = (targetY - other.y) * 0.05;

        this.dx -= ax;
        this.dy -= ay;
        other.dx += ax;
        other.dy += ay;
      }
    }

    this.draw();
  }
}

let bubbles = [];

fetch("https://brapi.dev/api/quote/list?sortBy=volume&limit=25&token=5bTDfSmR2ieax6y7JUqDAD")
  .then(res => res.json())
  .then(data => {
    const stocks = data.stocks.filter(s => s.stock && s.change !== null);
    bubbles = stocks.map(s => new Bubble(s));
    animate();
  });

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    b.update(bubbles);
  }
  requestAnimationFrame(animate);
}