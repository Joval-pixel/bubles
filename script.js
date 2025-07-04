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
    this.color = this.change >= 0 ? "#3cff3c" : "#ff4d4d";
    this.radius = Math.min(100, 30 + Math.abs(this.change) * 25);
    this.x = Math.random() * (canvas.width - 2 * this.radius) + this.radius;
    this.y = Math.random() * (canvas.height - 2 * this.radius) + this.radius;
    this.dx = (Math.random() - 0.5) * 0.8;
    this.dy = (Math.random() - 0.5) * 0.8;
  }

  draw() {
    ctx.save();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "white";
    ctx.font = `${Math.max(10, this.radius / 3)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.ticker, this.x, this.y - 10);
    ctx.fillText(`${this.change}%`, this.x, this.y + 10);
    ctx.restore();
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;

    // colisão com paredes
    if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width) this.dx *= -1;
    if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) this.dy *= -1;

    // colisão com outras bolhas
    for (let other of bubbles) {
      if (other === this) continue;
      let dx = other.x - this.x;
      let dy = other.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < this.radius + other.radius) {
        this.dx *= -1;
        this.dy *= -1;
        other.dx *= -1;
        other.dy *= -1;
      }
    }

    this.draw();
  }
}

let bubbles = [];

fetch("https://brapi.dev/api/quote/list?sortBy=volume&limit=20&token=5bTDfSmR2ieax6y7JUqDAD")
  .then((res) => res.json())
  .then((data) => {
    const stocks = data.stocks.filter(s => s.stock && s.change !== null);
    bubbles = stocks.map(s => new Bubble(s));
    animate();
  });

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bubbles.forEach(b => b.update());
  requestAnimationFrame(animate);
}