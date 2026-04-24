import { useEffect, useRef, useState } from "react";

export default function App() {
  const [bubbles, setBubbles] = useState([]);
  const animationRef = useRef();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    const res = await fetch("/api/games");
    const data = await res.json();

    const items = data.map((g) => {
      const score = calcScore(g);

      return {
        ...g,
        score,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.max(50, score * 1.5),
      };
    });

    setBubbles(items);
    animate(items);
  };

  // 🔥 SCORE MELHOR
  const calcScore = (g) => {
    if (!g.oddHome) return 10;
    return Math.min(120, (1 / g.oddHome) * 120);
  };

  // 🚀 FÍSICA + COLISÃO
  const animate = (initial) => {
    let items = [...initial];

    const loop = () => {
      items.forEach((a, i) => {
        // movimento
        a.x += a.vx;
        a.y += a.vy;

        // parede
        if (a.x < 0 || a.x > window.innerWidth - a.size) a.vx *= -1;
        if (a.y < 0 || a.y > window.innerHeight - a.size) a.vy *= -1;

        // colisão entre bolhas
        items.forEach((b, j) => {
          if (i === j) return;

          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < (a.size + b.size) / 2) {
            a.vx *= -1;
            a.vy *= -1;
          }
        });
      });

      setBubbles([...items]);
      animationRef.current = requestAnimationFrame(loop);
    };

    loop();
  };

  const getColor = (score) => {
    if (score > 80) return "#00ff99";
    if (score > 50) return "#ffcc00";
    return "#ff4444";
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {bubbles.map((b) => (
        <div
          key={b.id}
          style={{
            position: "absolute",
            left: b.x,
            top: b.y,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: getColor(b.score),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#000",
            fontSize: b.size > 80 ? 12 : 9,
            fontWeight: "bold",
            textAlign: "center",
            padding: 5,
            boxShadow: `0 0 25px ${getColor(b.score)}`,
          }}
        >
          <div style={{ maxWidth: "90%" }}>
            {b.game}
          </div>
          <div>{b.oddHome}</div>
        </div>
      ))}
    </div>
  );
}
