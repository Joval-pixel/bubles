const API_KEY = "5bTDfSmR2ieax6y7JUqDAD";
const container = document.getElementById("bubbles-container");
let data = [];

async function fetchData() {
  const res = await fetch(`https://brapi.dev/api/quote/list?token=${API_KEY}&sortBy=volume&limit=100`);
  const json = await res.json();
  data = json.stocks;
  renderBubbles();
}
fetchData();

function renderBubbles() {
  container.innerHTML = "";
  data.forEach(stock => {
    const bubble = document.createElement("div");
    const change = parseFloat(stock.change).toFixed(2);
    const colorClass = change >= 0 ? "green" : "red";
    const size = 30 + Math.min(Math.abs(change) * 5, 100);

    bubble.className = `bubble ${colorClass}`;
    bubble.style.width = size + "px";
    bubble.style.height = size + "px";
    bubble.style.top = Math.random() * (window.innerHeight - size) + "px";
    bubble.style.left = Math.random() * (window.innerWidth - size) + "px";
    bubble.innerText = `${stock.stock}\n${change}%`;
    bubble.onclick = () => openModal(stock.stock);
    container.appendChild(bubble);

    animate(bubble);
  });
}

function animate(el) {
  let dx = Math.random() * 1 - 0.5;
  let dy = Math.random() * 1 - 0.5;

  function move() {
    let x = parseFloat(el.style.left);
    let y = parseFloat(el.style.top);
    if (x <= 0 || x >= window.innerWidth - el.offsetWidth) dx *= -1;
    if (y <= 40 || y >= window.innerHeight - el.offsetHeight) dy *= -1;
    el.style.left = x + dx + "px";
    el.style.top = y + dy + "px";
    requestAnimationFrame(move);
  }
  move();
}

function openModal(ticker) {
  const modal = document.getElementById("modal");
  const iframe = document.getElementById("stockChart");
  iframe.src = `https://s.tradingview.com/widgetembed/?symbol=BMFBOVESPA:${ticker}&interval=15&theme=dark`;
  modal.style.display = "block";
}
function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function showTab(tab) {
  document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  // Em breve: filtro por categoria
}