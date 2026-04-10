function carregarDados() {
  fetch("https://raw.githubusercontent.com/joval-pixel/bubles/main/dados.json?nocache=" + new Date().getTime())
    .then(res => res.json())
    .then(data => {
      console.log("Atualizou dados 🔥", data)

      // AQUI chama sua função que monta os cards
      atualizarTela(data)
    })
}

// roda na hora
carregarDados()

// 🔥 atualiza a cada 10 segundos
setInterval(carregarDados, 10000)
