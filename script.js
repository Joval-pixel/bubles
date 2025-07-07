const bolhasContainer = document.getElementById('bolhas-container');

function criarBolha(nome, variacao) {
  const bolha = document.createElement('div');
  bolha.classList.add('bubble');
  bolha.classList.add(variacao >= 0 ? 'up' : 'down');
  bolha.style.width = bolha.style.height = `${40 + Math.abs(variacao) * 3}px`;
  bolha.innerHTML = `<div>${nome}</div><div>${variacao.toFixed(2)}%</div>`;
  bolha.style.left = `${Math.random() * (window.innerWidth - 100)}px`;
  bolha.style.top = `${Math.random() * (window.innerHeight - 100)}px`;
  bolhasContainer.appendChild(bolha);
}

function carregarBolhas() {
  bolhasContainer.innerHTML = '';
  const exemplos = [
    { nome: 'PETR4', variacao: 1.5 },
    { nome: 'VALE3', variacao: -2.3 },
    { nome: 'ITUB4', variacao: 0.8 },
    { nome: 'BBDC4', variacao: -1.1 },
  ];
  exemplos.forEach(({ nome, variacao }) => criarBolha(nome, variacao));
}

function mostrarAcoes() {
  carregarBolhas();
}

function mostrarCriptos() {
  bolhasContainer.innerHTML = '';
  const exemplos = [
    { nome: 'BTC', variacao: 2.2 },
    { nome: 'ETH', variacao: -3.4 },
    { nome: 'ADA', variacao: 1.9 },
  ];
  exemplos.forEach(({ nome, variacao }) => criarBolha(nome, variacao));
}

window.onload = carregarBolhas;
