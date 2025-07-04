async function getCryptoData() {
  try {
    // Opção 1: Proxy confiável (substitua YOUR_API_KEY se tiver)
    const apiUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20';
    const response = await fetch(`https://cors-anywhere.herokuapp.com/${apiUrl}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    // Opção 2: Se falhar, use dados mockados (remova o comentário abaixo)
    // return mockData();

    if (!response.ok) throw new Error('Erro na API');
    return await response.json();
  } catch (error) {
    console.error("Usando dados mockados devido ao erro:", error);
    return mockData(); // Carrega dados fictícios
  }
}

// Dados mockados de fallback
function mockData() {
  return [
    { symbol: "BTC", name: "Bitcoin", market_cap: 800000000000, current_price: 50000, price_change_percentage_24h: 2.5 },
    { symbol: "ETH", name: "Ethereum", market_cap: 400000000000, current_price: 3000, price_change_percentage_24h: -1.2 },
    { symbol: "SOL", name: "Solana", market_cap: 150000000000, current_price: 150, price_change_percentage_24h: 5.7 }
  ];
}
