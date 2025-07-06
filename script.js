function showTab(tab) {
  document.querySelectorAll('.tabs button').forEach(btn => btn.classList.remove('active'));
  const button = Array.from(document.querySelectorAll('.tabs button')).find(b => b.textContent.toLowerCase() === tab);
  if (button) button.classList.add('active');

  // Aqui você pode ativar os dados por aba (ações, criptos, etc.)
  console.log("Trocar para a aba:", tab);
}

// Exemplo visual de bolhas (simulação temporária)
const container = document.getElementById('bubble-container');
for (let i = 0; i < 20; i++) {
  const bubble = document.createElement('div');
  const size = Math.random() * 80 + 30;
  bubble.style.width = size + 'px';
  bubble.style.height = size + 'px';
  bubble.style.position = 'absolute';
  bubble.style.left = Math.random() * 100 + '%';
  bubble.style.top = Math.random() * 100 + '%';
  bubble.style.borderRadius = '50%';
  bubble.style.background = Math.random() > 0.5 ? 'rgba(0,255,0,0.5)' : 'rgba(255,0,0,0.5)';
  container.appendChild(bubble);
}