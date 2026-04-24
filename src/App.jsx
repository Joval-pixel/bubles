import { useEffect, useRef } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const bubbles = useRef([]);

  function score(g) {
    let s = 0;
    s += (g.dangerous || 0) * 1;
    s += (g.shots || 0) * 1.5;
    s += (g.corners || 0) * 2.5;
    s += g.minute > 60 ? 20 : 0;
    s += g.minute > 75 ? 30 : 0;
    return Math.max(10, Math.round(s));
  }

  function color(s) {
    if (s > 110) return "#00ffcc";
    if (s > 80) return "#00ff88";
    if (s > 60) return "#ffaa00";
    return "#ff3b3b";
  }

  async function fetchGames() {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();

      const canvas = canvasRef.current;

      bubbles.current = data.map((g) => {
        const sc = score(g);

        return {
          ...g,
          score: sc,
          radius: Math.min(100, Math.max(30, sc)),
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
        };
      });

    } catch {
      const canvas = canvasRef.current;

      bubbles.current = Array.from({ length: 20 }).map((_, i) => ({
        game: `Fallback ${i}`,
        score: Math.random() * 100,
        radius: 40 + Math.random() * 40,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
      }));
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    fetchGames();
    setInterval(fetchGames, 10000);

    function physics() {
      const b = bubbles.current;

      for (let i = 0; i < b.length; i++) {
        for (let j = i + 1; j < b.length; j++) {
          const dx = b[j].x - b[i].x;
          const dy = b[j].y - b[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = b[i].radius + b[j].radius;

          if (dist < minDist) {
            const angle = Math.atan2(dy, dx);
            const overlap = (minDist - dist) / 2;

            b[i].x -= Math.cos(angle) * overlap;
            b[i].y -= Math.sin(angle) * overlap;

            b[j].x += Math.cos(angle) * overlap;
            b[j].y += Math.sin(angle) * overlap;
          }
        }
      }

      b.forEach((ball) => {
        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.x < ball.radius || ball.x > canvas.width - ball.radius)
          ball.vx *= -1;

        if (ball.y < ball.radius || ball.y > canvas.height - ball.radius)
          ball.vy *= -1;
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      physics();

      bubbles.current.forEach((b) => {
        const grad = ctx.createRadialGradient(
          b.x,
          b.y,
          b.radius * 0.2,
          b.x,
          b.y,
          b.radius
        );

        grad.addColorStop(0, "#ffffff22");
        grad.addColorStop(1, color(b.score));

        ctx.shadowBlur = 20;
        ctx.shadowColor = color(b.score);

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.fillStyle = "#000";
        ctx.textAlign = "center";

        const name =
          b.game && b.game.length > 18
            ? b.game.slice(0, 18) + "..."
            : b.game || "Sem nome";

        ctx.font = `${Math.max(12, b.radius / 4)}px Arial`;
        ctx.fillText(name, b.x, b.y - 5);

        ctx.font = `${Math.max(12, b.radius / 5)}px Arial`;
        ctx.fillText(b.score, b.x, b.y + 15);
      });

      requestAnimationFrame(draw);
    }

    draw();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ background: "#111", display: "block" }}
    />
  );
}
