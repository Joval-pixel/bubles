const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];

function createBubbles() {
  bubbles = [];
  for (let i = 0; i < 60; i++) {
    const value = (Math.random() * 10 - 5).toFixed(2);
    const isPositive = value >= 0;
    const size = 20 + Math.abs(value) * 6;

    bubbles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: size,
      dx: Math.random() * 1.5 - 0.75,
      dy: Math.random() * 1.5 - 0.75,
      value,
      color: isPositive ? "#006400" : "#cc0000", // verde escuro ou vermelho vivo
      border: "#ffffff"
    });
  }
}

function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = b.color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = b.border;
    ctx.stroke();

    ctx.font = `${Math.max(b.r / 3, 10)}px Arial`;
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 0;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${b.value}%`, b.x, b.y);
  }
}

function moveBubbles() {
  for (let b of bubbles) {
    b.x += b.dx;
    b.y += b.dy;

    if (b.x + b.r > canvas.width || b.x - b.r < 0) b.dx *= -1;
    if (b.y + b.r > canvas.height || b.y - b.r < 0) b.dy *= -1;

    // colisão simples
    for (let other of bubbles) {
      if (b === other) continue;
      const dx = b.x - other.x;
      const dy = b.y - other.y;
      const dist = Math.hypot(dx, dy);
      if (dist < b.r + other.r) {
        b.dx *= -1;
        b.dy *= -1;
      }
    }
  }
}

function animate() {
  drawBubbles();
  moveBubbles();
  requestAnimationFrame(animate);
}

createBubbles();
animate();

function showTab(name) {
  document.querySelectorAll(".tab").forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");
  // por enquanto mantém as bolhas fixas
}