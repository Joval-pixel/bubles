function selectTab(tabName) {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  const selected = Array.from(tabs).find(btn => btn.textContent.toLowerCase().includes(tabName));
  if (selected) selected.classList.add('active');

  // Troca de conteúdo futura pode ser feita aqui
  console.log("Selecionado:", tabName);
}

// Inicialização das bolhas simuladas
const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');
resizeCanvas();

let bubbles = Array.from({ length: 30 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: 20 + Math.random() * 40,
  color: Math.random() > 0.5 ? 'red' : 'green',
  dx: (Math.random() - 0.5) * 2,
  dy: (Math.random() - 0.5) * 2
}));

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let b of bubbles) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
    ctx.fillStyle = b.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = b.color;
    ctx.fill();
    b.x += b.dx;
    b.y += b.dy;

    // Rebote nas bordas
    if (b.x - b.r < 0 || b.x + b.r > canvas.width) b.dx *= -1;
    if (b.y - b.r < 0 || b.y + b.r > canvas.height) b.dy *= -1;
  }
  requestAnimationFrame(animate);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 150;
}
window.addEventListener('resize', resizeCanvas);
animate();