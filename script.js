document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('crypto-container');
  const loading = document.getElementById('loading');

  // Dados mockados (garantidos)
  const mockCryptos = [
    { symbol: "BTC", size: 120, price_change: 2.5, name: "Bitcoin" },
    { symbol: "ETH", size: 90, price_change: -1.2, name: "Ethereum" },
    { symbol: "SOL", size: 70, price_change: 5.7, name: "Solana" }
  ];

  // Remove a mensagem de loading
  loading.style.display = 'none';

  // Cria as bolhas
  mockCryptos.forEach(crypto => {
    const bubble = document.createElement("div");
    bubble.className = `crypto-bubble ${crypto.price_change >= 0 ? 'price-up' : 'price-down'}`;
    bubble.style.width = `${crypto.size}px`;
    bubble.style.height = `${crypto.size}px`;
    bubble.style.left = `${Math.random() * 80}%`;
    bubble.style.top = `${Math.random() * 80}%`;
    bubble.textContent = crypto.symbol;
    bubble.setAttribute('title', `${crypto.name}\nVariação 24h: ${crypto.price_change}%`);
    container.appendChild(bubble);
  });

  console.log("Bolhas criadas com sucesso!"); // Verifique no console
});
