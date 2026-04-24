import { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef();
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetch("/api/games")
      .then((res) => res.json())
      .then(setGames);
  }, []);

  useEffect(() => {
    if (!games.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const bubbles = games.map((g) => ({
      ...g,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      r: Math.max(25, Math.abs(g.ev) * 250),
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubbles.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;

        if (b.x < b.r || b.x > canvas.width - b.r) b.vx *= -1;
        if (b.y < b.r || b.y > canvas.height - b.r) b.vy *= -1;

        let color = "#ff3b3b";
        if (b.ev > 0.05) color = "#00ff88";
        else if (b.ev > 0) color = "#ffaa00";

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";

        ctx.fillText(b.game, b.x, b.y - 5);
        ctx.fillText(`EV ${b.ev}`, b.x, b.y + 10);
      });

      requestAnimationFrame(draw);
    }

    draw();
  }, [games]);

  return (
    <div style={{ background: "#000", height: "100vh" }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
