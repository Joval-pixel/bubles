import { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const [games, setGames] = useState([]);

  async function load() {
    const res = await fetch("/api/games");
    const data = await res.json();
    setGames(data);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let bubbles = games.map(g => ({
      ...g,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      r: 20 + g.ev * 200
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubbles.forEach(b => {
        // movimento
        b.x += b.vx;
        b.y += b.vy;

        // borda
        if (b.x < b.r || b.x > canvas.width - b.r) b.vx *= -1;
        if (b.y < b.r || b.y > canvas.height - b.r) b.vy *= -1;

        // cor
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.ev > 0 ? "#00ff88" : "#ff3b3b";
        ctx.shadowBlur = 25;
        ctx.shadowColor = ctx.fillStyle;
        ctx.fill();

        // texto
        ctx.fillStyle = "#000";
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(b.game.slice(0, 20), b.x, b.y - 5);
        ctx.fillText(`Odd ${b.odd}`, b.x, b.y + 8);
        ctx.fillText(`EV ${b.ev}`, b.x, b.y + 18);
      });

      requestAnimationFrame(draw);
    }

    draw();
  }, [games]);

  return (
    <div style={{ background: "#000", height: "100vh" }}>
      <h1 style={{ color: "#fff", padding: 20 }}>
        🎯 BET BUBBLES PRO
      </h1>

      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
