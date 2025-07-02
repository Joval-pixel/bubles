import { config } from './config.js';
import { createBubble } from './bubble.js';

const symbols = ['VALE3', 'PETR4', 'ITUB4', 'BBDC4', 'ABEV3', 'BBAS3', 'MGLU3', 'AAPL34', 'AMER3', 'COGN3'];
const API_KEY = config.apiKey;
const API_URL = `https://brapi.dev/api/quote/${symbols.join(',')}?token=${API_KEY}`;

async function fetchStockData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.results && Array.isArray(data.results)) {
            data.results.forEach(stock => {
                const change = stock.regularMarketChangePercent;
                const symbol = stock.symbol;
                createBubble(symbol, change);
            });
        } else {
            console.error("Erro ao carregar dados:", data);
        }
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
    }
}

fetchStockData();
setInterval(fetchStockData, 60000); // Atualiza a cada 1 min