import { useEffect, useRef, useState } from "react";
import * as d3 from "d3-force";

export default function App() {
  const canvasRef = useRef(null);
  const [games, setGames] = useState([]);

  async function load() {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();
      setGames(data);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!games.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const nodes = games.map(g => ({
      ...g,
      radius: 30 + g.ev * 300
    }));

    const simulation = d3
      .forceSimulation(nodes)
      .force("center", d3.forceCenter(canvas.width / 2, canvas.height / 2))
      .force("charge", d3.forceManyBody().strength(5))
      .force("collision", d3.forceCollide().radius(d => d.radius + 2))
      .alphaDecay(0.02)
      .on("tick", draw);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);

        const color = n.ev > 0 ? "#00ff88" : "#ff3b3b";

        ctx.fillStyle = color;
        ctx.shadowBlur = 30;
        ctx.shadowColor = color;
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";

        ctx.fillText(n.game.slice(0, 20), n.x, n.y - 5);
        ctx.fillText(`Odd ${n.odd}`, n.x, n.y + 12);
        ctx.fillText(`EV ${n.ev}`, n.x, n.y + 25);
      });
    }

    return () => simulation.stop();
  }, [games]);

  return (
    <div style={{ background: "#000", height: "100vh" }}>
      <h1 style={{ color: "#fff", padding: 20 }}>
        🎯 BET BUBBLES PRO
      </h1>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
