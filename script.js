// Dados das ações brasileiras (Top 100)
const brazilianStocks = [
    { symbol: 'PETR4', name: 'Petrobras', price: 35.31, marketCap: 460.2, volume: 2.1, hour: 0.1, day: 0.47, week: -2.1, month: 5.4, year: 12.3 },
    { symbol: 'VALE3', name: 'Vale', price: 54.71, marketCap: 245.8, volume: 1.8, hour: -0.2, day: -1.64, week: -3.2, month: 8.7, year: 15.6 },
    { symbol: 'ITUB4', name: 'Itaú Unibanco', price: 32.22, marketCap: 312.5, volume: 1.5, hour: 0.0, day: 1.10, week: 2.3, month: 4.1, year: 18.9 },
    { symbol: 'BBDC4', name: 'Bradesco', price: 13.45, marketCap: 156.7, volume: 1.2, hour: 0.1, day: 0.22, week: 1.8, month: 3.5, year: 22.1 },
    { symbol: 'ABEV3', name: 'Ambev', price: 12.89, marketCap: 203.4, volume: 0.9, hour: -0.1, day: 2.15, week: 3.4, month: 6.2, year: 8.7 },
    { symbol: 'WEGE3', name: 'WEG', price: 67.89, marketCap: 89.3, volume: 0.8, hour: 0.2, day: 2.15, week: 4.1, month: 12.3, year: 45.6 },
    { symbol: 'AZUL4', name: 'Azul', price: 6.62, marketCap: 28.1, volume: 0.7, hour: -0.3, day: -7.46, week: -12.1, month: -15.8, year: -23.4 },
    { symbol: 'MGLU3', name: 'Magazine Luiza', price: 7.28, marketCap: 48.9, volume: 0.6, hour: 0.0, day: -3.20, week: -5.7, month: -8.9, year: -45.2 },
    { symbol: 'AMBP3', name: 'Ambipar', price: 17.42, marketCap: 12.5, volume: 0.5, hour: 0.4, day: 18.79, week: 25.3, month: 34.7, year: 89.2 },
    { symbol: 'DASA3', name: 'Dasa', price: 1.46, marketCap: 8.7, volume: 0.4, hour: 0.1, day: 6.76, week: 8.9, month: 15.2, year: 23.8 },
    { symbol: 'VAMO3', name: 'Vamos', price: 1.31, marketCap: 6.2, volume: 0.3, hour: 0.0, day: 1.30, week: 2.1, month: 4.5, year: 12.7 },
    { symbol: 'POMO4', name: 'Marcopolo', price: 14.85, marketCap: 9.8, volume: 0.3, hour: 0.1, day: 2.64, week: 3.8, month: 7.2, year: 18.9 },
    { symbol: 'CPFE3', name: 'CPFL Energia', price: 37.41, marketCap: 45.6, volume: 0.2, hour: -0.1, day: -2.80, week: -1.2, month: 3.4, year: 15.7 },
    { symbol: 'FNAM11', name: 'FII Fator Verita', price: 8.26, marketCap: 3.2, volume: 0.2, hour: 0.2, day: 5.86, week: 7.3, month: 9.8, year: 14.2 },
    { symbol: 'IGTI11', name: 'Iguatemi', price: 21.06, marketCap: 15.4, volume: 0.1, hour: 0.0, day: 1.76, week: 2.9, month: 5.1, year: 8.7 },
    { symbol: 'BRFS3', name: 'BRF', price: 14.67, marketCap: 23.8, volume: 0.1, hour: -0.1, day: -0.53, week: 1.2, month: 4.6, year: 12.3 },
    { symbol: 'BBAS3', name: 'Banco do Brasil', price: 28.45, marketCap: 98.7, volume: 1.1, hour: 0.1, day: 0.85, week: 2.1, month: 5.4, year: 19.8 },
    { symbol: 'RENT3', name: 'Localiza', price: 45.67, marketCap: 67.2, volume: 0.9, hour: 0.0, day: 1.23, week: 3.2, month: 7.8, year: 25.4 },
    { symbol: 'LREN3', name: 'Lojas Renner', price: 23.12, marketCap: 34.5, volume: 0.8, hour: -0.2, day: -0.89, week: 1.5, month: 4.2, year: 16.7 },
    { symbol: 'JBSS3', name: 'JBS', price: 34.56, marketCap: 78.9, volume: 0.7, hour: 0.1, day: 2.34, week: 4.1, month: 8.7, year: 21.3 }
];

// Dados das ações americanas (Top 50)
const americanStocks = [
    { symbol: 'AAPL', name: 'Apple', price: 185.92, marketCap: 2850.4, volume: 45.2, hour: 0.2, day: 2.34, week: 1.8, month: 5.7, year: 23.4 },
    { symbol: 'MSFT', name: 'Microsoft', price: 378.85, marketCap: 2820.1, volume: 32.1, hour: 0.1, day: 1.87, week: 2.3, month: 6.2, year: 28.9 },
    { symbol: 'GOOGL', name: 'Alphabet', price: 142.56, marketCap: 1780.3, volume: 28.7, hour: -0.1, day: -0.45, week: 1.2, month: 4.8, year: 19.6 },
    { symbol: 'AMZN', name: 'Amazon', price: 151.94, marketCap: 1590.8, volume: 35.4, hour: 0.3, day: 3.21, week: 4.1, month: 8.9, year: 32.1 },
    { symbol: 'TSLA', name: 'Tesla', price: 248.42, marketCap: 789.2, volume: 42.8, hour: -0.2, day: -2.67, week: -1.8, month: 12.4, year: 45.7 },
    { symbol: 'META', name: 'Meta', price: 484.49, marketCap: 1234.5, volume: 25.6, hour: 0.1, day: 1.95, week: 3.4, month: 9.8, year: 67.2 },
    { symbol: 'NVDA', name: 'NVIDIA', price: 875.28, marketCap: 2156.7, volume: 38.9, hour: 0.4, day: 4.12, week: 6.7, month: 15.3, year: 189.4 },
    { symbol: 'NFLX', name: 'Netflix', price: 486.81, marketCap: 215.4, volume: 18.2, hour: -0.1, day: -1.23, week: 2.1, month: 7.8, year: 34.6 },
    { symbol: 'AMD', name: 'AMD', price: 142.37, marketCap: 234.8, volume: 22.1, hour: 0.2, day: 2.89, week: 4.5, month: 11.2, year: 78.9 },
    { symbol: 'INTC', name: 'Intel', price: 23.45, marketCap: 98.7, volume: 15.6, hour: -0.1, day: -0.78, week: -2.3, month: 1.4, year: -12.8 },
    { symbol: 'CRM', name: 'Salesforce', price: 267.89, marketCap: 267.3, volume: 12.4, hour: 0.1, day: 1.56, week: 2.8, month: 6.9, year: 25.7 },
    { symbol: 'ORCL', name: 'Oracle', price: 112.34, marketCap: 312.1, volume: 14.7, hour: 0.0, day: 0.92, week: 1.9, month: 4.3, year: 18.6 },
    { symbol: 'ADBE', name: 'Adobe', price: 567.23, marketCap: 256.8, volume: 9.8, hour: -0.2, day: -1.45, week: 0.8, month: 5.2, year: 22.4 },
    { symbol: 'PYPL', name: 'PayPal', price: 78.45, marketCap: 89.2, volume: 16.3, hour: 0.3, day: 2.67, week: 3.9, month: 8.1, year: 15.7 },
    { symbol: 'DIS', name: 'Disney', price: 98.76, marketCap: 180.4, volume: 11.2, hour: -0.1, day: -0.34, week: 1.6, month: 3.8, year: 9.2 },
    { symbol: 'UBER', name: 'Uber', price: 67.89, marketCap: 145.6, volume: 19.7, hour: 0.2, day: 3.45, week: 5.2, month: 12.8, year: 89.3 },
    { symbol: 'SPOT', name: 'Spotify', price: 234.56, marketCap: 45.8, volume: 8.9, hour: -0.3, day: -2.10, week: -0.7, month: 6.4, year: 34.1 },
    { symbol: 'ZOOM', name: 'Zoom', price: 89.12, marketCap: 26.7, volume: 7.4, hour: 0.1, day: 1.78, week: 2.9, month: 5.6, year: -15.2 },
    { symbol: 'SQ', name: 'Block', price: 123.45, marketCap: 67.3, volume: 13.8, hour: -0.1, day: -0.89, week: 2.3, month: 7.9, year: 45.6 },
    { symbol: 'SHOP', name: 'Shopify', price: 456.78, marketCap: 58.9, volume: 10.5, hour: 0.2, day: 2.34, week: 4.7, month: 11.3, year: 67.8 }
];

// Estado da aplicação
let currentMarket = 'brazilian';
let currentPeriod = 'day';
let currentMetric = 'market-cap';
let currentData = brazilianStocks;

// Elementos DOM
const bubbleChart = document.getElementById('bubble-chart');
const tableBody = document.getElementById('table-body');
const searchInput = document.getElementById('search-input');
const rangeSelect = document.getElementById('range-select');
const periodButtons = document.querySelectorAll('.period-btn');
const metricSelect = document.getElementById('metric-select');
const settingsBtn = document.getElementById('settings');
const settingsModal = document.getElementById('settings-modal');
const closeModal = document.getElementById('close-modal');
const marketSelect = document.getElementById('market-select');

// Função para gerar posições das bolhas (algoritmo similar ao Cryptobubbles)
function generateBubblePositions(data) {
    const positions = [];
    const width = 1200;
    const height = 700;
    const padding = 60;
    
    // Ordenar por market cap para posicionamento
    const sortedData = [...data].sort((a, b) => b.marketCap - a.marketCap);
    
    sortedData.forEach((stock, index) => {
        let x, y, radius;
        let attempts = 0;
        const maxAttempts = 100;
        
        // Calcular raio baseado na métrica selecionada
        const maxValue = Math.max(...data.map(s => s[currentMetric === 'market-cap' ? 'marketCap' : currentMetric === 'volume' ? 'volume' : 'price']));
        const minValue = Math.min(...data.map(s => s[currentMetric === 'market-cap' ? 'marketCap' : currentMetric === 'volume' ? 'volume' : 'price']));
        const value = stock[currentMetric === 'market-cap' ? 'marketCap' : currentMetric === 'volume' ? 'volume' : 'price'];
        
        // Raio entre 20 e 80 pixels
        radius = 20 + ((value - minValue) / (maxValue - minValue)) * 60;
        
        do {
            // Posicionamento mais natural (não em grade)
            if (index === 0) {
                // Primeira bolha no centro
                x = width / 2;
                y = height / 2;
            } else {
                // Outras bolhas em posições aleatórias, mas tendendo ao centro
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * Math.min(width, height) * 0.3;
                x = width / 2 + Math.cos(angle) * distance;
                y = height / 2 + Math.sin(angle) * distance;
                
                // Garantir que está dentro dos limites
                x = Math.max(radius + padding, Math.min(width - radius - padding, x));
                y = Math.max(radius + padding, Math.min(height - radius - padding, y));
            }
            
            // Verificar colisão com outras bolhas
            let collision = false;
            for (let i = 0; i < positions.length; i++) {
                const other = positions[i];
                const distance = Math.sqrt((x - other.x) ** 2 + (y - other.y) ** 2);
                const minDistance = radius + other.radius + 5; // 5px de espaçamento
                
                if (distance < minDistance) {
                    collision = true;
                    break;
                }
            }
            
            if (!collision) {
                positions.push({ x, y, radius, stock, index });
                break;
            }
            
            attempts++;
        } while (attempts < maxAttempts);
        
        // Se não conseguiu posicionar sem colisão, força uma posição
        if (attempts >= maxAttempts) {
            positions.push({ x, y, radius, stock, index });
        }
    });
    
    return positions;
}

// Função para renderizar as bolhas
function renderBubbles() {
    const positions = generateBubblePositions(currentData);
    bubbleChart.innerHTML = '';
    
    positions.forEach(({ x, y, radius, stock }) => {
        // Determinar cor baseada na variação do período atual
        const change = stock[currentPeriod];
        let bubbleClass = 'bubble-neutral';
        if (change > 0) bubbleClass = 'bubble-positive';
        else if (change < 0) bubbleClass = 'bubble-negative';
        
        // Criar grupo da bolha
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'bubble');
        group.setAttribute('data-symbol', stock.symbol);
        
        // Círculo da bolha
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', radius);
        circle.setAttribute('class', bubbleClass);
        circle.setAttribute('stroke-width', '2');
        
        // Texto do símbolo
        const symbolText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        symbolText.setAttribute('x', x);
        symbolText.setAttribute('y', y - 8);
        symbolText.setAttribute('class', 'bubble-text bubble-symbol');
        symbolText.textContent = stock.symbol;
        
        // Texto da variação
        const changeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        changeText.setAttribute('x', x);
        changeText.setAttribute('y', y + 8);
        changeText.setAttribute('class', 'bubble-text bubble-change');
        changeText.textContent = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
        
        group.appendChild(circle);
        group.appendChild(symbolText);
        group.appendChild(changeText);
        
        // Event listeners
        group.addEventListener('click', () => showStockDetails(stock));
        group.addEventListener('mouseenter', () => highlightTableRow(stock.symbol));
        group.addEventListener('mouseleave', () => removeTableHighlight());
        
        bubbleChart.appendChild(group);
    });
}

// Função para renderizar a tabela
function renderTable() {
    tableBody.innerHTML = '';
    
    currentData.forEach((stock, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-symbol', stock.symbol);
        
        // Determinar classes de cor para as variações
        const getChangeClass = (value) => {
            if (value > 0) return 'change-positive';
            if (value < 0) return 'change-negative';
            return 'change-neutral';
        };
        
        row.innerHTML = `
            <td class="rank-cell">${index + 1}</td>
            <td class="name-cell">
                <div class="stock-icon">${stock.symbol.substring(0, 2)}</div>
                <span class="stock-name">${stock.symbol}</span>
            </td>
            <td class="price-cell">$${stock.price.toFixed(2)}</td>
            <td class="market-cap-cell">$${stock.marketCap.toFixed(1)}B</td>
            <td class="volume-cell">$${stock.volume.toFixed(1)}B</td>
            <td class="change-cell ${getChangeClass(stock.hour)}">${stock.hour > 0 ? '+' : ''}${stock.hour.toFixed(2)}%</td>
            <td class="change-cell ${getChangeClass(stock.day)}">${stock.day > 0 ? '+' : ''}${stock.day.toFixed(2)}%</td>
            <td class="change-cell ${getChangeClass(stock.week)}">${stock.week > 0 ? '+' : ''}${stock.week.toFixed(2)}%</td>
            <td class="change-cell ${getChangeClass(stock.month)}">${stock.month > 0 ? '+' : ''}${stock.month.toFixed(2)}%</td>
            <td class="change-cell ${getChangeClass(stock.year)}">${stock.year > 0 ? '+' : ''}${stock.year.toFixed(2)}%</td>
            <td class="links-cell">
                <button class="link-btn link-cmc" title="CoinMarketCap">C</button>
                <button class="link-btn link-cg" title="CoinGecko">G</button>
                <button class="link-btn link-tv" title="TradingView">T</button>
                <button class="link-btn link-trade" title="Trade">$</button>
            </td>
        `;
        
        // Event listeners para a linha da tabela
        row.addEventListener('mouseenter', () => highlightBubble(stock.symbol));
        row.addEventListener('mouseleave', () => removeBubbleHighlight());
        row.addEventListener('click', () => showStockDetails(stock));
        
        tableBody.appendChild(row);
    });
}

// Função para destacar linha da tabela
function highlightTableRow(symbol) {
    const row = document.querySelector(`tr[data-symbol="${symbol}"]`);
    if (row) {
        row.style.backgroundColor = '#2a2a2a';
    }
}

// Função para remover destaque da tabela
function removeTableHighlight() {
    const rows = document.querySelectorAll('tr[data-symbol]');
    rows.forEach(row => {
        row.style.backgroundColor = '';
    });
}

// Função para destacar bolha
function highlightBubble(symbol) {
    const bubble = document.querySelector(`g[data-symbol="${symbol}"]`);
    if (bubble) {
        const circle = bubble.querySelector('circle');
        circle.style.strokeWidth = '4';
        circle.style.filter = 'brightness(1.2)';
    }
}

// Função para remover destaque da bolha
function removeBubbleHighlight() {
    const bubbles = document.querySelectorAll('.bubble circle');
    bubbles.forEach(circle => {
        circle.style.strokeWidth = '2';
        circle.style.filter = '';
    });
}

// Função para mostrar detalhes da ação
function showStockDetails(stock) {
    alert(`${stock.symbol} - ${stock.name}\nPrice: $${stock.price.toFixed(2)}\nMarket Cap: $${stock.marketCap.toFixed(1)}B\nDay Change: ${stock.day > 0 ? '+' : ''}${stock.day.toFixed(2)}%`);
}

// Event listeners
periodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        periodButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPeriod = btn.dataset.period;
        renderBubbles();
    });
});

metricSelect.addEventListener('change', (e) => {
    currentMetric = e.target.value;
    renderBubbles();
});

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (query) {
        currentData = (currentMarket === 'brazilian' ? brazilianStocks : americanStocks)
            .filter(stock => 
                stock.symbol.toLowerCase().includes(query) || 
                stock.name.toLowerCase().includes(query)
            );
    } else {
        currentData = currentMarket === 'brazilian' ? brazilianStocks : americanStocks;
    }
    renderBubbles();
    renderTable();
});

rangeSelect.addEventListener('change', (e) => {
    const range = e.target.value;
    const [start, end] = range.split('-').map(Number);
    const baseData = currentMarket === 'brazilian' ? brazilianStocks : americanStocks;
    currentData = baseData.slice(start - 1, end);
    renderBubbles();
    renderTable();
});

settingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
});

closeModal.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});

marketSelect.addEventListener('change', (e) => {
    currentMarket = e.target.value;
    currentData = currentMarket === 'brazilian' ? brazilianStocks : americanStocks;
    renderBubbles();
    renderTable();
    settingsModal.classList.add('hidden');
});

// Fechar modal clicando fora
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderBubbles();
    renderTable();
});

// Redimensionamento da janela
window.addEventListener('resize', () => {
    setTimeout(() => {
        renderBubbles();
    }, 100);
});

