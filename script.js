async function carregarDados() {
  try {
    const res = await fetch(
      "https://raw.githubusercontent.com/joval-pixel/bubles/main/dados.json?nocache=" + new Date().getTime(),
      {
        cache: "no-store"
      }
    );

    const data = await res.json();

    console.log("🔥 Atualizou REAL:", new Date().toLocaleTimeString(), data);

    atualizarTela(data);
  } catch (erro) {
    console.error("Erro ao carregar:", erro);
  }
}
