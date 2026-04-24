import { useEffect, useRef } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const bubbles = useRef([]);
  const alerts = useRef([]);

  const scale = useRef(1);
  const offset = useRef({ x: 0, y: 0 });

  // 🧠 SCORE PROFISSIONAL
  function calculateScore(g) {
    let score = 0;

    // pressão ofensiva
    score += (g.dangerous || 0) * 0.7;
    score += (g.shots || 0) * 1.3;
    score += (g.corners || 0) * 2.2;

    // tempo de jogo (mais valor no final)
    if (g.minute > 60) score += 20;
    if (g.minute > 75) score += 25;

    // odds interessantes
    if (g.odds > 2) score += 15;

    return Math.round(score);
  }

  function getColor(score) {
    if (score > 100) return "#00ff88"; // forte
    if (score > 70) return "#ffaa00";  // médio
    return "#ff4444";                  // fraco
  }

  async function fetchGames() {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();

      const canvas = canvasRef.current;

      bubbles.current = data.map((g) => {
        const score = calculateScore(g);

        return {
          ...g,
          score,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 15 + score * 0.7,
          dx: (Math.random() - 0.5) * 2,
          dy: (Math.random() - 0.5) * 2,
        };
      });

    } catch {
      console.log("fallback ativo");
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

      // 🔥 FILTRO: só jogos bons
      const hotGames = bubbles.current.filter((b) => b.score > 70);

      // 🥇 ranking top 10
      const top = [...hotGames]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      bubbles.current.forEach((b) => {
        b.x += b.dx;
        b.y += b.dy;

        b.dx *= 0.995;
        b.dy *= 0.995;

        // glow
        ctx.shadowBlur = 15;
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

        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.font = `${Math.max(10, b.radius / 3)}px Arial`;

        ctx.fillText(b.game.slice(0, 12), b.x, b.y - 5);
        ctx.fillText(`${b.score}`, b.x, b.y + 12);

        // 🔔 ALERTA
        if (b.score > 110) {
          alerts.current.push({
            text: b.game,
            time: Date.now(),
          });
        }
      });

      // 🥇 DESENHAR RANKING
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#fff";
      ctx.font = "14px Arial";

      top.forEach((g, i) => {
        ctx.fillText(
          `${i + 1}. ${g.game.slice(0, 20)} (${g.score})`,
          20,
          30 + i * 20
        );
      });

      // 🔔 ALERTAS NA TELA
      alerts.current = alerts.current.filter(
        (a) => Date.now() - a.time < 3000
      );

      alerts.current.forEach((a, i) => {
        ctx.fillStyle = "#00ff88";
        ctx.font = "18px Arial";
        ctx.fillText(a.text, canvas.width / 2 - 100, 60 + i * 25);
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
