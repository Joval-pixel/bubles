import { useEffect, useRef } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const bubbles = useRef([]);

  const scale = useRef(1);
  const offset = useRef({ x: 0, y: 0 });

  // 🧠 SCORE
  function calculateScore(g) {
    let score = 0;

    score += (g.dangerous || 0) * 0.7;
    score += (g.shots || 0) * 1.3;
    score += (g.corners || 0) * 2.2;

    if (g.minute > 60) score += 20;
    if (g.minute > 75) score += 25;

    if (g.odds > 2) score += 15;

    return Math.round(score);
  }

  function getColor(score) {
    if (score > 110) return "#00ffcc";
    if (score > 80) return "#00ff88";
    if (score > 60) return "#ffaa00";
    return "#ff3b3b";
  }

  async function fetchGames() {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();

      const canvas = canvasRef.current;

      bubbles.current = data
        .map((g) => {
          const score = calculateScore(g);

          return {
            ...g,
            score,

            // 🔥 POSICIONAMENTO ESTILO CRYPTOBUBBLES
            x: canvas.width / 2 + (Math.random() - 0.5) * 1200,
            y: canvas.height / 2 + (Math.random() - 0.5) * 1200,

            // tamanho proporcional
            radius: Math.max(20, score * 1.2),

            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2,
          };
        })
        .filter((b) => b.score > 40); // 🔥 remove lixo

    } catch (err) {
      console.log("fallback");

      const canvas = canvasRef.current;

      bubbles.current = Array.from({ length: 20 }).map((_, i) => ({
        game: `Jogo ${i + 1}`,
        minute: Math.floor(Math.random() * 90),
        corners: Math.random() * 10,
        shots: Math.random() * 15,
        dangerous: Math.random() * 30,
        odds: 1.5 + Math.random() * 2,

        score: Math.random() * 120,

        x: canvas.width / 2 + (Math.random() - 0.5) * 1200,
        y: canvas.height / 2 + (Math.random() - 0.5) * 1200,

        radius: 40 + Math.random() * 60,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
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

    function draw() {
      ctx.setTransform(
        scale.current,
        0,
        0,
        scale.current,
        offset.current.x,
        offset.current.y
      );

      ctx.clearRect(
        -offset.current.x,
        -offset.current.y,
        canvas.width,
        canvas.height
      );

      // colisão leve
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

      bubbles.current.forEach((b) => {
        b.x += b.dx;
        b.y += b.dy;

        b.dx *= 0.995;
        b.dy *= 0.995;

        // glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = getColor(b.score);

        const gradient = ctx.createRadialGradient(
          b.x,
          b.y,
          b.radius * 0.2,
          b.x,
          b.y,
          b.radius
        );

        gradient.addColorStop(0, "#ffffff22");
        gradient.addColorStop(1, getColor(b.score));

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.font = `${Math.max(10, b.radius / 3)}px Arial`;

        ctx.fillText(b.game.slice(0, 14), b.x, b.y - 5);
        ctx.fillText(`${b.score}`, b.x, b.y + 12);
      });

      requestAnimationFrame(draw);
    }

    draw();

    // zoom
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      scale.current += e.deltaY * -0.001;
      scale.current = Math.min(Math.max(0.4, scale.current), 3);
    });

    // drag
    let dragging = false;
    let last = { x: 0, y: 0 };

    canvas.addEventListener("mousedown", (e) => {
      dragging = true;
      last = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener("mousemove", (e) => {
      if (!dragging) return;

      offset.current.x += e.clientX - last.x;
      offset.current.y += e.clientY - last.y;

      last = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener("mouseup", () => {
      dragging = false;
    });

  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ background: "#111", display: "block" }}
    />
  );
}
