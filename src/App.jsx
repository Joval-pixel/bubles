import { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // 🔥 FETCH
  const loadGames = () => {
    fetch("/api/games")
      .then(res => res.json())
      .then(data => {
        setGames(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setGames([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadGames();
  }, []);

  // 🔁 AUTO REFRESH
  useEffect(() => {
    const interval = setInterval(loadGames, 30000);
    return () => clearInterval(interval);
  }, []);

  // 🎯 CANVAS
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth - 300;
    canvas.height = window.innerHeight - 80;

    const filtered =
      filter === "positive"
        ? games.filter(g => g.ev > 0)
        : games;

    if (!filtered.length) return;

    const bubbles = filtered.map(g => ({
      ...g,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.max(25, g.oddHome * 12),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      friction: 0.98
    }));

    function getColor(ev) {
      if (ev > 0.2) return "#00ff88";
      if (ev > 0.05) return "#00cc66";
      if (ev > 0) return "#ffd700";
      return "#ff3b3b";
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bubbles.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;

        b.vx *= b.friction;
        b.vy *= b.friction;

        if (b.x < 0 || b.x > canvas.width) b.vx *= -1;
        if (b.y < 0 || b.y > canvas.height) b.vy *= -1;

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);

        const color = getColor(b.ev);

        ctx.fillStyle = color;
        ctx.shadowBlur = 25;
        ctx.shadowColor = color;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#000";
        ctx.textAlign = "center";

        ctx.font = "bold 12px Arial";
        ctx.fillText(b.game.slice(0, 16), b.x, b.y - 8);

        ctx.font = "11px Arial";
        ctx.fillText(`Odd ${b.oddHome}`, b.x, b.y + 6);
        ctx.fillText(`EV ${b.ev}`, b.x, b.y + 18);
      });

      requestAnimationFrame(draw);
    }

    draw();
  }, [games, filter]);

  const topGames = [...games]
    .filter(g => g.ev > 0)
    .sort((a, b) => b.ev - a.ev)
    .slice(0, 5);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0b0b0b", color: "#fff" }}>
      
      {/* 🔥 MAIN */}
      <div style={{ flex: 1 }}>
        
        {/* HEADER */}
        <div style={{
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          borderBottom: "1px solid #222"
        }}>
          <h2>BET BUBBLES</h2>

          <div>
            <button onClick={() => setFilter("all")} style={btnStyle(filter === "all")}>
              Todos
            </button>
            <button onClick={() => setFilter("positive")} style={btnStyle(filter === "positive")}>
              EV+
            </button>
          </div>
        </div>

        {/* CANVAS */}
        {loading ? (
          <div style={{ padding: 20 }}>Carregando...</div>
        ) : (
          <canvas ref={canvasRef} style={{ display: "block" }} />
        )}
      </div>

      {/* 🔥 SIDEBAR */}
      <div style={{
        width: 300,
        borderLeft: "1px solid #222",
        padding: 15
      }}>
        <h3>🔥 Top EV</h3>

        {topGames.map(g => (
          <div key={g.id} style={{
            padding: 10,
            marginTop: 10,
            background: "#111",
            borderRadius: 8
          }}>
            <div>{g.game}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Odd {g.oddHome} | EV {g.ev}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🎨 botão bonito
function btnStyle(active) {
  return {
    marginLeft: 10,
    padding: "6px 12px",
    background: active ? "#00ff88" : "#222",
    border: "none",
    color: active ? "#000" : "#fff",
    borderRadius: 6,
    cursor: "pointer"
  };
}
