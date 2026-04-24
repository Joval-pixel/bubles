import { useEffect, useRef, useState } from "react";

export default function App() {
  const [games, setGames] = useState([]);
  const bubblesRef = useRef([]);

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    animate();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();

      const bubbles = data.map((g) => ({
        ...g,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: calcScore(g),
        score: calcScore(g)
      }));

      bubblesRef.current = bubbles;
      setGames(bubbles);

    } catch (err) {
      console.log("erro:", err);
    }
  };

  const calcScore = (g) => {
    let s = 0;
    s += g.dangerous * 2;
    s += g.shots * 1.5;
    s += g.corners * 1.2;
    s += g.minute * 0.5;
    return Math.min(120, Math.max(40, s));
  };

  const getColor = (score) => {
    if (score > 90) return "#00ff88";
    if (score > 70) return "#ffaa00";
    return "#ff4444";
  };

  const animate = () => {
    const loop = () => {
      const bubbles = bubblesRef.current;

      for (let i = 0; i < bubbles.length; i++) {
        let b = bubbles[i];

        // movimento
        b.x += b.vx;
        b.y += b.vy;

        // borda
        if (b.x < 0 || b.x > window.innerWidth) b.vx *= -1;
        if (b.y < 0 || b.y > window.innerHeight) b.vy *= -1;

        // colisão / repulsão
        for (let j = i + 1; j < bubbles.length; j++) {
          let o = bubbles[j];

          let dx = o.x - b.x;
          let dy = o.y - b.y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          let minDist = (b.size + o.size) / 2;

          if (dist < minDist) {
            let angle = Math.atan2(dy, dx);
            let force = 0.5;

            b.vx -= Math.cos(angle) * force;
            b.vy -= Math.sin(angle) * force;

            o.vx += Math.cos(angle) * force;
            o.vy += Math.sin(angle) * force;
          }
        }

        // leve atração ao centro (organiza)
        let cx = window.innerWidth / 2;
        let cy = window.innerHeight / 2;

        b.vx += (cx - b.x) * 0.00005;
        b.vy += (cy - b.y) * 0.00005;
      }

      setGames([...bubbles]);
      requestAnimationFrame(loop);
    };

    loop();
  };

  return (
    <div style={{ background: "#000", width: "100vw", height: "100vh", overflow: "hidden" }}>
      {games.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x,
            top: b.y,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: getColor(b.score),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            fontSize: 12,
            color: "#000",
            boxShadow: `0 0 25px ${getColor(b.score)}`,
            pointerEvents: "none"
          }}
        >
          <div>
            <div style={{ fontWeight: "bold" }}>
              {b.game.slice(0, 18)}
            </div>
            <div>{Math.round(b.score)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
