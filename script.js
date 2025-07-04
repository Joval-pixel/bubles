document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('crypto-container');
  const loading = document.getElementById('loading');

  // Dados mockados (fallback)
  const mockCryptos = [
    { symbol: "BTC", size: 120, price_change: 2.5, name: "Bitcoin" },
    { symbol: "ETH", size: 90, price_change: -1.2, name: "Ethereum" },
    { symbol: "SOL", size: 70, price_change: 5.7, name: "Solana" },
    { symbol: "ADA", size: 60, price_change: -0.8, name: "Cardano" },
    { symbol: "DOGE", size: 50, price_change: 3.1, name: "Dogecoin" }
  ];

  loading.style.display = 'none';

  mockCryptos.forEach(crypto => {
    const bubble = document.createElement("div");
    bubble.className = `crypto-bubble ${crypto.price_change >= 0 ? 'price-up' : 'price-down'}`;
    bubble.style.width = `${crypto.size}px`;
    bubble.style.height = `${crypto.size}px`;
    bubble.style.left = `${Math.random() * 80}%`;
    bubble.style.top = `${Math.random() * 80}%`;
    bubble.textContent = crypto.symbol;
    bubble.setAttribute('title', `${crypto.name}\n24h: ${crypto.price_change}%`);
    container.appendChild(bubble);
  });
});
