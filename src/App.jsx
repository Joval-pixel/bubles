import { useEffect, useRef } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const bubbles = useRef([]);

  const scale = useRef(1);
  const offset = useRef({ x: 0, y: 0 });

  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  async function fetchGames() {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();

      const canvas = canvasRef.current;

      // NÃO recria tudo — atualiza melhor
      bubbles.current = data.map((item) => ({
        ...item,
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2 + (Math.random() - 0.5) * 200,
        radius: 40 + item.odds * 8,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        score: calculateScore(item),
      }));

    } catch {
      console.log("erro api");
    }
  }

  function calculateScore(g) {
    let s = 0;
    if (g.corners > 6) s += 30;
    if (g.minute > 60) s += 20;
    if (g.odds > 2) s += 20;
    return s;
  }

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
    setInterval(fetchGames, 15000);

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

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // 🔥 força para manter no centro
      bubbles.current.forEach((b) => {
        b.dx += (centerX - b.x) * 0.0005;
        b.dy += (centerY - b.y) * 0.0005;
      });

      // 🔥 colisão real
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
            const force = (minDist - dist) * 0.05;

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

        b.dx *= 0.99;
        b.dy *= 0.99;

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = getColor(b.score);
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.font = "12px Arial";

        ctx.fillText(b.game.slice(0, 14), b.x, b.y - 5);
        ctx.fillText(`Odd: ${b.odds.toFixed(2)}`, b.x, b.y + 12);
      });

      requestAnimationFrame(draw);
    }

    draw();

    // 🔥 ZOOM
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      scale.current += e.deltaY * -0.001;
      scale.current = Math.min(Math.max(0.5, scale.current), 2);
    });

    // 🔥 DRAG
    canvas.addEventListener("mousedown", (e) => {
      dragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener("mousemove", (e) => {
      if (!dragging.current) return;

      offset.current.x += e.clientX - lastMouse.current.x;
      offset.current.y += e.clientY - lastMouse.current.y;

      lastMouse.current = { x: e.clientX, y: e.clientY };
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
