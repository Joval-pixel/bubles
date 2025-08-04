// Configurações globais
const CONFIG = {
    API_URL: 'https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=100',
    UPDATE_INTERVAL: 10000, // 10 segundos
    MIN_BUBBLES: 50,
    BUBBLE_MIN_SIZE: 40,
    BUBBLE_MAX_SIZE: 120,
    ANIMATION_SPEED: 0.5,
    API_TIMEOUT: 5000 // 5 segundos timeout
};

// Estado global da aplicação
let bubbles = [];
let animationId;
let isLoading = true;
let lastUpdate = null;
let useSimulatedData = false;

// Dados simulados expandidos para fallback
const FALLBACK_DATA = [
    { symbol: 'PETR4', shortName: 'PETROBRAS', regularMarketPrice: 32.45, regularMarketChangePercent: 2.34, regularMarketVolume: 45678900 },
    { symbol: 'VALE3', shortName: 'VALE', regularMarketPrice: 65.78, regularMarketChangePercent: -1.23, regularMarketVolume: 38456789 },
    { symbol: 'ITUB4', shortName: 'ITAU UNIBANCO', regularMarketPrice: 28.90, regularMarketChangePercent: 0.87, regularMarketVolume: 34567890 },
    { symbol: 'BBDC4', shortName: 'BRADESCO', regularMarketPrice: 15.67, regularMarketChangePercent: -0.45, regularMarketVolume: 29876543 },
    { symbol: 'ABEV3', shortName: 'AMBEV', regularMarketPrice: 12.34, regularMarketChangePercent: 1.56, regularMarketVolume: 25678901 },
    { symbol: 'WEGE3', shortName: 'WEG', regularMarketPrice: 45.23, regularMarketChangePercent: 3.21, regularMarketVolume: 23456789 },
    { symbol: 'MGLU3', shortName: 'MAGAZINE LUIZA', regularMarketPrice: 8.76, regularMarketChangePercent: -2.34, regularMarketVolume: 21345678 },
    { symbol: 'JBSS3', shortName: 'JBS', regularMarketPrice: 34.56, regularMarketChangePercent: 0.98, regularMarketVolume: 19234567 },
    { symbol: 'RENT3', shortName: 'LOCALIZA', regularMarketPrice: 67.89, regularMarketChangePercent: -1.87, regularMarketVolume: 18123456 },
    { symbol: 'LREN3', shortName: 'LOJAS RENNER', regularMarketPrice: 23.45, regularMarketChangePercent: 2.76, regularMarketVolume: 17012345 },
    { symbol: 'SUZB3', shortName: 'SUZANO', regularMarketPrice: 56.78, regularMarketChangePercent: 1.45, regularMarketVolume: 16901234 },
    { symbol: 'GGBR4', shortName: 'GERDAU', regularMarketPrice: 19.87, regularMarketChangePercent: -0.89, regularMarketVolume: 15890123 },
    { symbol: 'USIM5', shortName: 'USIMINAS', regularMarketPrice: 7.65, regularMarketChangePercent: 2.13, regularMarketVolume: 14789012 },
    { symbol: 'CSNA3', shortName: 'CSN', regularMarketPrice: 13.45, regularMarketChangePercent: -1.67, regularMarketVolume: 13678901 },
    { symbol: 'EMBR3', shortName: 'EMBRAER', regularMarketPrice: 89.12, regularMarketChangePercent: 3.45, regularMarketVolume: 12567890 },
    { symbol: 'CIEL3', shortName: 'CIELO', regularMarketPrice: 4.32, regularMarketChangePercent: -0.78, regularMarketVolume: 11456789 },
    { symbol: 'RADL3', shortName: 'RAIA DROGASIL', regularMarketPrice: 23.67, regularMarketChangePercent: 1.89, regularMarketVolume: 10345678 },
    { symbol: 'HAPV3', shortName: 'HAPVIDA', regularMarketPrice: 12.89, regularMarketChangePercent: -2.45, regularMarketVolume: 9234567 },
    { symbol: 'FLRY3', shortName: 'FLEURY', regularMarketPrice: 18.45, regularMarketChangePercent: 0.67, regularMarketVolume: 8123456 },
    { symbol: 'CCRO3', shortName: 'CCR', regularMarketPrice: 11.23, regularMarketChangePercent: 1.34, regularMarketVolume: 7012345 },
    { symbol: 'EQTL3', shortName: 'EQUATORIAL', regularMarketPrice: 34.56, regularMarketChangePercent: -1.23, regularMarketVolume: 6901234 },
    { symbol: 'ELET3', shortName: 'ELETROBRAS', regularMarketPrice: 45.67, regularMarketChangePercent: 2.78, regularMarketVolume: 5890123 },
    { symbol: 'CPFE3', shortName: 'CPFL ENERGIA', regularMarketPrice: 29.87, regularMarketChangePercent: -0.56, regularMarketVolume: 4789012 },
    { symbol: 'TAEE11', shortName: 'TAESA', regularMarketPrice: 38.45, regularMarketChangePercent: 1.67, regularMarketVolume: 3678901 },
    { symbol: 'ENGI11', shortName: 'ENERGISA', regularMarketPrice: 42.13, regularMarketChangePercent: -1.89, regularMarketVolume: 2567890 },
    { symbol: 'CMIN3', shortName: 'CSNMINERACAO', regularMarketPrice: 5.67, regularMarketChangePercent: 3.45, regularMarketVolume: 1456789 },
    { symbol: 'GOAU4', shortName: 'GERDAU MET', regularMarketPrice: 8.90, regularMarketChangePercent: -2.13, regularMarketVolume: 1345678 },
    { symbol: 'KLBN11', shortName: 'KLABIN', regularMarketPrice: 21.34, regularMarketChangePercent: 0.89, regularMarketVolume: 1234567 },
    { symbol: 'BEEF3', shortName: 'MINERVA', regularMarketPrice: 6.78, regularMarketChangePercent: 1.45, regularMarketVolume: 1123456 },
    { symbol: 'MRFG3', shortName: 'MARFRIG', regularMarketPrice: 9.87, regularMarketChangePercent: -0.67, regularMarketVolume: 1012345 },
    { symbol: 'BRFS3', shortName: 'BRF', regularMarketPrice: 14.56, regularMarketChangePercent: 2.34, regularMarketVolume: 901234 },
    { symbol: 'SMTO3', shortName: 'SAO MARTINHO', regularMarketPrice: 27.89, regularMarketChangePercent: -1.78, regularMarketVolume: 890123 },
    { symbol: 'CSAN3', shortName: 'COSAN', regularMarketPrice: 19.45, regularMarketChangePercent: 0.98, regularMarketVolume: 789012 },
    { symbol: 'RAIZ4', shortName: 'RAIZEN', regularMarketPrice: 3.67, regularMarketChangePercent: 1.23, regularMarketVolume: 678901 },
    { symbol: 'UGPA3', shortName: 'ULTRAPAR', regularMarketPrice: 16.78, regularMarketChangePercent: -0.45, regularMarketVolume: 567890 },
    { symbol: 'PRIO3', shortName: 'PETRO RIO', regularMarketPrice: 41.23, regularMarketChangePercent: 2.67, regularMarketVolume: 456789 },
    { symbol: 'RECV3', shortName: 'PETRORECONCAVO', regularMarketPrice: 7.89, regularMarketChangePercent: -1.34, regularMarketVolume: 345678 },
    { symbol: 'RRRP3', shortName: '3R PETROLEUM', regularMarketPrice: 25.67, regularMarketChangePercent: 3.12, regularMarketVolume: 234567 },
    { symbol: 'PEAB4', shortName: 'PETROBRAS DISTRIBUIDORA', regularMarketPrice: 18.90, regularMarketChangePercent: -0.78, regularMarketVolume: 123456 },
    { symbol: 'VIVT3', shortName: 'TELEFONICA BRASIL', regularMarketPrice: 49.87, regularMarketChangePercent: 1.56, regularMarketVolume: 112345 },
    { symbol: 'TIMS3', shortName: 'TIM', regularMarketPrice: 13.45, regularMarketChangePercent: -2.89, regularMarketVolume: 101234 },
    { symbol: 'OIBR3', shortName: 'OI', regularMarketPrice: 1.23, regularMarketChangePercent: 4.56, regularMarketVolume: 90123 },
    { symbol: 'ALUP11', shortName: 'ALUPAR', regularMarketPrice: 22.67, regularMarketChangePercent: -1.45, regularMarketVolume: 89012 },
    { symbol: 'TRPL4', shortName: 'CTEEP', regularMarketPrice: 35.89, regularMarketChangePercent: 0.67, regularMarketVolume: 78901 },
    { symbol: 'EGIE3', shortName: 'ENGIE BRASIL', regularMarketPrice: 41.56, regularMarketChangePercent: 1.89, regularMarketVolume: 67890 },
    { symbol: 'NEOE3', shortName: 'NEOENERGIA', regularMarketPrice: 18.34, regularMarketChangePercent: -0.98, regularMarketVolume: 56789 },
    { symbol: 'CMIG4', shortName: 'CEMIG', regularMarketPrice: 12.78, regularMarketChangePercent: 2.45, regularMarketVolume: 45678 },
    { symbol: 'COCE5', shortName: 'COELCE', regularMarketPrice: 29.45, regularMarketChangePercent: -1.67, regularMarketVolume: 34567 },
    { symbol: 'CESP6', shortName: 'CESP', regularMarketPrice: 33.67, regularMarketChangePercent: 0.89, regularMarketVolume: 23456 },
    { symbol: 'ELPL4', shortName: 'ELETROPAULO', regularMarketPrice: 44.89, regularMarketChangePercent: 1.34, regularMarketVolume: 12345 }
];

// Classe Bubble
class Bubble {
    constructor(data, container) {
        this.symbol = data.symbol;
        this.name = data.shortName || data.symbol;
        this.price = data.regularMarketPrice || 0;
        this.change = data.regularMarketChangePercent || 0;
        this.volume = data.regularMarketVolume || 0;
        
        this.container = container;
        this.element = null;
        
        // Propriedades físicas
        this.size = this.calculateSize();
        this.x = Math.random() * Math.max(0, container.clientWidth - this.size);
        this.y = Math.random() * Math.max(0, container.clientHeight - this.size);
        this.vx = (Math.random() - 0.5) * CONFIG.ANIMATION_SPEED;
        this.vy = (Math.random() - 0.5) * CONFIG.ANIMATION_SPEED;
        
        this.createElement();
        this.updateContent();
    }
    
    calculateSize() {
        // Tamanho baseado no volume (logarítmico para melhor distribuição)
        const minVolume = 100000;
        const maxVolume = 50000000;
        const normalizedVolume = Math.log(Math.max(this.volume, minVolume)) / Math.log(maxVolume);
        return CONFIG.BUBBLE_MIN_SIZE + (CONFIG.BUBBLE_MAX_SIZE - CONFIG.BUBBLE_MIN_SIZE) * Math.min(normalizedVolume, 1);
    }
    
    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'bubble';
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        
        // Event listener para abrir gráfico
        this.element.addEventListener('click', () => {
            openTradingViewModal(this.symbol, this.name);
        });
        
        this.container.appendChild(this.element);
    }
    
    updateContent() {
        const colorClass = this.change > 0 ? 'positive' : this.change < 0 ? 'negative' : 'neutral';
        this.element.className = `bubble ${colorClass}`;
        
        const changeSign = this.change > 0 ? '+' : '';
        const fontSize = Math.max(10, this.size / 8);
        
        this.element.innerHTML = `
            <div class="bubble-symbol" style="font-size: ${fontSize}px">${this.symbol}</div>
            <div class="bubble-change" style="font-size: ${fontSize * 0.8}px">${changeSign}${this.change.toFixed(2)}%</div>
            <div class="bubble-price" style="font-size: ${fontSize * 0.7}px">R$ ${this.price.toFixed(2)}</div>
        `;
    }
    
    update() {
        // Movimento browniano
        this.vx += (Math.random() - 0.5) * 0.1;
        this.vy += (Math.random() - 0.5) * 0.1;
        
        // Limitar velocidade
        this.vx = Math.max(-2, Math.min(2, this.vx));
        this.vy = Math.max(-2, Math.min(2, this.vy));
        
        // Atualizar posição
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce nas bordas
        const maxX = Math.max(0, this.container.clientWidth - this.size);
        const maxY = Math.max(0, this.container.clientHeight - this.size);
        
        if (this.x <= 0 || this.x >= maxX) {
            this.vx *= -0.8;
            this.x = Math.max(0, Math.min(maxX, this.x));
        }
        
        if (this.y <= 0 || this.y >= maxY) {
            this.vy *= -0.8;
            this.y = Math.max(0, Math.min(maxY, this.y));
        }
        
        // Aplicar posição
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
    
    checkCollision(other) {
        const dx = this.x + this.size/2 - (other.x + other.size/2);
        const dy = this.y + this.size/2 - (other.y + other.size/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (this.size + other.size) / 2;
        
        if (distance < minDistance && distance > 0) {
            // Separar bolhas
            const overlap = minDistance - distance;
            const separationX = (dx / distance) * overlap * 0.5;
            const separationY = (dy / distance) * overlap * 0.5;
            
            this.x += separationX;
            this.y += separationY;
            other.x -= separationX;
            other.y -= separationY;
            
            // Trocar velocidades (colisão elástica simplificada)
            const tempVx = this.vx;
            const tempVy = this.vy;
            this.vx = other.vx * 0.8;
            this.vy = other.vy * 0.8;
            other.vx = tempVx * 0.8;
            other.vy = tempVy * 0.8;
        }
    }
    
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// Funções principais
async function fetchStockData() {
    try {
        console.log('Tentando buscar dados da API...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);
        
        const response = await fetch(CONFIG.API_URL, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Dados recebidos da API:', data);
        
        if (data.results && data.results.length > 0) {
            useSimulatedData = false;
            return data.results;
        } else {
            throw new Error('Nenhum dado recebido da API');
        }
    } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
        useSimulatedData = true;
        showErrorMessage();
        return generateFallbackData();
    }
}

function generateFallbackData() {
    console.log('Usando dados simulados...');
    return FALLBACK_DATA.map(stock => ({
        ...stock,
        regularMarketChangePercent: (Math.random() - 0.5) * 14 // -7% a +7%
    }));
}

function showErrorMessage() {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}

function createBubbles(stockData) {
    console.log('Criando bolhas com', stockData.length, 'ações');
    const container = document.getElementById('bubbleContainer');
    
    if (!container) {
        console.error('Container de bolhas não encontrado!');
        return;
    }
    
    // Limpar bolhas existentes
    bubbles.forEach(bubble => bubble.destroy());
    bubbles = [];
    
    // Garantir mínimo de bolhas
    const dataToUse = stockData.slice(0, Math.max(CONFIG.MIN_BUBBLES, stockData.length));
    
    // Criar novas bolhas
    dataToUse.forEach((stock, index) => {
        try {
            const bubble = new Bubble(stock, container);
            bubbles.push(bubble);
        } catch (error) {
            console.error(`Erro ao criar bolha ${index}:`, error);
        }
    });
    
    console.log('Criadas', bubbles.length, 'bolhas');
    hideLoading();
}

function updateBubbles() {
    bubbles.forEach((bubble, index) => {
        try {
            bubble.update();
            
            // Verificar colisões com outras bolhas (otimizado)
            for (let i = index + 1; i < bubbles.length; i++) {
                bubble.checkCollision(bubbles[i]);
            }
        } catch (error) {
            console.error(`Erro ao atualizar bolha ${index}:`, error);
        }
    });
}

function animate() {
    try {
        updateBubbles();
        animationId = requestAnimationFrame(animate);
    } catch (error) {
        console.error('Erro na animação:', error);
        // Tentar reiniciar animação
        setTimeout(() => {
            animationId = requestAnimationFrame(animate);
        }, 1000);
    }
}

function hideLoading() {
    const loadingElement = document.getElementById('loadingIndicator');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    isLoading = false;
    console.log('Loading ocultado');
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    const lastUpdateElement = document.querySelector('.last-update');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = `Última atualização: ${timeString}`;
    }
    lastUpdate = now;
}

function updateStatusIndicator() {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    
    if (statusDot && statusText) {
        if (useSimulatedData) {
            statusDot.style.background = '#ff4444';
            statusText.textContent = 'Dados simulados';
        } else {
            statusDot.style.background = '#00ff88';
            statusText.textContent = 'Conectado';
        }
    }
}

// Modal do TradingView
function openTradingViewModal(symbol, name) {
    const modal = document.getElementById('tradingViewModal');
    const modalTitle = document.getElementById('modalTitle');
    const widgetContainer = document.getElementById('tradingViewWidget');
    
    if (!modal || !modalTitle || !widgetContainer) {
        console.error('Elementos do modal não encontrados');
        return;
    }
    
    modalTitle.textContent = `${symbol} - ${name}`;
    modal.style.display = 'flex';
    
    // Limpar widget anterior
    widgetContainer.innerHTML = '';
    
    try {
        // Verificar se TradingView está disponível
        if (typeof TradingView !== 'undefined') {
            new TradingView.widget({
                width: '100%',
                height: '100%',
                symbol: `BMFBOVESPA:${symbol}`,
                interval: 'D',
                timezone: 'America/Sao_Paulo',
                theme: 'dark',
                style: '1',
                locale: 'pt_BR',
                toolbar_bg: '#1a1a1a',
                enable_publishing: false,
                hide_top_toolbar: false,
                hide_legend: false,
                save_image: false,
                container_id: 'tradingViewWidget'
            });
        } else {
            widgetContainer.innerHTML = '<div style="color: white; text-align: center; padding: 50px;">Gráfico não disponível</div>';
        }
    } catch (error) {
        console.error('Erro ao carregar TradingView:', error);
        widgetContainer.innerHTML = '<div style="color: white; text-align: center; padding: 50px;">Erro ao carregar gráfico</div>';
    }
}

function closeModal() {
    const modal = document.getElementById('tradingViewModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Inicialização
async function initializeApp() {
    console.log('Inicializando aplicação...');
    
    try {
        // Buscar dados
        const stockData = await fetchStockData();
        
        // Criar bolhas
        createBubbles(stockData);
        
        // Iniciar animação
        animate();
        
        // Atualizar timestamp
        updateLastUpdateTime();
        updateStatusIndicator();
        
        console.log('Aplicação inicializada com sucesso');
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        
        // Fallback de emergência
        const fallbackData = generateFallbackData();
        createBubbles(fallbackData);
        animate();
        updateLastUpdateTime();
        updateStatusIndicator();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando...');
    
    // Inicializar aplicação
    initializeApp();
    
    // Configurar atualização automática
    setInterval(async () => {
        try {
            console.log('Atualizando dados...');
            const newData = await fetchStockData();
            createBubbles(newData);
            updateLastUpdateTime();
            updateStatusIndicator();
        } catch (error) {
            console.error('Erro na atualização automática:', error);
        }
    }, CONFIG.UPDATE_INTERVAL);
    
    // Event listeners do modal
    const closeModalBtn = document.getElementById('closeModal');
    const modal = document.getElementById('tradingViewModal');
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this || e.target.classList.contains('modal-overlay')) {
                closeModal();
            }
        });
    }
    
    // Event listener para ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Busca de ações
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            bubbles.forEach(bubble => {
                const matches = bubble.symbol.toLowerCase().includes(searchTerm) || 
                               bubble.name.toLowerCase().includes(searchTerm);
                bubble.element.style.opacity = matches || searchTerm === '' ? '1' : '0.3';
            });
        });
    }
    
    // Controles de tempo
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

// Redimensionamento da janela
window.addEventListener('resize', function() {
    const container = document.getElementById('bubbleContainer');
    if (container) {
        bubbles.forEach(bubble => {
            // Reposicionar bolhas que saíram da tela
            bubble.x = Math.min(bubble.x, Math.max(0, container.clientWidth - bubble.size));
            bubble.y = Math.min(bubble.y, Math.max(0, container.clientHeight - bubble.size));
        });
    }
});

// Tratamento de erros globais
window.addEventListener('error', function(e) {
    console.error('Erro global:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise rejeitada:', e.reason);
});

console.log('Script carregado com sucesso');
 