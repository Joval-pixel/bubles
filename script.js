
const API_KEY = "5bTDfSmR2ieax6y7JUqDAD";

function carregarBolhas() {
  fetch(`https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=50&token=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("bubbles");
      container.innerHTML = "";
      data.stocks.forEach(stock => {
        const change = parseFloat(stock.changePercent);
        const bubble = document.createElement("div");
        bubble.className = "bubble";
        bubble.style.backgroundColor = change > 0 ? "#4caf50" : change < 0 ? "#f44336" : "#999";
        bubble.style.width = bubble.style.height = `${Math.min(200, Math.abs(change) * 20 + 50)}px`;
        bubble.textContent = `${stock.stock}\n${change.toFixed(2)}%`;
        bubble.onclick = () => abrirGrafico(stock.stock);
        bubble.setAttribute("data-setor", stock.sector || "Desconhecido");
        container.appendChild(bubble);
      });
    });
}

function filtrarSetor(setor) {
  const bolhas = document.querySelectorAll(".bubble");
  bolhas.forEach(b => {
    const setorBolha = b.getAttribute("data-setor");
    b.style.display = setor === "Todos" || setorBolha === setor ? "flex" : "none";
  });
}

function abrirGrafico(ticker) {
  const modal = document.getElementById("modal-grafico");
  const frame = document.getElementById("grafico-frame");
  frame.src = `https://s.tradingview.com/widgetembed/?symbol=BMFBOVESPA%3A${ticker}&interval=15&theme=dark&style=1`;
  modal.style.display = "block";
}

function fecharModal() {
  document.getElementById("modal-grafico").style.display = "none";
}

document.addEventListener("DOMContentLoaded", carregarBolhas);
