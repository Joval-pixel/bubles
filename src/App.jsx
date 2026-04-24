import { useEffect, useRef } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const bubbles = useRef([]);

  async function fetchGames() {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();

      bubbles.current = data.map((item) => ({
        ...item,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: item.odds * 20,
        dx: (Math.random() - 0.5) * 1.5,
        dy: (Math.random() - 0.5) * 1.5,
      }));
    } catch {
      console.log("Erro API");
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubbles.current.forEach((b) => {
        b.x += b.dx;
        b.y += b.dy;

        if (b.x + b.radius > canvas.width || b.x - b.radius < 0)
          b.dx *= -1;
        if (b.y + b.radius > canvas.height || b.y - b.radius < 0)
          b.dy *= -1;

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#00ff88";
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.fillText(b.game, b.x, b.y);
      });

      requestAnimationFrame(draw);
    }

    draw();
  }, []);

  return <canvas ref={canvasRef} style={{ background: "#111" }} />;
}
