// Configurações globais
const CONFIG = {
    API_URL: 'https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=100&token=5bTDfSmR2ieax6y7JUqDAD',
    UPDATE_INTERVAL: 10000, // 10 segundos
    MIN_BUBBLES: 50,
    BUBBLE_MIN_SIZE: 40,
    BUBBLE_MAX_SIZE: 120,
    ANIMATION_SPEED: 0.5
};

// Estado global da aplicação
let bubbles = [];
let animationId;
let isLoading = true;
let lastUpdate = null;

// Dados simulados para fallback
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
    { symbol: 'LREN3', shortName: 'LOJAS RENNER', regularMarketPrice: 23.45, regularMarketChangePercent: 2.76, regularMarketVolume: 17012345 }
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
        this.x = Math.random() * (container.clientWidth - this.size);
        this.y = Math.random() * (container.clientHeight - this.size);
        this.vx = (Math.random() - 0.5) * CONFIG.ANIMATION_SPEED;
        this.vy = (Math.random() - 0.5) * CONFIG.ANIMATION_SPEED;
        
        this.createElement();
        this.updateContent();
    }
    
    calculateSize() {
        // Tamanho baseado no volume (logarítmico para melhor distribuição)
        const minVolume = 1000000;
        const maxVolume = 100000000;
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
        if (this.x <= 0 || this.x >= this.container.clientWidth - this.size) {
            this.vx *= -0.8;
            this.x = Math.max(0, Math.min(this.container.clientWidth - this.size, this.x));
        }
        
        if (this.y <= 0 || this.y >= this.container.clientHeight - this.size) {
            this.vy *= -0.8;
            this.y = Math.max(0, Math.min(this.container.clientHeight - this.size, this.y));
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
        
        if (distance < minDistance) {
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
        const response = await fetch(CONFIG.API_URL);
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            return data.results;
        } else {
            throw new Error('No data received');
        }
    } catch (error) {
        console.error('Error fetching stock data:', error);
        showErrorMessage();
        return generateFallbackData();
    }
}

function generateFallbackData() {
    return FALLBACK_DATA.map(stock => ({
        ...stock,
        regularMarketChangePercent: (Math.random() - 0.5) * 14 // -7% a +7%
    }));
}

function showErrorMessage() {
    const errorElement = document.getElementById('errorMessage');
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

function createBubbles(stockData) {
    const container = document.getElementById('bubbleContainer');
    
    // Limpar bolhas existentes
    bubbles.forEach(bubble => bubble.destroy());
    bubbles = [];
    
    // Garantir mínimo de bolhas
    const dataToUse = stockData.slice(0, Math.max(CONFIG.MIN_BUBBLES, stockData.length));
    
    // Criar novas bolhas
    dataToUse.forEach(stock => {
        const bubble = new Bubble(stock, container);
        bubbles.push(bubble);
    });
    
    hideLoading();
}

function updateBubbles() {
    bubbles.forEach((bubble, index) => {
        bubble.update();
        
        // Verificar colisões com outras bolhas
        for (let i = index + 1; i < bubbles.length; i++) {
            bubble.checkCollision(bubbles[i]);
        }
    });
}

function animate() {
    updateBubbles();
    animationId = requestAnimationFrame(animate);
}

function hideLoading() {
    const loadingElement = document.getElementById('loadingIndicator');
    loadingElement.style.display = 'none';
    isLoading = false;
}

function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    document.querySelector('.last-update').textContent = `Última atualização: ${timeString}`;
    lastUpdate = now;
}

// Modal do TradingView
function openTradingViewModal(symbol, name) {
    const modal = document.getElementById('tradingViewModal');
    const modalTitle = document.getElementById('modalTitle');
    const widgetContainer = document.getElementById('tradingViewWidget');
    
    modalTitle.textContent = `${symbol} - ${name}`;
    modal.style.display = 'flex';
    
    // Limpar widget anterior
    widgetContainer.innerHTML = '';
    
    // Criar novo widget TradingView
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
}

function closeModal() {
    const modal = document.getElementById('tradingViewModal');
    modal.style.display = 'none';
}

// Event listeners
document.addEventListener('DOMContentLoaded', async function() {
    // Inicializar aplicação
    const stockData = await fetchStockData();
    createBubbles(stockData);
    animate();
    updateLastUpdateTime();
    
    // Configurar atualização automática
    setInterval(async () => {
        const newData = await fetchStockData();
        createBubbles(newData);
        updateLastUpdateTime();
    }, CONFIG.UPDATE_INTERVAL);
    
    // Event listeners do modal
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('tradingViewModal').addEventListener('click', function(e) {
        if (e.target === this || e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
    });
    
    // Event listener para ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Busca de ações
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        bubbles.forEach(bubble => {
            const matches = bubble.symbol.toLowerCase().includes(searchTerm) || 
                           bubble.name.toLowerCase().includes(searchTerm);
            bubble.element.style.opacity = matches || searchTerm === '' ? '1' : '0.3';
        });
    });
    
    // Controles de tempo (placeholder - funcionalidade futura)
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
    bubbles.forEach(bubble => {
        // Reposicionar bolhas que saíram da tela
        bubble.x = Math.min(bubble.x, container.clientWidth - bubble.size);
        bubble.y = Math.min(bubble.y, container.clientHeight - bubble.size);
    });
});
