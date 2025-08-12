/**
 * Script para buscar dados da Brapi e integrar com o sistema de Bolhas 3D (Bubble3D).
 * Este script assume que a instância de Bubble3D está disponível globalmente como window.bubble3D.
 */

// Sua chave da API Brapi
const BRAPI_API_KEY = "5bTDfSmR2ieax6y7JUqDAD";

// Função para formatar números para moeda brasileira (mantida do seu script original)
function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Função assíncrona para buscar dados da Brapi
async function fetchDataFromBrapi() {
    try {
        // Endpoint da Brapi para listar ações. 
        // Este endpoint retorna uma lista de ações populares.
        // Se precisar de um conjunto diferente de ações, consulte a documentação da Brapi.
        const response = await fetch(`https://brapi.dev/api/quote/list?token=${BRAPI_API_KEY}` );
        
        // Verifica se a requisição foi bem-sucedida
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na requisição Brapi: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        // A Brapi retorna os dados das ações dentro de um array chamado 'stocks'
        const stocks = data.stocks; 

        // Verifica se há dados de ações
        if (!stocks || stocks.length === 0) {
            console.warn("Nenhum dado de ações encontrado na resposta da Brapi.");
            return;
        }

        // Verifica se a instância de Bubble3D está disponível
        if (typeof window.bubble3D === "undefined") {
            console.error("Erro: A instância de Bubble3D (window.bubble3D) não foi encontrada. " +
                          "Certifique-se de que bubble_3d_script.js foi carregado e inicializado " +
                          "no seu index.html antes deste script.");
            return;
        }

        // Limpa todas as bolhas existentes antes de adicionar as novas
        window.bubble3D.clearBubbles();

        // Itera sobre os dados da Brapi e adiciona cada um como uma bolha 3D
        stocks.forEach(stock => {
            // Mapeamento dos campos da Brapi para o formato esperado pela Bubble3D.
            // Os nomes dos campos (ex: stock.stock, stock.regularMarketPrice) são baseados
            // na documentação e exemplos da Brapi para o endpoint /quote/list.
            const symbol = stock.stock; // Símbolo da ação (ex: PETR4)
            const name = stock.name;   // Nome da empresa (ex: PETROBRAS PN)
            const change = stock.change; // Variação em valor absoluto (ex: 0.50)
            const changePercent = stock.change_percent; // Variação em porcentagem (ex: 1.25)
            const value = stock.regularMarketPrice; // Preço atual (ex: 32.50)
            const marketCap = stock.marketCap; // Capitalização de mercado
            
            // A Brapi não fornece uma categoria de setor diretamente neste endpoint.
            // Você pode definir uma categoria padrão ou implementar uma lógica para inferir.
            const category = "geral"; // Exemplo: "geral", "petroleo", "bancos", etc.

            // Validação básica para garantir que temos dados essenciais para a bolha
            if (symbol && value !== undefined && changePercent !== undefined) {
                window.bubble3D.addBubble({
                    symbol: symbol,
                    name: name || symbol, // Usa o símbolo se o nome completo não estiver disponível
                    change: parseFloat(changePercent), // Usamos a variação percentual para a cor e exibição
                    value: parseFloat(value),
                    marketCap: parseFloat(marketCap || 0), // Garante que é um número, ou 0 se ausente
                    category: category
                });
            } else {
                // Loga um aviso se algum dado essencial estiver faltando para uma ação
                console.warn(`Dados incompletos para a ação ${symbol || 'desconhecida'}:`, stock);
            }
        });

    } catch (error) {
        console.error("Erro ao buscar dados da Brapi:", error);
    }
}

// Chama a função para buscar os dados quando o DOM estiver completamente carregado
document.addEventListener("DOMContentLoaded", fetchDataFromBrapi);

// Opcional: Configura um intervalo para atualizar os dados periodicamente.
// Por exemplo, a cada 1 minuto (60000 milissegundos).
// Ajuste este valor conforme a necessidade de atualização e limites da API.
setInterval(fetchDataFromBrapi, 60000); 
