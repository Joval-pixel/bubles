import { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const [games, setGames] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/games");
        const data = await res.json();
        setGames(Array.isArray(data) ? data : []);
      } catch {
        setGames([]);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    let bubbles = [];

    function createBubbles(data) {
      bubbles = data.map((g) => {
        const size = Math.max(30, Math.min(120, g.oddHome * 25));

        return {
          ...g,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          r: size,
        };
      });
    }

    createBubbles(games);

    function getColor(ev) {
      if (ev > 0.05) return "#00ff88";
      if (ev > 0) return "#ffd700";
      return "#ff3b3b";
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubbles.forEach((b) => {
        // movimento
        b.x += b.vx;
        b.y += b.vy;

        if (b.x < b.r || b.x > canvas.width - b.r) b.vx *= -1;
        if (b.y < b.r || b.y > canvas.height - b.r) b.vy *= -1;

        // bolha
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = getColor(b.ev);
        ctx.shadowBlur = 20;
        ctx.shadowColor = getColor(b.ev);
        ctx.fill();

        // texto
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";

        const name = b.game.length > 20 ? b.game.slice(0, 20) + "..." : b.game;

        ctx.fillText(name, b.x, b.y - 5);
        ctx.fillText(`Odd ${b.oddHome}`, b.x, b.y + 10);
        ctx.fillText(`EV ${b.ev}`, b.x, b.y + 25);
      });

      requestAnimationFrame(draw);
    }

    draw();

    return () => window.removeEventListener("resize", resize);
  }, [games]);

  return (
    <div style={{ background: "black", height: "100vh" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
