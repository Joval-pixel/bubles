import { useEffect, useRef } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const bubbles = useRef([]);

  const scale = useRef(1);
  const offset = useRef({ x: 0, y: 0 });

  function calculateScore(g) {
    let score = 0;

    score += (g.dangerous || 0) * 0.8;
    score += (g.shots || 0) * 1.2;
    score += (g.corners || 0) * 2.5;

    if (g.minute > 60) score += 20;
    if (g.minute > 75) score += 30;

    return Math.max(10, Math.round(score));
  }

  function getColor(score) {
    if (score > 110) return "#00ffcc";
    if (score > 80) return "#00ff88";
    if (score > 60) return "#ffaa00";
    return "#ff3b3b";
  }

  // 🔥 DISTRIBUIÇÃO ORGANIZADA
  function distribute(data, canvas) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const maxRadius = Math.min(canvas.width, canvas.height) * 0.45;

    return data.map((b, i) => {
      const angle = (i / data.length) * Math.PI * 2;
      const radius = Math.sqrt(i / data.length) * maxRadius;

      return {
        ...b,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        dx: 0,
        dy: 0,
      };
    });
  }

  async function fetchGames() {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();

      const canvas = canvasRef.current;

      const processed = data
        .map((g) => {
          const score = calculateScore(g);

          return {
            ...g,
            score,
            radius: Math.min(120, Math.max(30, score * 1.2)),
          };
        })
        .filter((g) => g.score > 30);

      bubbles.current = distribute(processed, canvas);

    } catch {
      console.log("fallback visual");

      const canvas = canvasRef.current;

      const fallback = Array.from({ length: 20 }).map((_, i) => ({
        game: `Time ${i} x Time ${i + 1}`,
        minute: Math.random() * 90,
        corners: Math.random() * 10,
        shots: Math.random() * 15,
        dangerous: Math.random() * 30,
      }));

      const processed = fallback.map((g) => {
        const score = calculateScore(g);
        return {
          ...g,
          score,
          radius: 40 + Math.random() * 40,
        };
      });

      bubbles.current = distribute(processed, canvas);
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

      bubbles.current.forEach((b) => {
        const gradient = ctx.createRadialGradient(
          b.x,
          b.y,
          b.radius * 0.2,
          b.x,
          b.y,
          b.radius
        );

        gradient.addColorStop(0, "#ffffff33");
        gradient.addColorStop(1, getColor(b.score));

        ctx.shadowBlur = 25;
        ctx.shadowColor = getColor(b.score);

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.fillStyle = "#000";
        ctx.textAlign = "center";

        const name =
          b.game.length > 18
            ? b.game.slice(0, 18) + "..."
            : b.game;

        ctx.font = `${Math.max(12, b.radius / 4)}px Arial`;
        ctx.fillText(name, b.x, b.y - 5);

        ctx.font = `${Math.max(12, b.radius / 5)}px Arial`;
        ctx.fillText(`${b.score}`, b.x, b.y + 15);
      });

      requestAnimationFrame(draw);
    }

    draw();

    // zoom
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      scale.current += e.deltaY * -0.001;
      scale.current = Math.min(Math.max(0.5, scale.current), 3);
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
