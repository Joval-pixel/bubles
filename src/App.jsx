import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [games, setGames] = useState([]);
  const canvasRef = useRef(null);
  const bubbles = useRef([]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/games');
      const data = await res.json();
      if (Array.isArray(data)) {
        const processed = data.map(event => {
          const price = event.bookmakers?.[0]?.markets?.[0]?.outcomes?.[0]?.price || 2.0;
          const evValue = ((0.6 * price) - 1) * 100; // Transformado em % para o estilo do print
          return {
            id: event.id,
            home: event.home_team.substring(0, 4).toUpperCase(), // Abreviação tipo Crypto
            name: `${event.home_team} vs ${event.away_team}`,
            ev: parseFloat(evValue.toFixed(1))
          };
        });
        setGames(processed);
        updatePhysics(processed);
      }
    } catch (e) { console.error("Erro na API"); }
  };

  const updatePhysics = (newGames) => {
    const currentIds = bubbles.current.map(b => b.id);
    newGames.forEach(g => {
      if (!currentIds.includes(g.id)) {
        bubbles.current.push({
          ...g,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 1,
          vy: (Math.random() - 0.5) * 1,
          radius: 50 + (Math.abs(g.ev) * 0.8) // Tamanho baseado no valor
        });
      }
    });
  };

  useEffect(() => {
    fetchData();
    setInterval(fetchData, 60000);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frame;

    const animate = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Fundo levemente texturizado como no print
      ctx.fillStyle = '#121212';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      bubbles.current.forEach(b => {
        // Física de colisão com as bordas
        b.x += b.vx; b.y += b.vy;
        if (b.x + b.radius > canvas.width || b.x - b.radius < 0) b.vx *= -1;
        if (b.y + b.radius > canvas.height || b.y - b.radius < 0) b.vy *= -1;

        const isPositive = b.ev >= 0;
        const mainColor = isPositive ? '#00d26a' : '#f8312f';
        const gradColor = isPositive ? '#004d28' : '#4d0b0a';

        // 1. Sombra/Brilho externo (Glow)
        ctx.shadowBlur = 20;
        ctx.shadowColor = mainColor + '66';

        // 2. Círculo principal com Gradiente Radial (Igual ao Crypto Bubbles)
        const gradient = ctx.createRadialGradient(b.x, b.y - b.radius/3, 0, b.x, b.y, b.radius);
        gradient.addColorStop(0, mainColor);
        gradient.addColorStop(1, gradColor);
        
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 3. Borda fina brilhante
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 4. Textos (Nome do Time e Porcentagem EV)
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        
        // Nome abreviado (Estilo "BTC", "ETH")
        ctx.font = `bold ${b.radius * 0.35}px Arial`;
        ctx.fillText(b.home, b.x, b.y);

        // Valor do EV (Estilo "+15,7%")
        ctx.font = `${b.radius * 0.22}px Arial`;
        ctx.fillText(`${isPositive ? '+' : ''}${b.ev}%`, b.x, b.y + (b.radius * 0.3));
      });
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [games]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#121212]">
      {/* Header estilo Crypto Bubbles */}
      <div className="absolute top-0 w-full z-20 bg-[#1a1a1a]/90 backdrop-blur-md p-3 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center font-black text-black text-xs">⚽</div>
          <span className="font-bold text-white tracking-tighter">BET BUBBLES</span>
        </div>
        <div className="flex gap-4 text-[10px] font-bold text-gray-400">
          <span className="text-green-500">LIVE MARKET</span>
          <span>VALOR: EV %</span>
        </div>
      </div>

      <canvas ref={canvasRef} className="block" />
      
      {/* Legenda Flutuante */}
      <div className="absolute bottom-6 right-6 z-20 bg-black/60 p-4 rounded-xl border border-white/10 backdrop-blur-md">
         <p className="text-[10px] text-gray-400 uppercase font-black">Top Opportunity</p>
         <p className="text-sm font-bold text-green-400">{games[0]?.name || "Scanning..."}</p>
      </div>
    </div>
  );
};

export default App;
