function atualizarTela(data) {
  const container = document.getElementById("container")

  // limpa tudo antes
  container.innerHTML = ""

  data.forEach(jogo => {
    const card = document.createElement("div")
    card.className = "card"

    card.innerHTML = `
      <h3>${jogo.jogo}</h3>
      <p>${jogo.liga} - ${jogo.min}'</p>
      <h2>Score: ${jogo.score}</h2>
      <p>⚡ ${jogo.ataques} | 🎯 ${jogo.chutes} | 🚩 ${jogo.escanteios}</p>
      <strong>${jogo.sinal}</strong>
    `

    container.appendChild(card)
  })
}

function carregarDados() {
  fetch("https://raw.githubusercontent.com/joval-pixel/bubles/main/dados.json?nocache=" + new Date().getTime())
    .then(res => res.json())
    .then(data => {
      console.log("Atualizou 🔥", data)
      atualizarTela(data)
    })
    .catch(err => console.error("Erro:", err))
}

// roda na hora
carregarDados()

// atualiza automático
setInterval(carregarDados, 10000)
