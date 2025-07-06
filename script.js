const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let bubbles = [];

function createBubbles() {
  bubbles = [];
  const tickers = [
    "PETR4", "VALE3", "ITUB4", "BBDC4", "BBAS3", "ABEV3", "WEGE3", "MGLU3", "LREN3", "JBSS3",
    "RENT3", "B3SA3", "BRFS3", "CSNA3", "ELET3", "GGBR4", "USIM5", "BRKM5", "RAIL3", "EGIE3",
    "ENBR3", "NTCO3", "PRIO3", "HAPV3", "TIMS3", "COGN3", "YDUQ3", "EMBR3", "VIIA3", "AZUL4",
    "CMIG4", "CCRO3", "PETZ3", "CYRE3", "BRML3", "MULT3", "MRVE3", "CVCB3", "SOMA3", "BPAC11",
    "LWSA3", "TOTS3", "QUAL3", "CRFB3", "IGTI11", "BEEF3", "GMAT3", "HYPE3", "ARZZ3", "DXCO3",
    "SLCE3", "RRRP3", "MOVI3", "ALPA4", "SMTO3", "VBBR3", "NEOE3", "SANB11", "MEAL3", "MRFG3"
  ];

  for (let i = 0; i < 60; i++) {
    const value = (Math.random() * 10 - 5).toFixed(2);
    const isPositive = value >= 0;
    const size = 20 + Math.abs(value) * 5;

    bubbles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: size,
      dx: Math.random() * 0.6 - 0.3,
      dy: Math.random() * 0.6 - 0.3,
      value,
      ticker: tickers[i],
      color: isPositive ? "#006400" : "#cc0000", // verde escuro vivo ou vermelho vivo
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

    // Nome da ação
    ctx.font = `${Math.max(b.r / 4, 10)}px Arial`;
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 0;
    ctx.textAlign = "center";
    ctx.fillText(b.ticker, b.x, b.y - b.r / 4);

    // Variação
    ctx.font = `${Math.max(b.r / 4, 10)}px Arial`;
    ctx.fillText(`${b.value}%`, b.x, b.y + b.r / 6);
  }
}

function updateBubbles() {
  for (let b of bubbles) {
    b.x += b.dx;
    b.y += b.dy;

    if (b.x - b.r < 0 || b.x + b.r > canvas.width) b.dx *= -1;
    if (b.y - b.r < 0 || b.y + b.r > canvas.height) b.dy *= -1;
  }
}

function animate() {
  updateBubbles();
  drawBubbles();
  requestAnimationFrame(animate);
}

createBubbles();
animate();