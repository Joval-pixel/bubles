import { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef();
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => {
        console.log("API DATA:", data);

        // 👉 se API vier vazia, usa dados fake TEMPORÁRIOS (pra não ficar preto)
        if (!data || data.length === 0) {
          setGames([
            { game: "Teste 1", ev: 0.1 },
            { game: "Teste 2", ev: -0.05 },
            { game: "Teste 3", ev: 0.2 },
          ]);
        } else {
          setGames(data);
        }
      })
      .catch(() => {
        setGames([
          { game: "Erro API", ev: 0.1 },
          { game: "Sem dados", ev: -0.1 },
        ]);
      });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (!games.length) return;

    const bubbles = games.map((g) => ({
      ...g,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      r: Math.max(30, Math.abs(g.ev) * 200),
    }));

    function draw() {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";

        ctx.fillText(b.game, b.x, b.y);
        ctx.fillText(`EV ${b.ev}`, b.x, b.y + 14);
      });

      requestAnimationFrame(draw);
    }

    draw();
  }, [games]);

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
