import { useEffect, useRef } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const bubbles = useRef([]);
  const alerts = useRef([]);

  const scale = useRef(1);
  const offset = useRef({ x: 0, y: 0 });

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

      const safe = Array.isArray(data) ? data : [];

      if (safe.length === 0) throw new Error();

      bubbles.current = safe.map((item) => ({
        ...item,
        x: canvas.width / 2 + (Math.random() - 0.5) * 300,
        y: canvas.height / 2 + (Math.random() - 0.5) * 300,
        radius: 40 + (item.odds || 1.5) * 8,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        score: calculateScore(item),
      }));

    } catch {
      const canvas = canvasRef.current;

      const fallback = [
        { game: "Fallback 1", odds: 2.0, minute: 70, corners: 7, shots: 10, dangerous: 15 },
        { game: "Fallback 2", odds: 1.8, minute: 60, corners: 5, shots: 8, dangerous: 12 },
        { game: "Fallback 3", odds: 2.3, minute: 75, corners: 9, shots: 13, dangerous: 22 }
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

      // 🔥 ranking top 5
      const top = [...bubbles.current]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      bubbles.current.forEach((b) => {
        b.x += b.dx;
        b.y += b.dy;

        b.dx *= 0.99;
        b.dy *= 0.99;

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = getColor(b.score);
        ctx.fill();

        // destaque forte
        if (b.score > 90) {
          ctx.strokeStyle = "#00ff88";
          ctx.lineWidth = 3;
          ctx.stroke();

          alerts.current.push({
            text: b.game,
            time: Date.now()
          });
        }

        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.font = "12px Arial";

        ctx.fillText(b.game.slice(0, 14), b.x, b.y - 5);
        ctx.fillText(`Score: ${b.score}`, b.x, b.y + 15);
      });

      // 🥇 desenhar ranking
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#fff";
      ctx.font = "14px Arial";

      top.forEach((g, i) => {
        ctx.fillText(
          `${i + 1}. ${g.game.slice(0, 18)} (${g.score})`,
          20,
          30 + i * 20
        );
      });

      // 🔔 alertas na tela
      alerts.current = alerts.current.filter(
        (a) => Date.now() - a.time < 3000
      );

      alerts.current.forEach((a, i) => {
        ctx.fillStyle = "#00ff88";
        ctx.font = "18px Arial";
        ctx.fillText(a.text, canvas.width / 2 - 100, 50 + i * 25);
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
