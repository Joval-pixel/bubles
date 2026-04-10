function carregarDados() {
  fetch("https://api.github.com/repos/joval-pixel/bubles/contents/dados.json")
    .then(res => res.json())
    .then(res => {
      const conteudo = atob(res.content)
      const data = JSON.parse(conteudo)

      console.log("🔥 Atualizou REAL:", data)

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

// atualiza a cada 5 segundos
setInterval(carregarDados, 5000)
