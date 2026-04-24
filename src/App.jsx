import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);
  const bubbles = useRef([]);

  const calculateEV = (event) => {
    try {
      // Pega o primeiro bookmaker e o mercado h2h (vitoria/empate/derrota)
      const bookmaker = event.bookmakers?.[0];
      const market = bookmaker?.markets?.find(m => m.key === 'h2h');
      const homeOutcome = market?.outcomes?.find(o => o.name === event.home_team);
      
      const oddHome = homeOutcome?.price || 0;
      
      // Lógica de pressão adaptada: Como a Odds API foca em cotações, 
      // simulamos o "Pressure" baseado na tendência da odd ou mantemos 
      // a estrutura para quando você integrar o endpoint de stats.
      const probabilidadeEstimada = 0.60; // Base de cálculo
      const ev = oddHome > 0 ? (probabilidadeEstimada * oddHome) - 1 : -1;

      return { 
        ev: parseFloat(ev.toFixed(2)), 
        name: `${event.home_team} vs ${event.away_team}`,
        id: event.id
      };
    } catch (e) {
      return { ev: -1 };
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetch('/api/games');
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const processed = data
          .map(f => calculateEV(f))
          .filter(g => g.ev > 0)
          .sort((a, b) => b.ev - a.ev);
        
        setGames(processed);
        updateBubbles(processed);
      }
    } catch (e) {
      console.error("Erro ao buscar dados");
    } finally {
      setLoading(false);
    }
  };

  const updateBubbles = (processedGames) => {
    const currentIds = bubbles.current.map(b => b.id);
    processedGames.forEach(game => {
      if (!currentIds.includes(game.id)) {
        bubbles.current.push({
          ...game,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          radius: 40 + (game.ev * 50)
        });
      }
    });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Atualiza a cada 1 min para poupar cota da API
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrame;

    const animate = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubbles.current.forEach(b => {
        b.x += b.vx; b.y += b.vy;
        if (b.x + b.radius > canvas.width || b.x - b.radius < 0) b.vx *= -1;
        if (b.y + b.radius > canvas.height || b.y - b.radius < 0) b.vy *= -1;

        // Cor baseada no EV: Verde (>0.5), Amarelo (>0.2), Vermelho (baixo)
        const color = b.ev > 0.5 ? '#22c55e' : b.ev > 0.2 ? '#eab308' : '#ef4444';
        
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = color + '22';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(b.name.split(' vs ')[0], b.x, b.y - 5);
        ctx.fillStyle = color;
        ctx.fillText(`EV: ${b.ev}`, b.x, b.y + 15);
      });
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [games]);

  return (
    <div className="flex h-screen w-screen bg-black text-white overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      
      <div className="relative z-10 w-80 bg-black/60 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col">
        <h1 className="text-xl font-black italic mb-6 text-green-500 tracking-tighter">ODDS SCANNER</h1>
        
        {loading ? (
          <div className="animate-pulse text-gray-500">Sincronizando mercado...</div>
        ) : games.length === 0 ? (
          <div className="text-gray-500 text-sm">Sem jogos ao vivo com EV positivo no momento.</div>
        ) : (
          <div className="space-y-4 overflow-y-auto">
            {games.slice(0, 5).map((game, i) => (
              <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-green-500/50 transition-colors">
                <p className="text-xs font-bold uppercase text-gray-400">Top {i+1} Oportunidade</p>
                <p className="text-sm font-bold truncate mt-1">{game.name}</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded">LIVE</span>
                  <span className="text-green-400 font-mono font-bold">EV +{game.ev}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && games.length === 0 && (
        <div className="flex-1 flex items-center justify-center opacity-20 pointer-events-none">
           <h2 className="text-4xl font-black">SEM JOGOS AO VIVO</h2>
        </div>
      )}
    </div>
  );
};

export default App;
