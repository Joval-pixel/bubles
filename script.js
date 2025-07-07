const canvas = document.getElementById('bubbleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 60;

let bubbles = [];

function randomColor(percent) {
  if (percent >= 0) {
    return "rgba(0, 180, 0, 0.8)";
  } else {
    return "rgba(220, 0, 0, 0.8)";
  }
}

function createBubbles(data) {
  bubbles = data.slice(0, 60).map((item, i) => {
    const radius = Math.max(20, Math.abs(item.changePercent * 5));
    const color = randomColor(item.changePercent);
    return {
      ...item,
      x: Math.random() * (canvas.width - 2 * radius) + radius,
      y: Math.random() * (canvas.height - 2 * radius) + radius,
      dx: (Math.random() - 0.5) * 1.5,
      dy: (Math.random() - 0.5) * 1.5,
      radius,
      color
    };
  });
}

function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bubbles.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.shadowColor = b.changePercent >= 0 ? "#00ff00" : "#ff0000";
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "white";
    ctx.font = `${Math.min(14, b.radius / 2)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(b.symbol, b.x, b.y);
  });
}

function updateBubbles() {
  bubbles.forEach(b => {
    b.x += b.dx;
    b.y += b.dy;
    if (b.x - b.radius < 0 || b.x + b.radius > canvas.width) b.dx *= -1;
    if (b.y - b.radius < 0 || b.y + b.radius > canvas.height) b.dy *= -1;
  });
}

function animate() {
  drawBubbles();
  updateBubbles();
  requestAnimationFrame(animate);
}

function loadData(type = 'stocks') {
  let url;
  if (type === 'crypto') {
    url = `https://brapi.dev/api/quote/list?token=5bTDfSmR2ieax6y7JUqDAD&type=crypto`;
  } else {
    url = `https://brapi.dev/api/quote/list?token=5bTDfSmR2ieax6y7JUqDAD&type=stocks`;
  }

  fetch(url)
    .then(res => res.json())
    .then(json => {
      const results = json.stocks || json.results || [];
      const bubbleData = results.map(item => ({
        symbol: item.stock || item.symbol,
        changePercent: item.change_percent || item.change || 0
      }));
      createBubbles(bubbleData);
    });
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 60;
});

loadData();
animate();