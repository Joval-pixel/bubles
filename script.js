// Dados das ações brasileiras (baseado na imagem original)
const acoesBrasileiras = [
    { codigo: 'AZUL4', variacao: -7.46, valor: 6.62, volume: 100 },
    { codigo: 'AMBP3', variacao: 18.79, valor: 17.42, volume: 85 },
    { codigo: 'DASA3', variacao: 6.76, valor: 1.46, volume: 90 },
    { codigo: 'VAMO3', variacao: 1.30, valor: 1.31, volume: 45 },
    { codigo: 'POMO4', variacao: 2.64, valor: 14.85, volume: 60 },
    { codigo: 'CPFE3', variacao: -2.80, valor: 37.41, volume: 70 },
    { codigo: 'FNAM11', variacao: 5.86, valor: 8.26, volume: 55 },
    { codigo: 'IGTI11', variacao: 1.76, valor: 21.06, volume: 65 },
    { codigo: 'BRFS3', variacao: -0.53, valor: 14.67, volume: 75 },
    { codigo: 'PETR4', variacao: 0.47, valor: 35.31, volume: 95 },
    { codigo: 'VALE3', variacao: -1.64, valor: 54.71, volume: 88 },
    { codigo: 'ITUB4', variacao: 1.10, valor: 32.22, volume: 80 },
    { codigo: 'BBDC3', variacao: 0.22, valor: 13.45, volume: 72 },
    { codigo: 'MGLU3', variacao: -3.20, valor: 7.28, volume: 68 },
    { codigo: 'WEGE3', variacao: 2.15, valor: 67.89, volume: 58 }
];

// Dados das ações americanas
const acoesAmericanas = [
    { codigo: 'AAPL', variacao: 2.34, valor: 185.92, volume: 95 },
    { codigo: 'MSFT', variacao: 1.87, valor: 378.85, volume: 90 },
    { codigo: 'GOOGL', variacao: -0.45, valor: 142.56, volume: 85 },
    { codigo: 'AMZN', variacao: 3.21, valor: 151.94, volume: 88 },
    { codigo: 'TSLA', variacao: -2.67, valor: 248.42, volume: 82 },
    { codigo: 'META', variacao: 1.95, valor: 484.49, volume: 78 },
    { codigo: 'NVDA', variacao: 4.12, valor: 875.28, volume: 92 },
    { codigo: 'NFLX', variacao: -1.23, valor: 486.81, volume: 65 },
    { codigo: 'AMD', variacao: 2.89, valor: 142.37, volume: 70 },
    { codigo: 'INTC', variacao: -0.78, valor: 23.45, volume: 60 },
    { codigo: 'CRM', variacao: 1.56, valor: 267.89, volume: 55 },
    { codigo: 'ORCL', variacao: 0.92, valor: 112.34, volume: 58 },
    { codigo: 'ADBE', variacao: -1.45, valor: 567.23, volume: 62 },
    { codigo: 'PYPL', variacao: 2.67, valor: 78.45, volume: 48 },
    { codigo: 'DIS', variacao: -0.34, valor: 98.76, volume: 52 }
];

// Variável global para controlar o índice atual
let indiceAtual = 'brasileiro';

// Função para gerar posições das bolhas de forma espaçada
function gerarPosicoes(dados) {
    const posicoes = [];
    const largura = 1000;
    const altura = 600;
    const margemX = 80;
    const margemY = 80;
    
    dados.forEach((acao, index) => {
        // Distribuir as bolhas em uma grade mais espaçada
        const colunas = Math.ceil(Math.sqrt(dados.length));
        const linha = Math.floor(index / colunas);
        const coluna = index % colunas;
        
        const x = margemX + (coluna * (largura - 2 * margemX) / (colunas - 1));
        const y = margemY + (linha * (altura - 2 * margemY) / (Math.ceil(dados.length / colunas) - 1));
        
        // Adicionar um pouco de aleatoriedade para parecer mais natural
        const offsetX = (Math.random() - 0.5) * 40;
        const offsetY = (Math.random() - 0.5) * 40;
        
        posicoes.push({
            x: Math.max(60, Math.min(largura - 60, x + offsetX)),
            y: Math.max(60, Math.min(altura - 60, y + offsetY))
        });
    });
    
    return posicoes;
}

// Função para criar uma bolha melhorada
function criarBolha(acao, posicao, moeda) {
    // Tamanho mínimo maior para garantir que o texto caiba
    const raio = Math.max(40, Math.min(65, 35 + acao.volume * 0.4));
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
    
    // Texto do código da ação
    const textoCodigo = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textoCodigo.setAttribute('x', posicao.x);
    textoCodigo.setAttribute('y', posicao.y - 10);
    textoCodigo.setAttribute('text-anchor', 'middle');
    textoCodigo.setAttribute('fill', 'white');
    textoCodigo.setAttribute('font-weight', 'bold');
    textoCodigo.setAttribute('font-size', '14');
    textoCodigo.setAttribute('class', 'texto-codigo');
    textoCodigo.textContent = acao.codigo;
    
    // Texto da variação percentual
    const textoVariacao = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textoVariacao.setAttribute('x', posicao.x);
    textoVariacao.setAttribute('y', posicao.y + 5);
    textoVariacao.setAttribute('text-anchor', 'middle');
    textoVariacao.setAttribute('fill', 'white');
    textoVariacao.setAttribute('font-weight', '600');
    textoVariacao.setAttribute('font-size', '12');
    textoVariacao.setAttribute('class', 'texto-variacao');
    textoVariacao.textContent = `${acao.variacao > 0 ? '+' : ''}${acao.variacao.toFixed(2)}%`;
    
    // Texto do valor
    const textoValor = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textoValor.setAttribute('x', posicao.x);
    textoValor.setAttribute('y', posicao.y + 20);
    textoValor.setAttribute('text-anchor', 'middle');
    textoValor.setAttribute('fill', 'white');
    textoValor.setAttribute('font-size', '11');
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
        renderizarGrafico(acoesBrasileiras, 'R$');
    } else {
        btnAmericano.classList.add('ativo');
        btnBrasileiro.classList.remove('ativo');
        renderizarGrafico(acoesAmericanas, '$');
    }
}

// Função para adicionar efeitos de hover
function adicionarEfeitosHover() {
    const style = document.createElement('style');
    style.textContent = `
        .bolha-grupo:hover .bolha-circle {
            opacity: 1 !important;
            stroke-width: 3 !important;
            transform: scale(1.05);
            transition: all 0.3s ease;
        }
        
        .bolha-grupo {
            cursor: pointer;
        }
        
        .bolha-circle {
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

// Função para tornar o gráfico responsivo
function tornarResponsivo() {
    function ajustarTamanho() {
        const container = document.querySelector('.grafico-container');
        const svg = document.getElementById('grafico-svg');
        
        if (window.innerWidth < 768) {
            svg.setAttribute('height', '400');
            svg.setAttribute('viewBox', '0 0 800 400');
        } else {
            svg.setAttribute('height', '600');
            svg.setAttribute('viewBox', '0 0 1000 600');
        }
        
        // Re-renderizar com o índice atual
        const dados = indiceAtual === 'brasileiro' ? acoesBrasileiras : acoesAmericanas;
        const moeda = indiceAtual === 'brasileiro' ? 'R$' : '$';
        renderizarGrafico(dados, moeda);
    }
    
    window.addEventListener('resize', ajustarTamanho);
    ajustarTamanho(); // Executar uma vez no carregamento
}

// Inicialização quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Bubles - Gráfico de Bolhas Melhorado carregado!');
    
    // Adicionar efeitos visuais
    adicionarEfeitosHover();
    
    // Tornar responsivo
    tornarResponsivo();
    
    // Carregar gráfico inicial (brasileiro)
    alternarIndice('brasileiro');
    
    console.log('✅ Melhorias implementadas:');
    console.log('- Bolhas maiores para melhor legibilidade');
    console.log('- Texto centralizado dentro das bolhas');
    console.log('- Botão para índice americano');
    console.log('- Efeitos hover melhorados');
    console.log('- Design responsivo');
});

// Função para exportar dados (funcionalidade extra)
function exportarDados() {
    const dados = indiceAtual === 'brasileiro' ? acoesBrasileiras : acoesAmericanas;
    const dataStr = JSON.stringify(dados, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `acoes_${indiceAtual}.json`;
    link.click();
}

// Disponibilizar função globalmente para uso opcional
window.exportarDados = exportarDados;

