async function getCryptoData() {
  try {
    // Usando proxy para evitar CORS (substitua por um proxy próprio se necessário)
    const proxyUrl = 'https://corsproxy.io/?';
    const apiUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20';
    
    const response = await fetch(proxyUrl + encodeURIComponent(apiUrl), {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    if (!response.ok) throw new Error('Erro na API');
    return await response.json();
  } catch (error) {
    console.error("Falha ao buscar dados:", error);
    // Dados de fallback
    return [
      { symbol: "BTC", name: "Bitcoin", market_cap: 800000000000, current_price: 50000, price_change_percentage_24h: 2.5 },
      { symbol: "ETH", name: "Ethereum", market_cap: 400000000000, current_price: 3000, price_change_percentage_24h: -1.2 },
      { symbol: "SOL", name: "Solana", market_cap: 150000000000, current_price: 150, price_change_percentage_24h: 5.7 }
    ];
  }
}

function createBubble(crypto) {
  const bubble = document.createElement("div");
  bubble.className = `crypto-bubble ${crypto.price_change_percentage_24h >= 0 ? 'price-up' : 'price-down'}`;
  
  // Tamanho proporcional ao market cap (em bilhões)
  const size = Math.sqrt(crypto.market_cap / 1000000000) * 20;
  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;
  
  // Posição aleatória inicial
  bubble.style.left = `${Math.random() * 85}%`;
  bubble.style.top = `${Math.random() * 85}%`;
  
  // Conteúdo
  bubble.textContent = crypto.symbol.toUpperCase();
  bubble.setAttribute("title", 
    `${crypto.name}\nPreço: $${crypto.current_price.toLocaleString()}\n24h: ${crypto.price_change_percentage_24h?.toFixed(2) || 'N/A'}%`
  );
  
  document.getElementById("crypto-container").appendChild(bubble);
}

// Inicialização
(async function init() {
  const cryptos = await getCryptoData();
  cryptos.forEach(createBubble);
})();
