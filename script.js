// BUBLES - Script Principal Corrigido
// Versão com correção do erro de carregamento de gráficos

// Configuração da API
const CONFIG = {
    API_URL: 'https://brapi.dev/api/quote/list?limit=100&page=1',
    API_TIMEOUT: 10000,
    UPDATE_INTERVAL: 10000
};

// Variáveis globais
let useSimulatedData = false;
let updateInterval;
let currentStocks = [];

// FUNÇÃO CORRIGIDA: fetchStockData
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
        
        // CORREÇÃO PRINCIPAL: verificar data.stocks ao invés de data.results
        if (data.stocks && data.stocks.length > 0) {
            useSimulatedData = false;
            hideErrorMessage();
            return data.stocks;
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

// FUNÇÃO CORRIGIDA: createBubbles
function createBubbles(stocks) {
    console.log(`Criando bolhas com ${stocks.length} ações`);
    
    const container = document.querySelector('.bubble-container') || 
                     document.querySelector('#bubble-container') || 
                     document.querySelector('.bubbles-container');
    
    if (!container) {
        console.error('Container de bolhas não encontrado');
        return;
    }
    
    // Limpar bolhas existentes
    container.innerHTML = '';
    
    // Criar bolhas para as primeiras 50 ações
    stocks.slice(0, 50).forEach((stock, index) => {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // Usar a estrutura correta dos dados da API
        const stockCode = stock.stock || stock.symbol || 'N/A';
        const stockName = stock.name || stockCode;
        const price = stock.close || stock.price || 0;
        const change = stock.change || 0;
        const volume = stock.volume || 0;
        
        // Calcular tamanho da bolha baseado no volume
        const minSize = 60;
        const maxSize = 120;
        const normalizedVolume = Math.min(volume / 10000000, 1);
        const bubbleSize = minSize + (normalizedVolume * (maxSize - minSize));
        
        // Posicionamento aleatório
        const x = Math.random() * (window.innerWidth - bubbleSize);
        const y = Math.random() * (window.innerHeight - bubbleSize - 200) + 100;
        
        bubble.innerHTML = `
            <div class="stock-code">${stockCode}</div>
            <div class="stock-change">${change > 0 ? '+' : ''}${change.toFixed(2)}%</div>
            <div class="stock-price">R$ ${price.toFixed(2)}</div>
        `;
        
        // Aplicar estilos
        bubble.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: ${bubbleSize}px;
            height: ${bubbleSize}px;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        // Aplicar cor baseada na variação
        if (change > 0) {
            bubble.style.backgroundColor = '#10b981'; // Verde
        } else if (change < 0) {
            bubble.style.backgroundColor = '#ef4444'; // Vermelho
        } else {
            bubble.style.backgroundColor = '#6b7280'; // Cinza
        }
        
        // Adicionar interatividade
        bubble.addEventListener('mouseenter', () => {
            bubble.style.transform = 'scale(1.1)';
            bubble.style.zIndex = '1000';
        });
        
        bubble.addEventListener('mouseleave', () => {
            bubble.style.transform = 'scale(1)';
            bubble.style.zIndex = 'auto';
        });
        
        bubble.addEventListener('click', () => {
            showStockDetails(stock);
        });
        
        container.appendChild(bubble);
    });
    
    console.log(`✅ ${stocks.length} bolhas criadas`);
    hideLoading();
}

// Função para mostrar detalhes da ação
function showStockDetails(stock) {
    const modal = document.createElement('div');
    modal.className = 'stock-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>${stock.stock} - ${stock.name}</h2>
            <p><strong>Preço:</strong> R$ ${stock.close.toFixed(2)}</p>
            <p><strong>Variação:</strong> ${stock.change > 0 ? '+' : ''}${stock.change.toFixed(2)}%</p>
            <p><strong>Volume:</strong> ${stock.volume.toLocaleString()}</p>
            <p><strong>Setor:</strong> ${stock.sector}</p>
            <p><strong>Tipo:</strong> ${stock.type}</p>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const content = modal.querySelector('.modal-content');
    content.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 10px;
        max-width: 400px;
        width: 90%;
        position: relative;
    `;
    
    const closeBtn = modal.querySelector('.close');
    closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 15px;
        font-size: 24px;
        cursor: pointer;
    `;
    
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    document.body.appendChild(modal);
}

// Função para mostrar mensagem de erro
function showErrorMessage() {
    let errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = '⚠️ Erro ao carregar dados. Usando dados simulados.';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ef4444;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(errorDiv);
    }
}

// Função para esconder mensagem de erro
function hideErrorMessage() {
    const errorDiv = document.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Função para mostrar loading
function showLoading() {
    let loadingDiv = document.querySelector('.loading');
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        loadingDiv.innerHTML = 'Carregando dados...';
        loadingDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 1000;
        `;
        document.body.appendChild(loadingDiv);
    }
}

// Função para esconder loading
function hideLoading() {
    const loadingDiv = document.querySelector('.loading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Função para gerar dados de fallback
function generateFallbackData() {
    const fallbackStocks = [
        { stock: 'PETR4', name: 'PETROBRAS', close: 32.45, change: 4.81, volume: 1000000, sector: 'Energy', type: 'stock' },
        { stock: 'VALE3', name: 'VALE', close: 65.78, change: -5.28, volume: 800000, sector: 'Mining', type: 'stock' },
        { stock: 'ITUB4', name: 'ITAU UNIBANCO', close: 28.90, change: -6.96, volume: 1200000, sector: 'Finance', type: 'stock' },
        { stock: 'BBDC4', name: 'BRADESCO', close: 15.67, change: 4.63, volume: 900000, sector: 'Finance', type: 'stock' },
        { stock: 'ABEV3', name: 'AMBEV', close: 12.34, change: -2.17, volume: 700000, sector: 'Consumer', type: 'stock' }
    ];
    
    return fallbackStocks;
}

// Função para atualizar dados
async function updateData() {
    console.log('Atualizando dados...');
    showLoading();
    
    try {
        const stocks = await fetchStockData();
        currentStocks = stocks;
        createBubbles(stocks);
    } catch (error) {
        console.error('Erro ao atualizar dados:', error);
    }
}

// Função de busca
function setupSearch() {
    const searchInput = document.querySelector('input[placeholder*="Buscar"]');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const bubbles = document.querySelectorAll('.bubble');
            
            bubbles.forEach(bubble => {
                const stockCode = bubble.querySelector('.stock-code').textContent.toLowerCase();
                if (stockCode.includes(searchTerm)) {
                    bubble.style.display = 'flex';
                } else {
                    bubble.style.display = 'none';
                }
            });
        });
    }
}

// Função de inicialização
async function initializeApp() {
    console.log('Inicializando aplicação...');
    
    try {
        // Buscar dados iniciais
        const stocks = await fetchStockData();
        currentStocks = stocks;
        
        // Criar visualização
        createBubbles(stocks);
        
        // Configurar busca
        setupSearch();
        
        // Configurar atualização automática
        updateInterval = setInterval(updateData, CONFIG.UPDATE_INTERVAL);
        
        console.log('Aplicação inicializada com sucesso');
    } catch (error) {
        console.error('Erro na inicialização:', error);
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, inicializando...');
    initializeApp();
});

// Limpar interval ao sair da página
window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});
 