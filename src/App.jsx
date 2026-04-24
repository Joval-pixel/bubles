import { useEffect, useRef } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const bubbles = useRef([]);

  // 🔥 BUSCAR DADOS
  async function fetchGames() {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();

      bubbles.current = data.map((item) => ({
        ...item,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: item.odds * 25,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        score: calculateScore(item),
      }));
    } catch (e) {
      console.log("Erro API");
    }
  }

  // 🧠 SCORE INTELIGENTE
  function calculateScore(game) {
    let score = 0;

    if (game.corners > 6) score += 30;
    if (game.minute > 60) score += 20;
    if (game.odds > 2) score += 20;

    return score;
  }

  // 🎨 COR BASEADA NO SCORE
  function getColor(score) {
    if (score > 60) return "#00ff88";
    if (score > 40) return "#ffaa00";
    return "#ff4444";
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    fetchGames();
    setInterval(fetchGames, 10000);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 🔥 COLISÃO ENTRE BOLHAS
      for (let i = 0; i < bubbles.current.length; i++) {
        for (let j = i + 1; j < bubbles.current.length; j++) {
          const b1 = bubbles.current[i];
          const b2 = bubbles.current[j];

          const dx = b2.x - b1.x;
          const dy = b2.y - b1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const minDist = b1.radius + b2.radius;

          if (dist < minDist) {
            const angle = Math.atan2(dy, dx);
            const force = (minDist - dist) * 0.02;

            b1.dx -= Math.cos(angle) * force;
            b1.dy -= Math.sin(angle) * force;

            b2.dx += Math.cos(angle) * force;
            b2.dy += Math.sin(angle) * force;
          }
        }
      }

      // 🔄 MOVIMENTO + DESENHO
      bubbles.current.forEach((b) => {
        b.x += b.dx;
        b.y += b.dy;

        // parede
        if (b.x + b.radius > canvas.width || b.x - b.radius < 0)
          b.dx *= -1;
        if (b.y + b.radius > canvas.height || b.y - b.radius < 0)
          b.dy *= -1;

        // bolha
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = getColor(b.score);
        ctx.fill();

        // texto
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.font = "12px Arial";

        ctx.fillText(b.game, b.x, b.y);
        ctx.fillText(`Odd: ${b.odds.toFixed(2)}`, b.x, b.y + 14);
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
