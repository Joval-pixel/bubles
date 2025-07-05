function showTab(tabName) {
  const buttons = document.querySelectorAll(".menu-btn");
  buttons.forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");

  console.log("Exibindo aba:", tabName);
  // Aqui você pode implementar a lógica para mudar os dados das bolhas
}

// Simulação para visual — substitua pelo seu código real de bolhas
const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Desenha algumas bolhas de exemplo
function drawBubble(x, y, radius, color, text) {
  const gradient = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
  gradient.addColorStop(0, "white");
  gradient.addColorStop(1, color);

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.closePath();

  ctx.fillStyle = "white";
  ctx.font = `${radius / 3}px Arial`;
  ctx.textAlign = "center";
  ctx.fillText(text, x, y + 5);
}

function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBubble(200, 200, 50, "#00cc00", "PETR4");
  drawBubble(400, 300, 40, "#cc0000", "VALE3");
}

drawBubbles();