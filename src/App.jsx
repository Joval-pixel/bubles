import { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const [games, setGames] = useState([]);

  // 🔥 BUSCA API
  useEffect(() => {
    fetch("/api/games")
      .then(res => res.json())
      .then(data => setGames(data))
      .catch(() => console.log("Erro API"));
  }, []);

  // 🔥 AUTO REFRESH
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/games")
        .then(res => res.json())
        .then(data => setGames(data));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // 🎯 DESENHO
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const bubbles = games.map(g => ({
      ...g,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.max(25, g.oddHome * 15),
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      friction: 0.98
    }));

    function getColor(ev) {
      if (ev > 0.2) return "#00ff88";
      if (ev > 0.05) return "#00cc66";
      if (ev > 0) return "#ffd700";
      if (ev > -0.1) return "#ff9933";
      return "#ff3b3b";
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 🚫 colisão
      for (let i = 0; i < bubbles.length; i++) {
        for (let j = i + 1; j < bubbles.length; j++) {
          const dx = bubbles[j].x - bubbles[i].x;
          const dy = bubbles[j].y - bubbles[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = bubbles[i].r + bubbles[j].r;

          if (dist < minDist) {
            const angle = Math.atan2(dy, dx);
            const move = (minDist - dist) / 2;

            bubbles[i].x -= Math.cos(angle) * move;
            bubbles[i].y -= Math.sin(angle) * move;
            bubbles[j].x += Math.cos(angle) * move;
            bubbles[j].y += Math.sin(angle) * move;
          }
        }
      }

      bubbles.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;

        b.vx *= b.friction;
        b.vy *= b.friction;

        if (b.x < 0 || b.x > canvas.width) b.vx *= -1;
        if (b.y < 0 || b.y > canvas.height) b.vy *= -1;

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);

        ctx.fillStyle = getColor(b.ev);

        ctx.shadowBlur = 30;
        ctx.shadowColor = getColor(b.ev);

        ctx.fill();

        ctx.shadowBlur = 0;

        // TEXTO
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";

        ctx.font = "bold 13px Arial";
        ctx.fillText(b.game.slice(0, 18), b.x, b.y - 10);

        ctx.font = "12px Arial";
        ctx.fillText(`Odd ${b.oddHome}`, b.x, b.y + 5);
        ctx.fillText(`EV ${b.ev}`, b.x, b.y + 20);
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
