const canvas = document.getElementById("bubbleCanvas");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;

canvas.width = width;
canvas.height = height;

let category = 'stocks';
let sector = 'Todos';
let bubbles = [];

const sectors = ["Todos", "Financeiro", "Energia", "Varejo", "Tecnologia", "Saúde", "Indústria"];
const sectorColors = {
  positivo: "rgba(0,255,0,0.7)",
  negativo: "rgba(255,0,0,0.7)",
  neutro: "rgba(128,128,128,0.7)",
};

function setCategory(cat) {
  category = cat;
  document.querySelectorAll(".menu button").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
  fetchData();
}

function setSectorFilter(filter) {
  sector = filter;
  document.querySelectorAll(".filters button").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
  draw();
}

function createSectorButtons() {
  const container = document.getElementById("sectorFilters");
  container.innerHTML = "";
  sectors.forEach(s => {
    const btn = document.createElement("button");
    btn.textContent = s;
    btn.onclick = () => setSectorFilter(s);
    if (s === "Todos") btn.classList.add("active");
    container.appendChild(btn);
  });
}

function fetchData() {
  const endpoint =
    category === "stocks"
      ? "https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=100&token=5bTDfSmR2ieax6y7JUqDAD"
      : category === "crypto"
      ? "https://brapi.dev/api/quote/crypto?token=5bTDfSmR2ieax6y7JUqDAD"
      : "https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=100&token=5bTDfSmR2ieax6y7JUqDAD";

  fetch(endpoint)
    .then(res => res.json())
    .then(data => {
      const items = data.stocks || data.coins || [];
      bubbles = items.map(item => {
        const change = parseFloat(item.change) || 0;
        const volume = parseFloat(item.volume) || 0;
        const color = change > 0 ? sectorColors.positivo : change < 0 ? sectorColors.negativo : sectorColors.neutro;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.max(20, Math.min(100, Math.abs(change) * 8 + Math.log10(volume + 1) * 2)),
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          label: `${item.stock || item.coin} ${change.toFixed(2)}%`,
          color,
          sector: item.sector || "Outros"
        };
      });
    });
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  for (let b of bubbles) {
    if (sector !== "Todos" && b.sector !== sector) continue;

    b.x += b.vx;
    b.y += b.vy;

    if (b.x < b.r || b.x > width - b.r) b.vx *= -1;
    if (b.y < b.r + 80 || b.y > height - b.r) b.vy *= -1;

    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
    ctx.fillStyle = b.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = b.color;
    ctx.fill();
    ctx.closePath();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "white";
    ctx.font = `${Math.min(14, b.r / 2)}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(b.label, b.x, b.y + 4);
  }

  requestAnimationFrame(draw);
}

window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
});

createSectorButtons();
fetchData();
draw();