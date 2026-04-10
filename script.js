async function carregarDados() {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/joval-pixel/bubles/main/dados.json?nocache=" + new Date().getTime()
    );

    const data = await res.json();

    console.log("🔥 Atualizou REAL:", data);

    atualizarTela(data);
  } catch (erro) {
    console.error("Erro ao carregar:", erro);
  }
}

function atualizarTela(jogos) {
  const container = document.getElementById("jogos");
  container.innerHTML = "";

  jogos.forEach(jogo => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${jogo.jogo}</h3>
      <p>${jogo.liga} - ${jogo.min}'</p>
      <h2>Score: ${jogo.score}</h2>
      <p>⚡ ${jogo.ataques} | 🎯 ${jogo.chutes} | 🚩 ${jogo.escanteios}</p>
      <strong>${jogo.sinal}</strong>
    `;

    container.appendChild(card);
  });
}

// inicia
carregarDados();
setInterval(carregarDados, 5000);
