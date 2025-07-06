const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
let width, height;
let bubbles = [];

function resizeCanvas() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight - 130;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function createBubbles() {
  bubbles = [];
  for (let i = 0; i < 30; i++) {
    const size = random(30, 80);
    bubbles.push({
      x: random(size, width - size),
      y: random(size, height - size),
      vx: random(-0.7, 0.7),
      vy: random(-0.7, 0.7),
      r: size,
      color: Math.random() > 0.5 ? 'rgba(0,255,0,0.6)' : 'rgba(255,0,0,0.6)',
    });
  }
}
createBubbles();

function animate() {
  ctx.clearRect(0, 0, width, height);
  for (let b of bubbles) {
    b.x += b.vx;
    b.y += b.vy;

    if (b.x - b.r < 0 || b.x + b.r > width) b.vx *= -1;
    if (b.y - b.r < 0 || b.y + b.r > height) b.vy *= -1;

    ctx.beginPath();
    const gradient = ctx.createRadialGradient(b.x, b.y, b.r * 0.1, b.x, b.y, b.r);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, b.color);
    ctx.fillStyle = gradient;
    ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
    ctx.fill();
  }
  requestAnimationFrame(animate);
}
animate();

function changeTab(tab) {
  document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  // Troca de dados simulada
  createBubbles();
}