function carregarDados() {
  fetch("https://raw.githubusercontent.com/joval-pixel/bubles/main/dados.json?nocache=" + new Date().getTime())
    .then(res => res.json())
    .then(data => {
      console.log("🔥 Atualizou:", data)
      atualizarTela(data)
    })
    .catch(err => console.error("Erro:", err))
}

function atualizarTela(jogos) {
  const container = document.getElementById("jogos")
  container.innerHTML = ""

  jogos.forEach(jogo => {
    const div = document.createElement("div")
    div.className = "card"

    div.innerHTML = `
      <h2>${jogo.jogo}</h2>
      <p>${jogo.liga} - ${jogo.min}'</p>
      <h3>Score: ${jogo.score}</h3>
      <p>⚡ ${jogo.ataques} | 🎯 ${jogo.chutes} | 🚩 ${jogo.escanteios}</p>
      <strong>${jogo.sinal}</strong>
    `

    container.appendChild(div)
  })
}

// roda na hora
carregarDados()

// atualiza a cada 5 segundos 🔥
setInterval(carregarDados, 5000)
