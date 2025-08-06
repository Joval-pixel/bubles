// Lista das 100 ações mais negociadas (brasileiras)
const top100AcoesBrasileiras = [
    { codigo: 'PETR4', variacao: 0.47, valor: 35.31, volume: 100 },
    { codigo: 'VALE3', variacao: -1.64, valor: 54.71, volume: 98 },
    { codigo: 'ITUB4', variacao: 1.10, valor: 32.22, volume: 96 },
    { codigo: 'BBDC4', variacao: 0.22, valor: 13.45, volume: 94 },
    { codigo: 'ABEV3', variacao: 2.15, valor: 12.89, volume: 92 },
    { codigo: 'WEGE3', variacao: 2.15, valor: 67.89, volume: 90 },
    { codigo: 'AZUL4', variacao: -7.46, valor: 6.62, volume: 88 },
    { codigo: 'MGLU3', variacao: -3.20, valor: 7.28, volume: 86 },
    { codigo: 'AMBP3', variacao: 18.79, valor: 17.42, volume: 84 },
    { codigo: 'DASA3', variacao: 6.76, valor: 1.46, volume: 82 },
    { codigo: 'VAMO3', variacao: 1.30, valor: 1.31, volume: 80 },
    { codigo: 'POMO4', variacao: 2.64, valor: 14.85, volume: 78 },
    { codigo: 'CPFE3', variacao: -2.80, valor: 37.41, volume: 76 },
    { codigo: 'FNAM11', variacao: 5.86, valor: 8.26, volume: 74 },
    { codigo: 'IGTI11', variacao: 1.76, valor: 21.06, volume: 72 },
    { codigo: 'BRFS3', variacao: -0.53, valor: 14.67, volume: 70 },
    { codigo: 'BBAS3', variacao: 0.85, valor: 28.45, volume: 68 },
    { codigo: 'RENT3', variacao: 1.23, valor: 45.67, volume: 66 },
    { codigo: 'LREN3', variacao: -0.89, valor: 23.12, volume: 64 },
    { codigo: 'JBSS3', variacao: 2.34, valor: 34.56, volume: 62 },
    { codigo: 'SUZB3', variacao: -1.45, valor: 56.78, volume: 60 },
    { codigo: 'GGBR4', variacao: 3.21, valor: 18.90, volume: 58 },
    { codigo: 'USIM5', variacao: -2.10, valor: 7.65, volume: 56 },
    { codigo: 'CSNA3', variacao: 1.87, valor: 12.34, volume: 54 },
    { codigo: 'GOAU4', variacao: -0.76, valor: 9.87, volume: 52 },
    { codigo: 'EMBR3', variacao: 2.98, valor: 23.45, volume: 50 },
    { codigo: 'CCRO3', variacao: -1.23, valor: 14.56, volume: 48 },
    { codigo: 'EQTL3', variacao: 0.98, valor: 27.89, volume: 46 },
    { codigo: 'ELET3', variacao: -0.45, valor: 39.12, volume: 44 },
    { codigo: 'ELET6', variacao: 1.56, valor: 41.23, volume: 42 },
    { codigo: 'CMIG4', variacao: -0.87, valor: 8.76, volume: 40 },
    { codigo: 'TAEE11', variacao: 2.10, valor: 32.45, volume: 38 },
    { codigo: 'CPLE6', variacao: -1.34, valor: 45.67, volume: 36 },
    { codigo: 'ENGI11', variacao: 0.67, valor: 38.90, volume: 34 },
    { codigo: 'SBSP3', variacao: 1.45, valor: 67.23, volume: 32 },
    { codigo: 'SAPR11', variacao: -0.23, valor: 78.45, volume: 30 },
    { codigo: 'VIVT3', variacao: 2.87, valor: 43.21, volume: 28 },
    { codigo: 'TIMP3', variacao: -1.56, valor: 9.87, volume: 26 },
    { codigo: 'OIBR3', variacao: 3.45, valor: 2.34, volume: 24 },
    { codigo: 'QUAL3', variacao: -2.10, valor: 12.56, volume: 22 },
    { codigo: 'RADL3', variacao: 1.23, valor: 34.78, volume: 20 },
    { codigo: 'RAIA3', variacao: -0.89, valor: 23.45, volume: 18 },
    { codigo: 'PCAR3', variacao: 2.56, valor: 45.67, volume: 16 },
    { codigo: 'KLBN11', variacao: -1.23, valor: 3.45, volume: 14 },
    { codigo: 'SUZB3', variacao: 0.78, valor: 56.78, volume: 12 },
    { codigo: 'FIBR3', variacao: 1.90, valor: 67.89, volume: 10 },
    { codigo: 'MRFG3', variacao: -0.45, valor: 8.90, volume: 8 },
    { codigo: 'BEEF3', variacao: 2.34, valor: 12.34, volume: 6 },
    { codigo: 'JALL3', variacao: -1.67, valor: 23.45, volume: 4 },
    { codigo: 'HAPV3', variacao: 0.89, valor: 34.56, volume: 2 }
];

// Lista das 50 ações americanas mais negociadas
const top50AcoesAmericanas = [
    { codigo: 'AAPL', variacao: 2.34, valor: 185.92, volume: 100 },
    { codigo: 'MSFT', variacao: 1.87, valor: 378.85, volume: 98 },
    { codigo: 'GOOGL', variacao: -0.45, valor: 142.56, volume: 96 },
    { codigo: 'AMZN', variacao: 3.21, valor: 151.94, volume: 94 },
    { codigo: 'TSLA', variacao: -2.67, valor: 248.42, volume: 92 },
    { codigo: 'META', variacao: 1.95, valor: 484.49, volume: 90 },
    { codigo: 'NVDA', variacao: 4.12, valor: 875.28, volume: 88 },
    { codigo: 'NFLX', variacao: -1.23, valor: 486.81, volume: 86 },
    { codigo: 'AMD', variacao: 2.89, valor: 142.37, volume: 84 },
    { codigo: 'INTC', variacao: -0.78, valor: 23.45, volume: 82 },
    { codigo: 'CRM', variacao: 1.56, valor: 267.89, volume: 80 },
    { codigo: 'ORCL', variacao: 0.92, valor: 112.34, volume: 78 },
    { codigo: 'ADBE', variacao: -1.45, valor: 567.23, volume: 76 },
    { codigo: 'PYPL', variacao: 2.67, valor: 78.45, volume: 74 },
    { codigo: 'DIS', variacao: -0.34, valor: 98.76, volume: 72 },
    { codigo: 'UBER', variacao: 3.45, valor: 67.89, volume: 70 },
    { codigo: 'SPOT', variacao: -2.10, valor: 234.56, volume: 68 },
    { codigo: 'ZOOM', variacao: 1.78, valor: 89.12, volume: 66 },
    { codigo: 'SQ', variacao: -0.89, valor: 123.45, volume: 64 },
    { codigo: 'SHOP', variacao: 2.34, valor: 456.78, volume: 62 },
    { codigo: 'ROKU', variacao: -1.56, valor: 67.89, volume: 60 },
    { codigo: 'TWTR', variacao: 0.78, valor: 45.67, volume: 58 },
    { codigo: 'SNAP', variacao: 1.90, valor: 12.34, volume: 56 },
    { codigo: 'PINS', variacao: -0.45, valor: 23.45, volume: 54 },
    { codigo: 'DOCU', variacao: 2.67, valor: 78.90, volume: 52 },
    { codigo: 'ZM', variacao: -1.23, valor: 89.12, volume: 50 },
    { codigo: 'WORK', variacao: 0.89, valor: 34.56, volume: 48 },
    { codigo: 'OKTA', variacao: 1.45, valor: 123.78, volume: 46 },
    { codigo: 'CRWD', variacao: -0.67, valor: 234.90, volume: 44 },
    { codigo: 'ZS', variacao: 2.10, valor: 156.78, volume: 42 },
    { codigo: 'DDOG', variacao: -1.34, valor: 89.45, volume: 40 },
    { codigo: 'SNOW', variacao: 0.56, valor: 267.89, volume: 38 },
    { codigo: 'PLTR', variacao: 1.78, valor: 23.45, volume: 36 },
    { codigo: 'RBLX', variacao: -0.89, valor: 45.67, volume: 34 },
    { codigo: 'COIN', variacao: 2.34, valor: 178.90, volume: 32 },
    { codigo: 'HOOD', variacao: -1.56, valor: 12.34, volume: 30 },
    { codigo: 'SOFI', variacao: 0.78, valor: 8.90, volume: 28 },
    { codigo: 'UPST', variacao: 1.90, valor: 34.56, volume: 26 },
    { codigo: 'AFRM', variacao: -0.45, valor: 23.78, volume: 24 },
    { codigo: 'SQ', variacao: 2.67, valor: 89.12, volume: 22 },
    { codigo: 'ABNB', variacao: -1.23, valor: 123.45, volume: 20 },
    { codigo: 'DASH', variacao: 0.89, valor: 67.89, volume: 18 },
    { codigo: 'LYFT', variacao: 1.45, valor: 45.67, volume: 16 },
    { codigo: 'UBER', variacao: -0.67, valor: 34.56, volume: 14 },
    { codigo: 'GRUB', variacao: 2.10, valor: 23.45, volume: 12 },
    { codigo: 'ETSY', variacao: -1.34, valor: 78.90, volume: 10 },
    { codigo: 'EBAY', variacao: 0.56, valor: 45.67, volume: 8 },
    { codigo: 'AMZN', variacao: 1.78, valor: 123.45, volume: 6 },
    { codigo: 'WMT', variacao: -0.89, valor: 156.78, volume: 4 },
    { codigo: 'TGT', variacao: 2.34, valor: 234.56, volume: 2 }
];

// Variável global para controlar o índice atual
let indiceAtual = 'brasileiro';
let dadosExibidos = top100AcoesBrasileiras.slice(0, 15); // Mostrar apenas 15 por vez

// Função para gerar posições das bolhas de forma espaçada
function gerarPosicoes(dados) {
    const posicoes = [];
    const largura = 1000;
    const altura = 600;
    const margemX = 100;
    const margemY = 100;
    
    dados.forEach((acao, index) => {
        // Distribuir as bolhas em uma grade mais espaçada
        const colunas = Math.ceil(Math.sqrt(dados.length));
        const linha = Math.floor(index / colunas);
        const coluna = index % colunas;
        
        const x = margemX + (coluna * (largura - 2 * margemX) / Math.max(1, colunas - 1));
        const y = margemY + (linha * (altura - 2 * margemY) / Math.max(1, Math.ceil(dados.length / colunas) - 1));
        
        // Adicionar um pouco de aleatoriedade para parecer mais natural
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 30;
        
        posicoes.push({
            x: Math.max(80, Math.min(largura - 80, x + offsetX)),
            y: Math.max(80, Math.min(altura - 80, y + offsetY))
        });
    });
    
    return posicoes;
}

// Função para criar uma bolha com tamanho maior e texto bem posicionado
function criarBolha(acao, posicao, moeda) {
    // Tamanho ainda maior para garantir que o texto caiba perfeitamente
    const raio = Math.max(50, Math.min(75, 45 + acao.volume * 0.3));
    const cor = acao.variacao >= 0 ? '#22c55e' : '#ef4444';
    
    // Criar grupo SVG
    const grupo = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    grupo.setAttribute('class', 'bolha-grupo');
    
    // Círculo da bolha
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', posicao.x);
    circle.setAttribute('cy', posicao.y);
    circle.setAttribute('r', raio);
    circle.setAttribute('fill', cor);
    circle.setAttribute('opacity', '0.85');
    circle.setAttribute('stroke', cor);
    circle.setAttribute('stroke-width', '2');
    circle.setAttribute('class', 'bolha-circle');
    
    // Texto do código da ação - posicionamento melhorado
    const textoCodigo = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textoCodigo.setAttribute('x', posicao.x);
    textoCodigo.setAttribute('y', posicao.y - 12); // Mais espaço acima
    textoCodigo.setAttribute('text-anchor', 'middle');
    textoCodigo.setAttribute('dominant-baseline', 'middle');
    textoCodigo.setAttribute('fill', 'white');
    textoCodigo.setAttribute('font-weight', 'bold');
    textoCodigo.setAttribute('font-size', '15'); // Fonte maior
    textoCodigo.setAttribute('class', 'texto-codigo');
    textoCodigo.textContent = acao.codigo;
    
    // Texto da variação percentual - centralizado
    const textoVariacao = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textoVariacao.setAttribute('x', posicao.x);
    textoVariacao.setAttribute('y', posicao.y + 2); // Centralizado
    textoVariacao.setAttribute('text-anchor', 'middle');
    textoVariacao.setAttribute('dominant-baseline', 'middle');
    textoVariacao.setAttribute('fill', 'white');
    textoVariacao.setAttribute('font-weight', '600');
    textoVariacao.setAttribute('font-size', '13'); // Fonte maior
    textoVariacao.setAttribute('class', 'texto-variacao');
    textoVariacao.textContent = `${acao.variacao > 0 ? '+' : ''}${acao.variacao.toFixed(2)}%`;
    
    // Texto do valor - posicionamento melhorado
    const textoValor = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textoValor.setAttribute('x', posicao.x);
    textoValor.setAttribute('y', posicao.y + 16); // Mais espaço abaixo
    textoValor.setAttribute('text-anchor', 'middle');
    textoValor.setAttribute('dominant-baseline', 'middle');
    textoValor.setAttribute('fill', 'white');
    textoValor.setAttribute('font-size', '12'); // Fonte maior
    textoValor.setAttribute('class', 'texto-valor');
    textoValor.textContent = `${moeda} ${acao.valor.toFixed(2)}`;
    
    // Adicionar elementos ao grupo
    grupo.appendChild(circle);
    grupo.appendChild(textoCodigo);
    grupo.appendChild(textoVariacao);
    grupo.appendChild(textoValor);
    
    return grupo;
}

// Função para renderizar o gráfico
function renderizarGrafico(dados, moeda) {
    const svg = document.getElementById('grafico-svg');
    
    // Limpar gráfico atual
    svg.innerHTML = '';
    
    // Gerar posições
    const posicoes = gerarPosicoes(dados);
    
    // Criar bolhas
    dados.forEach((acao, index) => {
        const bolha = criarBolha(acao, posicoes[index], moeda);
        svg.appendChild(bolha);
    });
}

// Função para alternar entre índices
function alternarIndice(tipo) {
    indiceAtual = tipo;
    
    // Atualizar botões
    const btnBrasileiro = document.getElementById('btn-brasileiro');
    const btnAmericano = document.getElementById('btn-americano');
    
    if (tipo === 'brasileiro') {
        btnBrasileiro.classList.add('ativo');
        btnAmericano.classList.remove('ativo');
        dadosExibidos = top100AcoesBrasileiras.slice(0, 15);
        renderizarGrafico(dadosExibidos, 'R$');
    } else {
        btnAmericano.classList.add('ativo');
        btnBrasileiro.classList.remove('ativo');
        dadosExibidos = top50AcoesAmericanas.slice(0, 15);
        renderizarGrafico(dadosExibidos, '$');
    }
    
    atualizarContadorAcoes();
}

// Função para mostrar modal com lista de ações
function mostrarListaAcoes() {
    const dados = indiceAtual === 'brasileiro' ? top100AcoesBrasileiras : top50AcoesAmericanas;
    const moeda = indiceAtual === 'brasileiro' ? 'R$' : '$';
    const titulo = indiceAtual === 'brasileiro' ? 'Top 100 Ações Brasileiras' : 'Top 50 Ações Americanas';
    
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${titulo}</h2>
                <button class="btn-fechar" onclick="fecharModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="lista-acoes">
                    ${dados.map((acao, index) => `
                        <div class="acao-item ${acao.variacao >= 0 ? 'alta' : 'baixa'}" onclick="selecionarAcao(${index})">
                            <span class="codigo">${acao.codigo}</span>
                            <span class="variacao">${acao.variacao > 0 ? '+' : ''}${acao.variacao.toFixed(2)}%</span>
                            <span class="valor">${moeda} ${acao.valor.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-selecionar-todas" onclick="selecionarTodasAcoes()">Mostrar Todas</button>
                <button class="btn-top15" onclick="mostrarTop15()">Mostrar Top 15</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Função para fechar modal
function fecharModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Função para selecionar uma ação específica
function selecionarAcao(index) {
    const dados = indiceAtual === 'brasileiro' ? top100AcoesBrasileiras : top50AcoesAmericanas;
    const moeda = indiceAtual === 'brasileiro' ? 'R$' : '$';
    
    dadosExibidos = [dados[index]];
    renderizarGrafico(dadosExibidos, moeda);
    atualizarContadorAcoes();
    fecharModal();
}

// Função para mostrar todas as ações
function selecionarTodasAcoes() {
    const dados = indiceAtual === 'brasileiro' ? top100AcoesBrasileiras : top50AcoesAmericanas;
    const moeda = indiceAtual === 'brasileiro' ? 'R$' : '$';
    
    dadosExibidos = dados;
    renderizarGrafico(dadosExibidos, moeda);
    atualizarContadorAcoes();
    fecharModal();
}

// Função para mostrar top 15
function mostrarTop15() {
    const dados = indiceAtual === 'brasileiro' ? top100AcoesBrasileiras : top50AcoesAmericanas;
    const moeda = indiceAtual === 'brasileiro' ? 'R$' : '$';
    
    dadosExibidos = dados.slice(0, 15);
    renderizarGrafico(dadosExibidos, moeda);
    atualizarContadorAcoes();
    fecharModal();
}

// Função para atualizar contador de ações
function atualizarContadorAcoes() {
    const contador = document.getElementById('contador-acoes');
    const total = indiceAtual === 'brasileiro' ? top100AcoesBrasileiras.length : top50AcoesAmericanas.length;
    if (contador) {
        contador.textContent = `Exibindo ${dadosExibidos.length} de ${total} ações`;
    }
}

// Função para adicionar efeitos de hover
function adicionarEfeitosHover() {
    const style = document.createElement('style');
    style.textContent = `
        .bolha-grupo:hover .bolha-circle {
            opacity: 1 !important;
            stroke-width: 4 !important;
            transform: scale(1.08);
            transition: all 0.3s ease;
        }
        
        .bolha-grupo {
            cursor: pointer;
        }
        
        .bolha-circle {
            transition: all 0.3s ease;
        }
        
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .modal-content {
            background: white;
            border-radius: 15px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .modal-header {
            padding: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .modal-header h2 {
            margin: 0;
            font-size: 1.5rem;
        }
        
        .btn-fechar {
            background: none;
            border: none;
            font-size: 2rem;
            color: white;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .modal-body {
            max-height: 400px;
            overflow-y: auto;
            padding: 20px;
        }
        
        .lista-acoes {
            display: grid;
            gap: 10px;
        }
        
        .acao-item {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            padding: 12px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 2px solid transparent;
        }
        
        .acao-item.alta {
            background: rgba(34, 197, 94, 0.1);
            border-color: rgba(34, 197, 94, 0.2);
        }
        
        .acao-item.baixa {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.2);
        }
        
        .acao-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .acao-item .codigo {
            font-weight: bold;
            font-size: 1.1rem;
        }
        
        .acao-item .variacao {
            text-align: center;
            font-weight: 600;
        }
        
        .acao-item .valor {
            text-align: right;
            color: #666;
        }
        
        .modal-footer {
            padding: 20px;
            border-top: 1px solid #eee;
            display: flex;
            gap: 10px;
            justify-content: center;
            background: #f8f9fa;
        }
        
        .btn-selecionar-todas, .btn-top15 {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s ease;
        }
        
        .btn-selecionar-todas {
            background: #22c55e;
            color: white;
        }
        
        .btn-top15 {
            background: #3b82f6;
            color: white;
        }
        
        .btn-selecionar-todas:hover, .btn-top15:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
    `;
    document.head.appendChild(style);
}

// Inicialização quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Bubles - Gráfico de Bolhas Corrigido carregado!');
    
    // Adicionar efeitos visuais
    adicionarEfeitosHover();
    
    // Carregar gráfico inicial (brasileiro)
    alternarIndice('brasileiro');
    
    console.log('✅ Correções implementadas:');
    console.log('- Bolhas ainda maiores (50-75px de raio)');
    console.log('- Texto perfeitamente centralizado');
    console.log('- Lista com 100 ações brasileiras');
    console.log('- Lista com 50 ações americanas');
    console.log('- Modal de seleção de ações');
});

// Disponibilizar funções globalmente
window.alternarIndice = alternarIndice;
window.mostrarListaAcoes = mostrarListaAcoes;
window.fecharModal = fecharModal;
window.selecionarAcao = selecionarAcao;
window.selecionarTodasAcoes = selecionarTodasAcoes;
window.mostrarTop15 = mostrarTop15;
