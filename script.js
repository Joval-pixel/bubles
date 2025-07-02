const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const API_KEY = "5bTDfSmR2ieax6y7JUqDAD";
const tickers = ["VALE3", "PETR4", "ITUB4", "ABEV3", "BBAS3", "CIEL3"];

let bubbles = [];

function fetchData() {
  fetch(`https://brapi.dev/api/quote/${tickers.join(",")}?token=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      console.log("Dados recebidos:", data);
      if (!data.results || data.results.length === 0) {
        console.error("Nenhuma ação retornada da API!");
        return;
      }

      bubbles = data.results.map((stock, index) => {
        const change = stock.change || 0;
        const radius = Math.max(30, Math.min(Math.abs(change) * 20, 150));
        return {
          symbol: stock.stock,
          name: stock.name,
          change: change,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: radius,
          color: change >= 0 ? "#00cc66" : "#ff3333",
          dx: (Math.random() - 0.5) * 2,
          dy: (Math.random() - 0.5) * 2
        };
      });
    })
    .catch(error => {
      console.error("Erro ao buscar dados:", error);
    });
}

function drawBubbles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bubbles.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fillStyle = b.color;
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(b.symbol, b.x, b.y - 10);
    const changeText = isNaN(b.change) ? "N/A" : `${b.change.toFixed(2)}%`;
    ctx.fillText(changeText, b.x, b.y + 10);

    b.x += b.dx;
    b.y += b.dy;

    if (b.x + b.radius > canvas.width || b.x - b.radius < 0) b.dx *= -1;
    if (b.y + b.radius > canvas.height || b.y - b.radius < 0) b.dy *= -1;
  });
  requestAnimationFrame(drawBubbles);
}

fetchData();
setInterval(fetchData, 60000);
drawBubbles();