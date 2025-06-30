// Código de exemplo para animação de bolhas
const container = document.getElementById('bubbles-container');
for (let i = 0; i < 50; i++) {
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.style.left = Math.random() * 100 + 'vw';
  bubble.style.animationDuration = 2 + Math.random() * 3 + 's';
  container.appendChild(bubble);
}
