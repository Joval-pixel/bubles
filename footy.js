// /api/footy.js — Proxy para API-Football (RapidAPI)
// Versão atualizada com melhor tratamento de erros

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { path = "/v3/fixtures", ...query } = req.query;
    
    // Verificar se a chave da API está configurada
    if (!process.env.RAPIDAPI_KEY) {
      console.log('RAPIDAPI_KEY não configurada, retornando dados de demonstração');
      
      // Retornar dados de demonstração quando API não configurada
      const demoData = generateDemoData(path, query);
      return res.status(200).json({
        response: demoData,
        demo: true,
        message: "Dados de demonstração - Configure RAPIDAPI_KEY para dados reais"
      });
    }

    const host = "api-football-v1.p.rapidapi.com";
    const url = new URL(`https://${host}${path}` );
    
    // Adicionar parâmetros da query
    Object.entries(query).forEach(([k, v]) => {
      if (v) url.searchParams.set(k, v);
    });

    console.log('Fazendo requisição para:', url.toString());

    const response = await fetch(url, {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": host
      }
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Log para debug
    console.log('API Response:', {
      status: response.status,
      dataLength: data.response?.length || 0
    });
    
    res.status(200).json(data);
    
  } catch (err) {
    console.error('API Error:', err.message);
    
    // Em caso de erro, retornar dados de demonstração
    const demoData = generateDemoData(req.query.path, req.query);
    
    res.status(200).json({
      response: demoData,
      demo: true,
      error: err.message,
      message: "Erro na API - Retornando dados de demonstração"
    });
  }
}

// Função para gerar dados de demonstração
function generateDemoData(path, query) {
  if (path === '/v3/fixtures' || !path) {
    return generateFixtures();
  } else if (path === '/v3/odds') {
    return generateOdds(query.fixture);
  }
  return [];
}

function generateFixtures() {
  const teams = [
    { home: 'Flamengo', away: 'Palmeiras', league: 'Brasileirão', country: 'Brazil' },
    { home: 'Real Madrid', away: 'Barcelona', league: 'La Liga', country: 'Spain' },
    { home: 'Manchester City', away: 'Liverpool', league: 'Premier League', country: 'England' },
    { home: 'Bayern Munich', away: 'Borussia Dortmund', league: 'Bundesliga', country: 'Germany' },
    { home: 'PSG', away: 'Marseille', league: 'Ligue 1', country: 'France' },
    { home: 'Juventus', away: 'Inter Milan', league: 'Serie A', country: 'Italy' },
    { home: 'Arsenal', away: 'Chelsea', league: 'Premier League', country: 'England' },
    { home: 'Atletico Madrid', away: 'Valencia', league: 'La Liga', country: 'Spain' },
    { home: 'Santos', away: 'Corinthians', league: 'Brasileirão', country: 'Brazil' },
    { home: 'São Paulo', away: 'Vasco', league: 'Brasileirão', country: 'Brazil' }
  ];

  return teams.map((match, index) => ({
    fixture: {
      id: 1000 + index,
      date: new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      status: { short: 'NS' }
    },
    league: {
      id: 100 + index,
      name: match.league,
      country: match.country,
      season: 2024
    },
    teams: {
      home: {
        id: 200 + index,
        name: match.home
      },
      away: {
        id: 300 + index,
        name: match.away
      }
    }
  }));
}

function generateOdds(fixtureId) {
  const bookmakers = ['Bet365', 'Betfair', 'William Hill', 'Pinnacle', 'Betway'];
  
  return bookmakers.map((bookmaker, index) => ({
    fixture: {
      id: parseInt(fixtureId) || 1000
    },
    bookmaker: {
      id: 400 + index,
      name: bookmaker
    },
    bets: [
      {
        id: 1,
        name: 'Match Winner',
        values: [
          { value: 'Home', odd: (1.5 + Math.random() * 2).toFixed(2) },
          { value: 'Draw', odd: (2.5 + Math.random() * 1.5).toFixed(2) },
          { value: 'Away', odd: (1.5 + Math.random() * 2).toFixed(2) }
        ]
      },
      {
        id: 5,
        name: 'Goals Over/Under',
        values: [
          { value: 'Over 2.5', odd: (1.4 + Math.random() * 1.2).toFixed(2) },
          { value: 'Under 2.5', odd: (1.4 + Math.random() * 1.2).toFixed(2) }
        ]
      }
    ]
  }));
}
