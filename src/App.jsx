import { useEffect, useRef } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const bubbles = useRef([]);

  const scale = useRef(1);
  const offset = useRef({ x: 0, y: 0 });

  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  function calculateScore(g) {
    let score = 0;
    score += (g.dangerous || 0) * 0.6;
    score += (g.shots || 0) * 1.2;
    score += (g.corners || 0) * 2;

    if (g.minute > 60) score += 15;
    if (g.minute > 75) score += 10;
    if (g.odds > 2) score += 20;

    return Math.round(score);
  }

  function getColor(score) {
    if (score > 80) return "#00ff88";
    if (score > 50) return "#ffaa00";
    return "#ff4444";
  }

  async function fetchGames() {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();

      const canvas = canvasRef.current;

      bubbles.current = data.map((item) => {
        const score = calculateScore(item);

        return {
          ...item,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 15 + score * 0.9,
          dx: (Math.random() - 0.5) * 3,
          dy: (Math.random() - 0.5) * 3,
          score,
        };
      });

    } catch {
      const canvas = canvasRef.current;

      const fallback = Array.from({ length: 60 }).map((_, i) => ({
        game: `Jogo ${i}`,
        minute: Math.random() * 90,
        corners: Math.random() * 10,
        shots: Math.random() * 15,
        dangerous: Math.random() * 25,
        odds: 1.5 + Math.random() * 2,
      }));

      bubbles.current = fallback.map((item) => ({
        ...item,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 15 + calculateScore(item) * 0.9,
        dx: (Math.random() - 0.5) * 3,
        dy: (Math.random() - 0.5) * 3,
        score: calculateScore(item),
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

      // colisão suave
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
          b.x, b.y, b.radius * 0.2,
          b.x, b.y, b.radius
        );

        gradient.addColorStop(0, "#ffffff22");
        gradient.addColorStop(1, getColor(b.score));

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.shadowBlur = 0;

        // texto proporcional
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.font = `${Math.max(10, b.radius / 3)}px Arial`;

        ctx.fillText(b.game.slice(0, 10), b.x, b.y - 5);
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
    canvas.addEventListener("mousedown", (e) => {
      dragging.current = true;
      last.current = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener("mousemove", (e) => {
      if (!dragging.current) return;

      offset.current.x += e.clientX - last.current.x;
      offset.current.y += e.clientY - last.current.y;

      last.current = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener("mouseup", () => {
      dragging.current = false;
    });

  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ background: "#111", display: "block" }}
    />
  );
}
