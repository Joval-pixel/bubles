const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let tab = 'acoes';
let rankingVisible = false;

function switchTab(newTab) {
  tab = newTab;
  document.querySelectorAll("#menu button").forEach(btn => btn.classList.remove("active"));
  document.getElementById(`btn-${tab}`).classList.add("active");
  loadBubbles();
}

function toggleRanking() {
  rankingVisible = !rankingVisible;
  document.getElementById("rankingBox").classList.toggle("hidden", !rankingVisible);
}

function loadBubbles() {
  bubbles.length = 0;
  for (let i = 0; i < 25; i++) {
    const value = (Math.random() * 10 - 5).toFixed(2);
    const radius = Math.max(20, Math.abs(value) * 10 + 30);
    const color = value >= 0 ? 'green' : 'red';
    const label = `${['PETR4','VALE3','ITUB4','MGLU3','BBAS3'][i%5]} ${value}%`;
    bubbles.push(new Bubble(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      (Math.random() - 0.5) * 0.7,
      (Math.random() - 0.5) * 0.7,
      radius,
      color,
      label
    ));
  }
  draw();
}

class Bubble {
  constructor(x, y, dx, dy, r, color, text) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.r = r;
    this.color = color;
    this.text = text;
  }

  draw() {
    ctx.beginPath();
    const gradient = ctx.createRadialGradient(this.x, this.y, this.r * 0.2, this.x, this.y, this.r);
    if (this.color === 'green') {
      gradient.addColorStop(0, 'white');
      gradient.addColorStop(0.2, '#00ff00');
      gradient.addColorStop(1, '#007700');
    } else {
      gradient.addColorStop(0, 'white');
      gradient.addColorStop(0.2, '#ff0000');
      gradient.addColorStop(1, '#770000');
    }
    ctx.fillStyle = gradient;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 40;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'white';
    ctx.font = `${Math.max(10, this.r / 3)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y + 4);
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;

    // rebote nas bordas
    if (this.x + this.r > canvas.width || this.x - this.r < 0) this.dx = -this.dx;
    if (this.y + this.r > canvas.height || this.y - this.r < 0) this.dy = -this.dy;

    // colisão simples entre bolhas
    for (let other of bubbles) {
      if (other !== this) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dist = Math.hypot(dx, dy);
        const minDist = this.r + other.r;
        if (dist < minDist) {
          const angle = Math.atan2(dy, dx);
          const overlap = (minDist - dist) / 2;
          this.x += Math.cos(angle) * overlap;
          this.y += Math.sin(angle) * overlap;
          other.x -= Math.cos(angle) * overlap;
          other.y -= Math.sin(angle) * overlap;
        }
      }
    }

    this.draw();
  }
}

const bubbles = [];
loadBubbles();

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    b.update();
  }
  requestAnimationFrame(draw);
}

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  loadBubbles();
});