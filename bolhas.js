
const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Bubble {
  constructor() {
    this.radius = Math.random() * 60 + 20;
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + this.radius;
    this.dy = Math.random() * -1.5 - 0.5;
    this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
  }
  update() {
    this.y += this.dy;
    if (this.y + this.radius < 0) {
      this.y = canvas.height + this.radius;
      this.x = Math.random() * canvas.width;
    }
    this.draw();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

const bubbles = Array.from({ length: 60 }, () => new Bubble());

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bubbles.forEach(b => b.update());
  requestAnimationFrame(animate);
}

animate();
