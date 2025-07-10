document.addEventListener('DOMContentLoaded', () => {
    const bubbleContainer = document.getElementById('bubble-container');
    const sortBySelect = document.getElementById('sortBy');

    // Dados de exemplo (em um projeto real, isso viria de uma API)
    let cryptoData = [
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', marketCap: 1200000000000, priceChange24h: 2.5, price: 65000, volume: 30000000000 },
        { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', marketCap: 400000000000, priceChange24h: -1.2, price: 3500, volume: 15000000000 },
        { id: 'ripple', name: 'Ripple', symbol: 'XRP', marketCap: 30000000000, priceChange24h: 0.8, price: 0.5, volume: 2000000000 },
        { id: 'solana', name: 'Solana', symbol: 'SOL', marketCap: 60000000000, priceChange24h: 5.1, price: 150, volume: 3500000000 },
        { id: 'cardano', name: 'Cardano', symbol: 'ADA', marketCap: 18000000000, priceChange24h: -0.5, price: 0.4, volume: 800000000 },
        { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', marketCap: 15000000000, priceChange24h: 1.0, price: 0.12, volume: 1000000000 },
        { id: 'shibainu', name: 'Shiba Inu', symbol: 'SHIB', marketCap: 8000000000, priceChange24h: -2.0, price: 0.00002, volume: 500000000 },
        { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', marketCap: 10000000000, priceChange24h: 3.2, price: 7, volume: 700000000 },
        { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', marketCap: 7000000000, priceChange24h: 0.1, price: 70, volume: 400000000 },
        { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', marketCap: 9000000000, priceChange24h: 4.0, price: 18, volume: 600000000 },
        { id: 'tron', name: 'TRON', symbol: 'TRX', marketCap: 10000000000, priceChange24h: -0.7, price: 0.1, volume: 900000000 },
        { id: 'avalanche', name: 'AVAX', symbol: 'AVAX', marketCap: 15000000000, priceChange24h: 6.5, price: 40, volume: 1200000000 },
        { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM', marketCap: 5000000000, priceChange24h: -3.0, price: 9, volume: 300000000 },
        { id: 'near-protocol', name: 'NEAR Protocol', symbol: 'NEAR', marketCap: 7000000000, priceChange24h: 7.0, price: 8, volume: 500000000 },
        { id: 'internet-computer', name: 'Internet Computer', symbol: 'ICP', marketCap: 6000000000, priceChange24h: 0.0, price: 12, volume: 400000000 },
    ];

    function createBubbles(data, sortBy) {
        bubbleContainer.innerHTML = ''; // Limpa as bolhas existentes

        // Sort data based on the selected criteria
        data.sort((a, b) => {
            if (sortBy === 'marketCap') {
                return b.marketCap - a.marketCap;
            } else if (sortBy === 'priceChange24h') {
                return b.priceChange24h - a.priceChange24h;
            }
            return 0;
        });

        // Determine min/max market cap for dynamic sizing
        const marketCaps = data.map(d => d.marketCap);
        const minMarketCap = Math.min(...marketCaps);
        const maxMarketCap = Math.max(...marketCaps);

        data.forEach(crypto => {
            const bubble = document.createElement('div');
            bubble.classList.add('bubble');

            // Calculate bubble size based on market cap (logarithmic scale for better visual distinction)
            const minSize = 60; // Minimum bubble size in pixels
            const maxSize = 200; // Maximum bubble size in pixels
            const size = minSize + (maxSize - minSize) * ((Math.log(crypto.marketCap) - Math.log(minMarketCap)) / (Math.log(maxMarketCap) - Math.log(minMarketCap)));

            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;

            // Assign color based on price change
            if (crypto.priceChange24h > 0) {
                bubble.classList.add('positive');
            } else if (crypto.priceChange24h < 0) {
                bubble.classList.add('negative');
            } else {
                bubble.classList.add('neutral');
            }

            bubble.innerHTML = `
                <div class="bubble-name">${crypto.symbol}</div>
                <div class="bubble-value">${crypto.priceChange24h.toFixed(2)}%</div>
                <div class="tooltip">
                    <strong>${crypto.name} (${crypto.symbol})</strong><br>
                    Preço: $${crypto.price.toFixed(2)}<br>
                    Market Cap: $${(crypto.marketCap / 1e9).toFixed(2)}B<br>
                    Variação 24h: ${crypto.priceChange24h.toFixed(2)}%<br>
                    Volume 24h: $${(crypto.volume / 1e9).toFixed(2)}B
                </div>
            `;

            // Add click event for more details (you can expand this)
            bubble.addEventListener('click', () => {
                alert(`Detalhes de ${crypto.name}:\nPreço: $${crypto.price.toFixed(2)}\nMarket Cap: $${(crypto.marketCap / 1e9).toFixed(2)}B\nVariação 24h: ${crypto.priceChange24h.toFixed(2)}%`);
            });

            bubbleContainer.appendChild(bubble);
        });
    }

    // Initial render
    createBubbles(cryptoData, sortBySelect.value);

    // Event listener for sorting change
    sortBySelect.addEventListener('change', () => {
        createBubbles(cryptoData, sortBySelect.value);
    });
});
