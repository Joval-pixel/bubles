import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const bubbles = useRef([]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/games');
      const data = await res.json();

      if (data.error) {
        setError(data.error + ": " + (data.message || "Verifique sua chave"));
        return;
      }

      if (Array.isArray(data) && data.length > 0) {
        setError(null);
        const processed = data.map(event => {
          const price = event.bookmakers?.[0]?.markets?.[0]?.outcomes?.[0]?.price || 2.0;
          const evValue = ((0.55 * price) - 1) * 100;
          return {
            id: event.id,
            home: event.home_team.substring(0, 3).toUpperCase(),
            full: `${event.home_team} vs ${event.away_team}`,
            ev: parseFloat(evValue.toFixed(1))
          };
        });
        setGames(processed);
        updatePhysics(processed);
      } else {
        setError("API retornou lista vazia. Não há jogos live no momento.");
      }
    } catch (e) {
      setError("Erro ao conectar com a função /api/games");
    }
  };

  const updatePhysics = (newGames) => {
    // Remove bolhas que não estão mais nos dados
    const newIds = newGames.map(g => g.id);
    bubbles.current = bubbles.current.filter(b => newIds.includes(b.id));

    newGames.forEach(g => {
      if (!bubbles.current.find(b => b.id === g.id)) {
        bubbles.current.push({
          ...g,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          radius: 50 + Math.min(Math.abs(g.ev) * 2, 60) 
        });
      }
    });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frame;

    const animate = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      bubbles.current.forEach(b => {
        b.x += b.vx; b.y += b.vy;
        if (b.x + b.radius > canvas.width || b.x - b.radius < 0) b.vx *= -1;
        if (b.y + b.radius > canvas.height || b.y - b.radius < 0) b.vy *= -1;

        const isPositive = b.ev >= 0;
        const color = isPositive ? '#00ff88' : '#ff3333';
        const darkColor = isPositive ? '#004422' : '#441111';

        // Estilo Crypto Bubbles (Gradiente + Glow)
        ctx.save();
        ctx.shadowBlur = 25;
        ctx.shadowColor = color + '44';
        
        const grad = ctx.createRadialGradient(b.x, b.y - b.radius/3, 0, b.x, b.y, b.radius);
        grad.addColorStop(0, color);
        grad.addColorStop(1, darkColor);
        
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.stroke();
        ctx.restore();

        // Textos
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.font = `bold ${b.radius * 0.4}px Inter, sans-serif`;
        ctx.fillText(b.home, b.x, b.y + b.radius * 0.1);
        ctx.font = `${b.radius * 0.25}px monospace`;
        ctx.fillText(`${b.ev}%`, b.x, b.y + b.radius * 0.4);
      });
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [games]);

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] text-white">
      {/* Mensagem de Erro se a API falhar */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-600/20 border border-red-500 p-4 rounded-lg text-red-500 text-sm backdrop-blur-md">
          ⚠️ {error}
        </div>
      )}

      {/* Header Estilo Crypto */}
      <div className="absolute top-0 w-full h-16 bg-black/50 backdrop-blur-xl border-b border-white/5 flex items-center px-8 justify-between z-40">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
          <h1 className="font-black italic tracking-tighter text-xl">BET BUBBLES <span className="text-gray-600 text-xs not-italic font-normal">v2.0</span></h1>
        </div>
        <div className="text-[10px] text-gray-500 font-mono">
          REFRESH: 30S | API: THE-ODDS-API
        </div>
      </div>

      <canvas ref={canvasRef} className="cursor-move" />

      {/* Painel de Top Jogos lateral */}
      <div className="absolute right-6 top-24 bottom-6 w-64 bg-black/40 backdrop-blur-md rounded-3xl border border-white/5 p-6 overflow-y-auto z-40">
        <p className="text-[10px] font-bold text-gray-500 mb-4 tracking-widest">TOP LIVE EV%</p>
        {games.slice(0, 8).map((g, i) => (
          <div key={i} className="mb-3 p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[10px] text-gray-400 truncate">{g.full}</p>
            <p className={`text-sm font-bold ${g.ev > 0 ? 'text-green-400' : 'text-red-400'}`}>{g.ev}%</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
