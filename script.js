/**
 * Script para buscar dados da Brapi e integrar com o sistema de Bolhas 3D (Bubble3D).
 * Este script assume que a instância de Bubble3D está disponível globalmente como window.bubble3D.
 */

// Sua chave da API Brapi
const BRAPI_API_KEY = "5bTDfSmR2ieax6y7JUqDAD";

// Função assíncrona para buscar dados da Brapi
async function fetchDataFromBrapi() {
    try {
        const response = await fetch(`https://brapi.dev/api/quote/list?token=${BRAPI_API_KEY}` );
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na requisição Brapi: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const stocks = data.stocks;

        if (!stocks || stocks.length === 0) {
            console.warn("Nenhum dado de ações encontrado na resposta da Brapi.");
            return;
        }

        if (typeof window.bubble3D === "undefined") {
            console.error("Erro: A instância de Bubble3D (window.bubble3D) não foi encontrada.");
            return;
        }

        window.bubble3D.clearBubbles();

        stocks.forEach(stock => {
            const symbol = stock.stock;
            const name = stock.name;
            const changePercent = stock.change_percent;
            const value = stock.regularMarketPrice;
            const marketCap = stock.marketCap;
            const category = "geral";

            if (symbol && value !== undefined && changePercent !== undefined) {
                window.bubble3D.addBubble({
                    symbol: symbol,
                    name: name || symbol,
                    change: parseFloat(changePercent),
                    value: parseFloat(value),
                    marketCap: parseFloat(marketCap || 0),
                    category: category
                });
            } else {
                console.warn(`Dados incompletos para a ação ${symbol || 'desconhecida'}:`, stock);
            }
        });

    } catch (error) {
        console.error("Erro ao buscar dados da Brapi:", error);
    }
}

document.addEventListener("DOMContentLoaded", fetchDataFromBrapi);
setInterval(fetchDataFromBrapi, 60000);
