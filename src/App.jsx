import { useEffect, useRef } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const bubbles = useRef([]);

  const scale = useRef(1);
  const offset = useRef({ x: 0, y: 0 });

  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // 🧠 SCORE
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

  // 🎨 COR
  function getColor(score) {
    if (score > 80) return "#00ff88";
    if (score > 50) return "#ffaa00";
    return "#ff4444";
  }

  // 🔥 FETCH À PROVA DE FALHA
  async function fetchGames() {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();

      const safeData = Array.isArray(data) ? data : [];

      if (safeData.length === 0) {
        throw new Error("Sem dados");
      }

      const canvas = canvasRef.current;

      bubbles.current = safeData.map((item) => {
        const score = calculateScore(item);

        return {
          ...item,
          x: canvas.width / 2 + (Math.random() - 0.5) * 300,
          y: canvas.height / 2 + (Math.random() - 0.5) * 300,
          radius: 40 + (item.odds || 1.5) * 8,
          dx: (Math.random() - 0.5) * 2,
          dy: (Math.random() - 0.5) * 2,
          score,
        };
      });

    } catch (e) {
      console.log("🔥 fallback ativado");

      const canvas = canvasRef.current;

      const fallback = [
        { game: "Flamengo vs Palmeiras", odds: 2.2, minute: 70, corners: 8, shots: 12, dangerous: 20 },
        { game: "Real Madrid vs Barcelona", odds: 1.9, minute: 55, corners: 5, shots: 9, dangerous: 14 },
        { game: "PSG vs Lyon", odds: 2.3, minute: 65, corners: 7, shots: 11, dangerous: 18 }
      ];

      bubbles.current = fallback.map((item) => ({
        ...item,
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2 + (Math.random() - 0.5) * 200,
        radius: 40 + item.odds * 8,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
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

      // centralização
      bubbles.current.forEach((b) => {
        b.dx += (centerX - b.x) * 0.0005;
        b.dy += (centerY - b.y) * 0.0005;
      });

      // colisão
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

        // 🔔 destaque
        if (b.score > 90) {
          ctx.strokeStyle = "#00ff88";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.font = "12px Arial";

        ctx.fillText(b.game.slice(0, 14), b.x, b.y - 5);
        ctx.fillText(`Odd: ${b.odds.toFixed(2)}`, b.x, b.y + 10);
        ctx.fillText(`Score: ${b.score}`, b.x, b.y + 25);
      });

      requestAnimationFrame(draw);
    }

    draw();

    // zoom
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      scale.current += e.deltaY * -0.001;
      scale.current = Math.min(Math.max(0.5, scale.current), 2);
    });

    // drag
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
