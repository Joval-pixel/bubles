// Função para gerar dados aleatórios realistas
function generateRandomStock(symbol, name, basePrice, baseCap) {
    const hourChange = (Math.random() - 0.5) * 4;
    const dayChange = (Math.random() - 0.5) * 10;
    const weekChange = (Math.random() - 0.5) * 20;
    const monthChange = (Math.random() - 0.5) * 40;
    const yearChange = (Math.random() - 0.5) * 200;
    
    return {
        symbol,
        name,
        price: basePrice + (Math.random() - 0.5) * basePrice * 0.2,
        marketCap: baseCap + (Math.random() - 0.5) * baseCap * 0.3,
        volume: Math.random() * 5 + 0.1,
        hour: hourChange,
        day: dayChange,
        week: weekChange,
        month: monthChange,
        year: yearChange
    };
}

// Lista de ações brasileiras (100+)
const brazilianStocks = [
    generateRandomStock('PETR4', 'Petrobras', 35.31, 460.2),
    generateRandomStock('VALE3', 'Vale', 54.71, 245.8),
    generateRandomStock('ITUB4', 'Itaú Unibanco', 32.22, 312.5),
    generateRandomStock('BBDC4', 'Bradesco', 13.45, 156.7),
    generateRandomStock('ABEV3', 'Ambev', 12.89, 203.4),
    generateRandomStock('WEGE3', 'WEG', 67.89, 89.3),
    generateRandomStock('AZUL4', 'Azul', 6.62, 28.1),
    generateRandomStock('MGLU3', 'Magazine Luiza', 7.28, 48.9),
    generateRandomStock('AMBP3', 'Ambipar', 17.42, 12.5),
    generateRandomStock('DASA3', 'Dasa', 1.46, 8.7),
    generateRandomStock('VAMO3', 'Vamos', 1.31, 6.2),
    generateRandomStock('POMO4', 'Marcopolo', 14.85, 9.8),
    generateRandomStock('CPFE3', 'CPFL Energia', 37.41, 45.6),
    generateRandomStock('FNAM11', 'FII Fator Verita', 8.26, 3.2),
    generateRandomStock('IGTI11', 'Iguatemi', 21.06, 15.4),
    generateRandomStock('BRFS3', 'BRF', 14.67, 23.8),
    generateRandomStock('BBAS3', 'Banco do Brasil', 28.45, 98.7),
    generateRandomStock('RENT3', 'Localiza', 45.67, 67.2),
    generateRandomStock('LREN3', 'Lojas Renner', 23.12, 34.5),
    generateRandomStock('JBSS3', 'JBS', 34.56, 78.9),
    generateRandomStock('SUZB3', 'Suzano', 45.23, 62.1),
    generateRandomStock('GGBR4', 'Gerdau', 18.90, 31.5),
    generateRandomStock('USIM5', 'Usiminas', 7.65, 12.3),
    generateRandomStock('CSNA3', 'CSN', 12.34, 18.7),
    generateRandomStock('GOAU4', 'Metalúrgica Gerdau', 9.87, 15.2),
    generateRandomStock('EMBR3', 'Embraer', 23.45, 42.8),
    generateRandomStock('CCRO3', 'CCR', 14.56, 38.9),
    generateRandomStock('EQTL3', 'Equatorial', 27.89, 45.6),
    generateRandomStock('ELET3', 'Eletrobras', 39.12, 78.3),
    generateRandomStock('ELET6', 'Eletrobras PNB', 41.23, 65.4),
    generateRandomStock('CMIG4', 'Cemig', 8.76, 23.1),
    generateRandomStock('TAEE11', 'Taesa', 32.45, 28.7),
    generateRandomStock('CPLE6', 'Copel', 45.67, 34.2),
    generateRandomStock('ENGI11', 'Energisa', 38.90, 29.8),
    generateRandomStock('SBSP3', 'Sabesp', 67.23, 45.9),
    generateRandomStock('SAPR11', 'Sanepar', 78.45, 32.1),
    generateRandomStock('VIVT3', 'Telefônica Brasil', 43.21, 67.8),
    generateRandomStock('TIMP3', 'TIM', 9.87, 21.4),
    generateRandomStock('OIBR3', 'Oi', 2.34, 5.6),
    generateRandomStock('QUAL3', 'Qualicorp', 12.56, 8.9),
    generateRandomStock('RADL3', 'Raia Drogasil', 34.78, 56.2),
    generateRandomStock('RAIA3', 'RaiaDrogasil', 23.45, 43.7),
    generateRandomStock('PCAR3', 'P&G', 45.67, 32.8),
    generateRandomStock('KLBN11', 'Klabin', 3.45, 19.6),
    generateRandomStock('FIBR3', 'Fibria', 67.89, 28.3),
    generateRandomStock('MRFG3', 'Marfrig', 8.90, 15.7),
    generateRandomStock('BEEF3', 'Minerva', 12.34, 9.8),
    generateRandomStock('JALL3', 'Jalles Machado', 23.45, 6.4),
    generateRandomStock('HAPV3', 'Hapvida', 34.56, 42.1),
    generateRandomStock('RDOR3', 'Rede D\'Or', 28.90, 58.7),
    generateRandomStock('FLRY3', 'Fleury', 15.67, 12.3),
    generateRandomStock('PARD3', 'Pardini', 19.45, 8.9),
    generateRandomStock('ODPV3', 'Odontoprev', 11.23, 6.7),
    generateRandomStock('GNDI3', 'NotreDame', 45.78, 34.2),
    generateRandomStock('CSAN3', 'Cosan', 23.45, 28.9),
    generateRandomStock('RAIZ4', 'Raízen', 3.67, 15.4),
    generateRandomStock('UGPA3', 'Ultrapar', 18.90, 23.7),
    generateRandomStock('BRDT3', 'Petrobras Distribuidora', 22.34, 19.8),
    generateRandomStock('GRND3', 'Grendene', 5.67, 8.2),
    generateRandomStock('ALPK3', 'Alpargatas', 12.45, 4.9),
    generateRandomStock('SOMA3', 'Soma', 8.90, 3.6),
    generateRandomStock('ARZZ3', 'Arezzo', 34.56, 7.8),
    generateRandomStock('GUAR3', 'Guararapes', 15.23, 12.4),
    generateRandomStock('HYPE3', 'Hypera', 23.78, 18.9),
    generateRandomStock('PFRM3', 'Profarma', 9.45, 5.7),
    generateRandomStock('BLAU3', 'Blau Farmacêutica', 6.78, 3.2),
    generateRandomStock('MULT3', 'Multiplan', 45.67, 28.9),
    generateRandomStock('BRML3', 'BR Malls', 12.34, 15.6),
    generateRandomStock('ALUP11', 'Alupar', 23.45, 19.8),
    generateRandomStock('TGMA3', 'Tegma', 34.67, 8.4),
    generateRandomStock('LOGN3', 'Log-In', 18.90, 12.7),
    generateRandomStock('RAIL3', 'Rumo', 15.67, 23.4),
    generateRandomStock('ECOR3', 'EcoRodovias', 8.45, 6.9),
    generateRandomStock('CYRE3', 'Cyrela', 12.78, 18.3),
    generateRandomStock('MRVE3', 'MRV', 6.90, 9.7),
    generateRandomStock('EVEN3', 'Even', 3.45, 4.2),
    generateRandomStock('JHSF3', 'JHSF', 5.67, 3.8),
    generateRandomStock('TCSA3', 'Tecnisa', 2.34, 1.9),
    generateRandomStock('DIRR3', 'Direcional', 4.56, 2.7),
    generateRandomStock('PLPL3', 'Plano&Plano', 8.90, 5.4),
    generateRandomStock('MDIA3', 'M.Dias Branco', 23.45, 15.8),
    generateRandomStock('SMTO3', 'São Martinho', 34.67, 12.9),
    generateRandomStock('SLCE3', 'SLC Agrícola', 45.78, 18.6),
    generateRandomStock('TTEN3', 'Três Tentos', 12.34, 7.3),
    generateRandomStock('CAML3', 'Camil', 8.90, 4.7),
    generateRandomStock('JOPA3', 'Josapar', 5.67, 2.8),
    generateRandomStock('VULC3', 'Vulcabras', 3.45, 1.9),
    generateRandomStock('CAMB3', 'Cambuci', 2.78, 1.2),
    generateRandomStock('GFSA3', 'Gafisa', 1.23, 0.8),
    generateRandomStock('PDGR3', 'PDG Realty', 2.45, 1.5),
    generateRandomStock('BPAC11', 'BTG Pactual', 67.89, 89.4),
    generateRandomStock('SANB11', 'Santander Brasil', 34.56, 67.2),
    generateRandomStock('BPAN4', 'Banco Pan', 12.78, 8.9),
    generateRandomStock('PINE4', 'Pine', 5.67, 3.4),
    generateRandomStock('BMGB4', 'Banco BMG', 3.45, 2.1),
    generateRandomStock('BMIN4', 'Banco Inter', 8.90, 6.7),
    generateRandomStock('BIDI11', 'Banco Inter', 23.45, 15.8),
    generateRandomStock('MODL11', 'Modelo', 34.67, 12.4),
    generateRandomStock('CASH3', 'Méliuz', 2.34, 1.8),
    generateRandomStock('PETZ3', 'Petz', 4.56, 3.2),
    generateRandomStock('VVAR3', 'Via Varejo', 1.23, 2.1),
    generateRandomStock('AMER3', 'Americanas', 0.89, 1.5),
    generateRandomStock('LAME4', 'Lojas Americanas', 1.45, 2.8),
    generateRandomStock('GMAT3', 'Grupo Mateus', 12.34, 8.9),
    generateRandomStock('ASAI3', 'Assaí', 23.45, 34.7),
    generateRandomStock('PCAR4', 'Grupo Carrefour', 15.67, 18.9),
    generateRandomStock('SBFG3', 'Grupo SBF', 8.90, 6.4),
    generateRandomStock('VIIA3', 'Via', 3.45, 4.2),
    generateRandomStock('LWSA3', 'Locaweb', 2.78, 1.9),
    generateRandomStock('MOVI3', 'Movida', 12.34, 7.8),
    generateRandomStock('SIMH3', 'Simpar', 8.90, 5.6)
];

// Lista de ações americanas (100+)
const americanStocks = [
    generateRandomStock('AAPL', 'Apple', 185.92, 2850.4),
    generateRandomStock('MSFT', 'Microsoft', 378.85, 2820.1),
    generateRandomStock('GOOGL', 'Alphabet', 142.56, 1780.3),
    generateRandomStock('AMZN', 'Amazon', 151.94, 1590.8),
    generateRandomStock('TSLA', 'Tesla', 248.42, 789.2),
    generateRandomStock('META', 'Meta', 484.49, 1234.5),
    generateRandomStock('NVDA', 'NVIDIA', 875.28, 2156.7),
    generateRandomStock('NFLX', 'Netflix', 486.81, 215.4),
    generateRandomStock('AMD', 'AMD', 142.37, 234.8),
    generateRandomStock('INTC', 'Intel', 23.45, 98.7),
    generateRandomStock('CRM', 'Salesforce', 267.89, 267.3),
    generateRandomStock('ORCL', 'Oracle', 112.34, 312.1),
    generateRandomStock('ADBE', 'Adobe', 567.23, 256.8),
    generateRandomStock('PYPL', 'PayPal', 78.45, 89.2),
    generateRandomStock('DIS', 'Disney', 98.76, 180.4),
    generateRandomStock('UBER', 'Uber', 67.89, 145.6),
    generateRandomStock('SPOT', 'Spotify', 234.56, 45.8),
    generateRandomStock('ZOOM', 'Zoom', 89.12, 26.7),
    generateRandomStock('SQ', 'Block', 123.45, 67.3),
    generateRandomStock('SHOP', 'Shopify', 456.78, 58.9),
    generateRandomStock('GOOG', 'Alphabet Class C', 140.23, 1750.2),
    generateRandomStock('BRK.A', 'Berkshire Hathaway', 523456.78, 789.4),
    generateRandomStock('BRK.B', 'Berkshire Hathaway B', 348.90, 785.6),
    generateRandomStock('UNH', 'UnitedHealth', 512.34, 485.7),
    generateRandomStock('JNJ', 'Johnson & Johnson', 167.89, 432.1),
    generateRandomStock('V', 'Visa', 278.45, 598.3),
    generateRandomStock('PG', 'Procter & Gamble', 156.78, 374.2),
    generateRandomStock('JPM', 'JPMorgan Chase', 189.23, 567.8),
    generateRandomStock('MA', 'Mastercard', 423.67, 398.4),
    generateRandomStock('HD', 'Home Depot', 345.89, 356.7),
    generateRandomStock('CVX', 'Chevron', 167.45, 312.9),
    generateRandomStock('LLY', 'Eli Lilly', 789.23, 745.6),
    generateRandomStock('ABBV', 'AbbVie', 178.90, 314.5),
    generateRandomStock('AVGO', 'Broadcom', 1234.56, 567.8),
    generateRandomStock('PEP', 'PepsiCo', 178.34, 245.7),
    generateRandomStock('KO', 'Coca-Cola', 67.89, 289.4),
    generateRandomStock('TMO', 'Thermo Fisher', 567.23, 223.8),
    generateRandomStock('COST', 'Costco', 789.45, 345.6),
    generateRandomStock('MRK', 'Merck', 123.45, 267.9),
    generateRandomStock('ABT', 'Abbott', 112.78, 198.7),
    generateRandomStock('ACN', 'Accenture', 345.67, 218.9),
    generateRandomStock('CSCO', 'Cisco', 56.78, 234.5),
    generateRandomStock('TXN', 'Texas Instruments', 189.23, 167.8),
    generateRandomStock('DHR', 'Danaher', 267.89, 189.4),
    generateRandomStock('VZ', 'Verizon', 45.67, 189.7),
    generateRandomStock('WMT', 'Walmart', 167.89, 567.3),
    generateRandomStock('QCOM', 'Qualcomm', 178.45, 198.6),
    generateRandomStock('PFE', 'Pfizer', 34.56, 189.4),
    generateRandomStock('NKE', 'Nike', 89.23, 134.7),
    generateRandomStock('COP', 'ConocoPhillips', 123.45, 145.8),
    generateRandomStock('NEE', 'NextEra Energy', 78.90, 167.9),
    generateRandomStock('UPS', 'UPS', 134.56, 123.4),
    generateRandomStock('RTX', 'Raytheon', 89.78, 134.6),
    generateRandomStock('LOW', 'Lowe\'s', 234.56, 156.8),
    generateRandomStock('LMT', 'Lockheed Martin', 456.78, 123.9),
    generateRandomStock('AMGN', 'Amgen', 278.90, 145.7),
    generateRandomStock('HON', 'Honeywell', 189.23, 134.8),
    generateRandomStock('UNP', 'Union Pacific', 234.56, 145.9),
    generateRandomStock('SBUX', 'Starbucks', 98.76, 112.4),
    generateRandomStock('CAT', 'Caterpillar', 345.67, 178.9),
    generateRandomStock('AXP', 'American Express', 189.45, 134.7),
    generateRandomStock('GS', 'Goldman Sachs', 456.78, 156.8),
    generateRandomStock('BA', 'Boeing', 178.90, 123.4),
    generateRandomStock('IBM', 'IBM', 134.56, 123.7),
    generateRandomStock('DE', 'Deere', 389.23, 123.8),
    generateRandomStock('BLK', 'BlackRock', 789.45, 123.9),
    generateRandomStock('MMM', '3M', 123.45, 67.8),
    generateRandomStock('GILD', 'Gilead Sciences', 78.90, 89.4),
    generateRandomStock('MDT', 'Medtronic', 89.23, 123.7),
    generateRandomStock('ISRG', 'Intuitive Surgical', 456.78, 167.9),
    generateRandomStock('SPGI', 'S&P Global', 423.67, 134.8),
    generateRandomStock('NOW', 'ServiceNow', 678.90, 145.7),
    generateRandomStock('INTU', 'Intuit', 567.23, 156.8),
    generateRandomStock('TJX', 'TJX Companies', 123.45, 134.9),
    generateRandomStock('BKNG', 'Booking Holdings', 3456.78, 145.6),
    generateRandomStock('ADP', 'ADP', 267.89, 123.7),
    generateRandomStock('VRTX', 'Vertex Pharmaceuticals', 456.78, 123.8),
    generateRandomStock('SYK', 'Stryker', 345.67, 134.9),
    generateRandomStock('LRCX', 'Lam Research', 789.23, 123.4),
    generateRandomStock('AMAT', 'Applied Materials', 189.45, 167.8),
    generateRandomStock('PANW', 'Palo Alto Networks', 345.67, 123.9),
    generateRandomStock('MU', 'Micron Technology', 123.45, 134.7),
    generateRandomStock('ADI', 'Analog Devices', 234.56, 123.8),
    generateRandomStock('KLAC', 'KLA Corporation', 567.89, 145.9),
    generateRandomStock('MRVL', 'Marvell Technology', 89.23, 78.4),
    generateRandomStock('FTNT', 'Fortinet', 67.89, 56.7),
    generateRandomStock('SNPS', 'Synopsys', 567.23, 89.4),
    generateRandomStock('CDNS', 'Cadence Design', 345.67, 67.8),
    generateRandomStock('CRWD', 'CrowdStrike', 234.56, 78.9),
    generateRandomStock('ZS', 'Zscaler', 189.23, 45.6),
    generateRandomStock('OKTA', 'Okta', 123.45, 23.4),
    generateRandomStock('DDOG', 'Datadog', 134.56, 34.7),
    generateRandomStock('SNOW', 'Snowflake', 189.78, 56.8),
    generateRandomStock('NET', 'Cloudflare', 89.23, 23.4),
    generateRandomStock('PLTR', 'Palantir', 23.45, 45.6),
    generateRandomStock('RBLX', 'Roblox', 45.67, 23.8),
    generateRandomStock('COIN', 'Coinbase', 178.90, 45.7),
    generateRandomStock('HOOD', 'Robinhood', 12.34, 8.9),
    generateRandomStock('SOFI', 'SoFi', 8.90, 6.7),
    generateRandomStock('UPST', 'Upstart', 34.56, 12.3),
    generateRandomStock('AFRM', 'Affirm', 23.78, 8.9),
    generateRandomStock('ABNB', 'Airbnb', 123.45, 78.9),
    generateRandomStock('DASH', 'DoorDash', 67.89, 23.4),
    generateRandomStock('LYFT', 'Lyft', 45.67, 15.6),
    generateRandomStock('GRUB', 'Grubhub', 23.45, 6.7),
    generateRandomStock('ETSY', 'Etsy', 78.90, 12.3),
    generateRandomStock('EBAY', 'eBay', 45.67, 23.4),
    generateRandomStock('TGT', 'Target', 234.56, 123.4),
    generateRandomStock('F', 'Ford', 12.34, 45.6),
    generateRandomStock('GM', 'General Motors', 45.67, 67.8)
];

// Estado da aplicação
let currentMarket = 'brazilian';
let currentPeriod = 'day';
let currentMetric = 'market-cap';
let currentData = brazilianStocks.slice(0, 100);

// Elementos DOM
const bubbleChart = document.getElementById('bubble-chart');
const searchInput = document.getElementById('search-input');
const rangeSelect = document.getElementById('range-select');
const periodButtons = document.querySelectorAll('.period-btn');
const metricSelect = document.getElementById('metric-select');
const settingsBtn = document.getElementById('settings');
const settingsModal = document.getElementById('settings-modal');
const closeModal = document.getElementById('close-modal');
const marketSelect = document.getElementById('market-select');
const stockCounter = document.getElementById('stock-counter');

// Função para gerar posições das bolhas (otimizada para mobile)
function generateBubblePositions(data) {
    const positions = [];
    const width = 400;
    const height = 600;
    const padding = 20;
    
    const sortedData = [...data].sort((a, b) => b.marketCap - a.marketCap);
    
    sortedData.forEach((stock, index) => {
        let x, y, radius;
        let attempts = 0;
        const maxAttempts = 30;
        
        // Calcular raio menor para mobile
        const maxValue = Math.max(...data.map(s => s[currentMetric === 'market-cap' ? 'marketCap' : currentMetric === 'volume' ? 'volume' : 'price']));
        const minValue = Math.min(...data.map(s => s[currentMetric === 'market-cap' ? 'marketCap' : currentMetric === 'volume' ? 'volume' : 'price']));
        const value = stock[currentMetric === 'market-cap' ? 'marketCap' : currentMetric === 'volume' ? 'volume' : 'price'];
        
        // Raio otimizado para mobile: 12 a 35 pixels
        radius = 12 + ((value - minValue) / (maxValue - minValue)) * 23;
        
        do {
            if (index === 0) {
                x = width / 2;
                y = height / 2;
            } else {
                // Posicionamento em espiral otimizado para mobile
                const angle = index * 0.8;
                const distance = Math.sqrt(index) * 18;
                x = width / 2 + Math.cos(angle) * distance;
                y = height / 2 + Math.sin(angle) * distance;
                
                if (x < radius + padding || x > width - radius - padding || 
                    y < radius + padding || y > height - radius - padding) {
                    x = padding + radius + Math.random() * (width - 2 * (padding + radius));
                    y = padding + radius + Math.random() * (height - 2 * (padding + radius));
                }
            }
            
            let collision = false;
            for (let i = Math.max(0, positions.length - 15); i < positions.length; i++) {
                const other = positions[i];
                const distance = Math.sqrt((x - other.x) ** 2 + (y - other.y) ** 2);
                const minDistance = radius + other.radius + 2;
                
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
        
        if (attempts >= maxAttempts) {
            positions.push({ x, y, radius, stock, index });
        }
    });
    
    return positions;
}

// Função para renderizar as bolhas (otimizada para mobile)
function renderBubbles() {
    const positions = generateBubblePositions(currentData);
    bubbleChart.innerHTML = '';
    
    const fragment = document.createDocumentFragment();
    
    positions.forEach(({ x, y, radius, stock }) => {
        const change = stock[currentPeriod];
        let bubbleClass = 'bubble-neutral';
        if (change > 0) bubbleClass = 'bubble-positive';
        else if (change < 0) bubbleClass = 'bubble-negative';
        
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'bubble');
        group.setAttribute('data-symbol', stock.symbol);
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', radius);
        circle.setAttribute('class', bubbleClass);
        circle.setAttribute('stroke-width', '1');
        
        // Texto otimizado para mobile
        if (radius > 18) {
            const symbolText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            symbolText.setAttribute('x', x);
            symbolText.setAttribute('y', y - 3);
            symbolText.setAttribute('class', 'bubble-text bubble-symbol');
            symbolText.textContent = stock.symbol;
            group.appendChild(symbolText);
            
            const changeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            changeText.setAttribute('x', x);
            changeText.setAttribute('y', y + 7);
            changeText.setAttribute('class', 'bubble-text bubble-change');
            changeText.textContent = `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
            group.appendChild(changeText);
        } else if (radius > 12) {
            const symbolText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            symbolText.setAttribute('x', x);
            symbolText.setAttribute('y', y);
            symbolText.setAttribute('class', 'bubble-text bubble-symbol');
            symbolText.setAttribute('font-size', '9px');
            symbolText.textContent = stock.symbol.substring(0, 4);
            group.appendChild(symbolText);
        }
        
        group.appendChild(circle);
        
        group.addEventListener('click', () => showStockDetails(stock));
        
        fragment.appendChild(group);
    });
    
    bubbleChart.appendChild(fragment);
    updateStockCounter();
}

// Função para atualizar contador
function updateStockCounter() {
    const total = currentMarket === 'brazilian' ? brazilianStocks.length : americanStocks.length;
    const showing = currentData.length;
    const positive = currentData.filter(s => s[currentPeriod] > 0).length;
    const negative = currentData.filter(s => s[currentPeriod] < 0).length;
    
    stockCounter.textContent = `Exibindo ${showing} de ${total} ações • 🟢 ${positive} Alta • 🔴 ${negative} Baixa`;
}

// Função para mostrar detalhes da ação
function showStockDetails(stock) {
    const price = stock.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const marketCap = stock.marketCap.toFixed(1);
    const change = stock.day > 0 ? '+' : '';
    
    alert(`${stock.symbol} - ${stock.name}\nPreço: ${price}\nValor de Mercado: R$ ${marketCap}B\nVariação do Dia: ${change}${stock.day.toFixed(2)}%`);
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
    const baseData = currentMarket === 'brazilian' ? brazilianStocks : americanStocks;
    
    if (query) {
        currentData = baseData.filter(stock => 
            stock.symbol.toLowerCase().includes(query) || 
            stock.name.toLowerCase().includes(query)
        );
    } else {
        const range = rangeSelect.value;
        const [start, end] = range.split('-').map(Number);
        currentData = baseData.slice(start - 1, end);
    }
    renderBubbles();
});

rangeSelect.addEventListener('change', (e) => {
    const range = e.target.value;
    const [start, end] = range.split('-').map(Number);
    const baseData = currentMarket === 'brazilian' ? brazilianStocks : americanStocks;
    currentData = baseData.slice(start - 1, end);
    renderBubbles();
});

settingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
});

closeModal.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});

marketSelect.addEventListener('change', (e) => {
    currentMarket = e.target.value;
    const range = rangeSelect.value;
    const [start, end] = range.split('-').map(Number);
    const baseData = currentMarket === 'brazilian' ? brazilianStocks : americanStocks;
    currentData = baseData.slice(start - 1, end);
    renderBubbles();
    settingsModal.classList.add('hidden');
});

settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderBubbles();
});

// Redimensionamento otimizado
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        renderBubbles();
    }, 300);
});

// Prevenir zoom duplo toque no iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);
