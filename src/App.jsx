import { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const [games, setGames] = useState([]);

  // 🔥 FETCH SEGURO
  useEffect(() => {
    fetch("/api/games")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setGames(data);
        } else {
          setGames([]);
        }
      })
      .catch(() => setGames([]));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (!games.length) return; // 🔥 evita tela preta bugada

    const bubbles = games.map(g => ({
      ...g,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.max(25, g.oddHome * 12),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      friction: 0.98
    }));

    function getColor(ev) {
      if (ev > 0.2) return "#00ff88";
      if (ev > 0.05) return "#00cc66";
      if (ev > 0) return "#ffd700";
      return "#ff3b3b";
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubbles.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;

        b.vx *= b.friction;
        b.vy *= b.friction;

        if (b.x < 0 || b.x > canvas.width) b.vx *= -1;
        if (b.y < 0 || b.y > canvas.height) b.vy *= -1;

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);

        const color = getColor(b.ev);

        ctx.fillStyle = color;
        ctx.shadowBlur = 25;
        ctx.shadowColor = color;

        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#000";
        ctx.textAlign = "center";

        ctx.font = "bold 12px Arial";
        ctx.fillText(b.game.slice(0, 16), b.x, b.y - 8);

        ctx.font = "11px Arial";
        ctx.fillText(`Odd ${b.oddHome}`, b.x, b.y + 6);
        ctx.fillText(`EV ${b.ev}`, b.x, b.y + 18);
      });

      requestAnimationFrame(draw);
    }

    draw();
  }, [games]);

  return (
    <canvas
      ref={canvasRef}
      style={{ background: "#000", display: "block" }}
    />
  );
}
