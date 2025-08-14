import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [stocks, setStocks] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  // Algoritmo de distribuição melhorado para evitar agrupamento
  const generateOptimalPositions = (stocksData) => {
    const positions = []
    const minDistance = 80 // Distância mínima entre bolhas em pixels
    const maxAttempts = 100 // Máximo de tentativas para encontrar posição válida
    
    return stocksData.slice(0, 200).map((stock, index) => {
      let x, y, attempts = 0
      let validPosition = false
      
      // Usar diferentes estratégias de distribuição baseado no índice
      if (index < 50) {
        // Primeiras 50 ações: distribuição em grade com variação
        const cols = 10
        const rows = 5
        const gridX = (index % cols) * (80 / cols) + 10
        const gridY = Math.floor(index / cols) * (60 / rows) + 15
        x = gridX + (Math.random() - 0.5) * 8
        y = gridY + (Math.random() - 0.5) * 8
      } else if (index < 120) {
        // Próximas 70 ações: distribuição em círculos concêntricos
        const circleIndex = index - 50
        const circle = Math.floor(circleIndex / 20) + 1
        const angleStep = (2 * Math.PI) / Math.min(20, 70 - (circle - 1) * 20)
        const angle = (circleIndex % 20) * angleStep
        const radius = 15 + circle * 12
        x = 50 + Math.cos(angle) * radius + (Math.random() - 0.5) * 5
        y = 50 + Math.sin(angle) * radius + (Math.random() - 0.5) * 5
      } else {
        // Últimas 80 ações: distribuição aleatória com verificação de colisão
        do {
          x = Math.random() * 80 + 10
          y = Math.random() * 70 + 15
          
          validPosition = true
          for (const pos of positions) {
            const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2))
            if (distance < minDistance / 10) { // Converter para porcentagem
              validPosition = false
              break
            }
          }
          attempts++
        } while (!validPosition && attempts < maxAttempts)
      }
      
      // Garantir que as posições estejam dentro dos limites
      x = Math.max(5, Math.min(95, x))
      y = Math.max(5, Math.min(90, y))
      
      const position = {
        ...stock,
        id: index,
        x: x,
        y: y,
        size: Math.max(30, Math.min(80, (stock.volume / 1000000) * 2 + 25)), // Tamanhos menores para menos sobreposição
        color: stock.change_percent >= 0 ? '#10b981' : '#ef4444',
        animationDelay: Math.random() * 3,
        animationDuration: 3 + Math.random() * 2
      }
      
      positions.push(position)
      return position
    })
  }

  useEffect(() => {
    // Carregar dados das ações
    const loadStocks = async () => {
      try {
        const response = await fetch('/src/assets/top_stocks.json')
        const stocksData = await response.json()
        
        console.log('Dados carregados:', stocksData.length)
        
        // Usar o algoritmo melhorado de distribuição
        const processedStocks = generateOptimalPositions(stocksData)
        
        console.log('Ações processadas:', processedStocks.length)
        setStocks(processedStocks)
        setLoading(false)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        // Dados de fallback para demonstração
        const fallbackData = [
          { symbol: 'VALE3', name: 'Vale', price: 54.09, change_percent: -3.26, volume: 19720000 },
          { symbol: 'PETR4', name: 'Petrobras', price: 30.57, change_percent: -0.75, volume: 38340700 },
          { symbol: 'ITUB4', name: 'Itaú', price: 37.67, change_percent: -0.95, volume: 21959700 },
          { symbol: 'BBAS3', name: 'Banco do Brasil', price: 19.28, change_percent: 0.21, volume: 33738000 },
          { symbol: 'ABEV3', name: 'Ambev', price: 12.12, change_percent: -0.90, volume: 42653700 }
        ]
        
        const processedFallback = generateOptimalPositions(fallbackData)
        setStocks(processedFallback)
        setLoading(false)
      }
    }

    loadStocks()
  }, [])

  // Filtrar ações baseado no termo de busca
  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Função para formatar valores monetários
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Função para formatar volume
  const formatVolume = (volume) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`
    }
    return volume.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-xl">Carregando dados das ações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="p-6 border-b border-slate-700">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Bubles - Ações B3
          </h1>
          <p className="text-center text-slate-300 mb-6">
            Visualização interativa das {stocks.length} ações mais negociadas na B3
          </p>
          
          {/* Barra de busca */}
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Buscar por símbolo ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </header>

      {/* Visualização de bolhas */}
      <main className="relative overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="relative w-full h-full">
          {filteredStocks.map((stock) => (
            <div
              key={stock.id}
              className="absolute rounded-full cursor-pointer group flex items-center justify-center transition-all duration-300 hover:scale-110 hover:z-10 hover:shadow-2xl"
              style={{
                left: `${stock.x}%`,
                top: `${stock.y}%`,
                width: `${stock.size}px`,
                height: `${stock.size}px`,
                backgroundColor: stock.color,
                transform: 'translate(-50%, -50%)',
                opacity: 0.9,
                animation: `float-${stock.id % 6} ${stock.animationDuration}s ease-in-out infinite`,
                animationDelay: `${stock.animationDelay}s`,
                boxShadow: `0 0 ${stock.size / 6}px ${stock.color}60`
              }}
            >
              {/* Conteúdo da bolha */}
              <div className="text-center text-white font-semibold">
                <div className="text-xs leading-tight">{stock.symbol}</div>
                {stock.size > 50 && (
                  <div className="text-xs opacity-80 mt-1">
                    {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(1)}%
                  </div>
                )}
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 min-w-max">
                <div className="text-sm font-semibold text-white">{stock.symbol}</div>
                <div className="text-xs text-slate-300 mb-1">{stock.name}</div>
                <div className="text-xs">
                  <div className="flex justify-between gap-4">
                    <span>Preço:</span>
                    <span className="font-semibold">{formatCurrency(stock.price)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Variação:</span>
                    <span className={`font-semibold ${stock.change_percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Volume:</span>
                    <span className="font-semibold">{formatVolume(stock.volume)}</span>
                  </div>
                </div>
                {/* Seta do tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer com informações */}
      <footer className="p-4 border-t border-slate-700 text-center text-slate-400 text-sm">
        <p>
          Exibindo {filteredStocks.length} de {stocks.length} ações • 
          <span className="text-green-400 ml-2">Verde: Alta</span> • 
          <span className="text-red-400 ml-2">Vermelho: Baixa</span> • 
          Tamanho baseado no volume de negociação
        </p>
      </footer>

      {/* CSS para animações melhoradas */}
      <style jsx>{`
        @keyframes float-0 {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px) rotate(0deg); }
          33% { transform: translate(-50%, -50%) translateY(-8px) rotate(0.5deg); }
          66% { transform: translate(-50%, -50%) translateY(4px) rotate(-0.5deg); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(-50%, -50%) translateX(0px) scale(1); }
          50% { transform: translate(-50%, -50%) translateX(6px) scale(1.01); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(-50%, -50%) translate(0px, 0px); }
          25% { transform: translate(-50%, -50%) translate(4px, -4px); }
          75% { transform: translate(-50%, -50%) translate(-4px, 4px); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px) translateX(0px); }
          40% { transform: translate(-50%, -50%) translateY(-6px) translateX(3px); }
          80% { transform: translate(-50%, -50%) translateY(3px) translateX(-3px); }
        }
        @keyframes float-4 {
          0%, 100% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
          50% { transform: translate(-50%, -50%) rotate(1deg) scale(1.02); }
        }
        @keyframes float-5 {
          0%, 100% { transform: translate(-50%, -50%) translate(0px, 0px) rotate(0deg); }
          20% { transform: translate(-50%, -50%) translate(3px, -3px) rotate(0.3deg); }
          40% { transform: translate(-50%, -50%) translate(-2px, -2px) rotate(-0.3deg); }
          60% { transform: translate(-50%, -50%) translate(2px, 3px) rotate(0.2deg); }
          80% { transform: translate(-50%, -50%) translate(-3px, 1px) rotate(-0.2deg); }
        }
      `}</style>
    </div>
  )
}

export default App
