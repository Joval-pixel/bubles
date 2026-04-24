import { useEffect, useRef } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const bubbles = useRef([]);
  const alertsRef = useRef([]);

  const scale = useRef(1);
  const offset = useRef({ x: 0, y: 0 });

  // =========================
  // SCORE PROFISSIONAL
  // =========================
  function calculateScore(g) {
    let score = 0;

    score += (g.dangerous || 0) * 0.8;
    score += (g.shots || 0) * 1.2;
    score += (g.corners || 0) * 2.5;

    if (g.minute > 60) score += 20;
    if (g.minute > 75) score += 30;

    if (g.odds > 2) score += 10;

    return Math.max(10, Math.round(score));
  }

  // =========================
  // ALERTA PROFISSIONAL
  // =========================
  function detectSignal(g) {
    let confidence = 0;

    if (g.dangerous > 25) confidence += 25;
    if (g.shots > 10) confidence += 20;
    if (g.corners > 6) confidence += 20;

    if (g.minute > 60) confidence += 15;
    if (g.minute > 75) confidence += 20;

    if (g.odds > 1.8 && g.odds < 3) confidence += 10;

    return confidence;
  }

  function getColor(score) {
    if (score > 110) return "#00ffcc";
    if (score > 80) return "#00ff88";
    if (score > 60) return "#ffaa00";
    return "#ff3b3b";
  }

  // =========================
  // DISTRIBUIÇÃO ESTILO CRYPTO
  // =========================
  function distribute(data, canvas) {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const sorted = [...data].sort((a, b) => b.score - a.score);

    return sorted.map((b, i) => {
      const angle = Math.random() * Math.PI * 2;
      const spread = Math.sqrt(i) * 140;

      return {
        ...b,
        x: cx + Math.cos(angle) * spread,
        y: cy + Math.sin(angle) * spread,
        dx: 0,
        dy: 0,
      };
    });
  }

  // =========================
  // FETCH + ALERTAS
  // =========================
  async function fetchGames() {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();

      const canvas = canvasRef.current;

      const alerts = [];

      const processed = data
        .map((g) => {
          const score = calculateScore(g);
          const confidence = detectSignal(g);

          if (confidence > 70) {
            alerts.push({
              game: g.game,
              confidence,
              type: g.corners > 6 ? "ESCANTEIOS" : "OVER",
            });
          }

          return {
            ...g,
            score,
            confidence,
            radius: Math.max(25, score * 1.4),
          };
        })
        .filter((g) => g.score > 30);

      bubbles.current = distribute(processed, canvas);
      alertsRef.current = alerts;

    } catch {
      console.log("fallback ativo");
    }
  }

  // =========================
  // RENDER
  // =========================
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    fetchGames();
    setInterval(fetchGames, 10000);

    function physics() {
      const arr = bubbles.current;

      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const a = arr[i];
          const b = arr[j];

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = a.radius + b.radius;

          if (dist < minDist) {
            const angle = Math.atan2(dy, dx);
            const force = (minDist - dist) * 0.05;

            a.x -= Math.cos(angle) * force;
            a.y -= Math.sin(angle) * force;

            b.x += Math.cos(angle) * force;
            b.y += Math.sin(angle) * force;
          }
        }
      }
    }

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

      physics();

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

        ctx.shadowBlur = 30;
        ctx.shadowColor = getColor(b.score);

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.shadowBlur = 0;

        ctx.fillStyle = "#000";
        ctx.textAlign = "center";

        ctx.font = `${Math.max(12, b.radius / 4)}px Arial`;
        ctx.fillText(b.game.slice(0, 16), b.x, b.y - 5);

        ctx.font = `${Math.max(12, b.radius / 5)}px Arial`;
        ctx.fillText(`${b.score}`, b.x, b.y + 15);
      });

      // 🔔 ALERTAS NA TELA
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#00ff88";
      ctx.font = "16px Arial";

      alertsRef.current.slice(0, 5).forEach((a, i) => {
        ctx.fillText(
          `🔥 ${a.type} | ${a.game} (${a.confidence}%)`,
          20,
          30 + i * 22
        );
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
