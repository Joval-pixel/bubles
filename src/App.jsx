import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);
  const bubbles = useRef([]);

  const processGames = (data) => {
    return data.map(event => {
      const price = event.bookmakers?.[0]?.markets?.[0]?.outcomes?.[0]?.price || 2.10;
      const evValue = parseFloat(((0.6 * price) - 1).toFixed(2));
      
      return {
        id: event.id,
        name: `${event.home_team} vs ${event.away_team}`,
        home: event.home_team,
        away: event.away_team,
        ev: evValue > 0 ? evValue : 0.05, // Força um EV mínimo para teste visual
        price: price
      };
    });
  };

  const fetchData = async () => {
    try {
      const res = await fetch('/api/games');
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const processed = processGames(data).sort((a, b) => b.ev - a.ev);
        setGames(processed);
        syncBubbles(processed);
      }
    } catch (e) { console.error("Erro na busca"); }
    finally { setLoading(false); }
  };

  const syncBubbles = (newGames) => {
    const existingIds = bubbles.current.map(b => b.id);
    newGames.forEach(g => {
      if (!existingIds.includes(g.id)) {
        bubbles.current.push({
          ...g,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          radius: 60 + (g.ev * 40)
        });
      }
    });
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frame;

    const draw = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubbles.current.forEach(b => {
        b.x += b.vx; b.y += b.vy;
        if (b.x + b.radius > canvas.width || b.x - b.radius < 0) b.vx *= -1;
        if (b.y + b.radius > canvas.height || b.y - b.radius < 0) b.vy *= -1;

        const color = b.ev > 0.4 ? '#00ff88' : '#ffcc00';
        
        // Brilho da bolha
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(20, 20, 20, 0.8)';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Texto interno
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.home, b.x, b.y - 10);
        ctx.fillText("x", b.x, b.y + 2);
        ctx.fillText(b.away, b.x, b.y + 15);
        ctx.fillStyle = color;
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`EV +${b.ev}`, b.x, b.y + 35);
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [games]);

  return (
    <div className="fixed inset-0 bg-[#050505] font-sans text-white overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      {/* Sidebar Ultra Moderna */}
      <div className="relative z-10 w-96 h-full bg-black/40 backdrop-blur-2xl border-r border-white/5 p-8 flex flex-col shadow-2xl">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
          <h1 className="text-2xl font-black tracking-tighter italic">LIVE SCANNER</h1>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scroll">
          {loading ? (
            <div className="text-gray-500 animate-pulse">Iniciando motores...</div>
          ) : games.length === 0 ? (
            <div className="p-6 border border-dashed border-white/10 rounded-2xl text-gray-500 text-center">
              Sem jogos detectados agora
            </div>
          ) : (
            games.map((g, i) => (
              <div key={i} className="mb-4 p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">ODDS ACTIVE</span>
                  <span className="text-xs font-mono text-gray-500">#{i+1}</span>
                </div>
                <h3 className="font-bold text-sm leading-tight group-hover:text-green-400 transition-colors">{g.name}</h3>
                <div className="mt-4 flex justify-between items-end">
                  <div className="text-[10px] text-gray-500">POTENTIAL EV</div>
                  <div className="text-xl font-black text-green-500">+{g.ev}</div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-auto pt-6 border-t border-white/5 text-[10px] text-gray-600 flex justify-between">
          <span>API: THE-ODDS-API</span>
          <span>STATUS: ONLINE</span>
        </div>
      </div>
    </div>
  );
};

export default App;
