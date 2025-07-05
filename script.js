function setTab(tabName) {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(t => t.classList.remove("active"));
  const btn = Array.from(tabs).find(t => t.textContent === (tabName === "acoes" ? "Ações" : "Cripto"));
  if (btn) btn.classList.add("active");

  // Aqui você pode depois trocar os dados carregados das bolhas:
  if (tabName === "acoes") {
    createBubbles(); // carrega ações
  } else {
    // criar um novo createBubblesCripto() depois
    alert("Aba Cripto ainda em desenvolvimento");
  }
}