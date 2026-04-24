import { useEffect, useRef, useState } from "react";

export default function App() {
  const [bubbles, setBubbles] = useState([]);
  const ref = useRef([]);

  useEffect(() => {
    fetchGames();
    animate();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();

      const processed = data.map((g) => {
        const ev = calcEV(g);

        return {
          ...g,
          ev,
          size: 40 + Math.max(0, ev) * 200,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
        };
      });

      ref.current = processed;
      setBubbles(processed);
    } catch (e) {
      console.log("erro:", e);
    }
  };

  const calcEV = (g) => {
    const strength =
      g.dangerous * 0.05 +
      g.shots * 0.07 +
      g.corners * 0.04 +
      g.minute * 0.01;

    const prob = Math.min(0.8, strength / 10);
    return prob * g.oddHome - 1;
  };

  const animate = () => {
    const loop = () => {
      const arr = ref.current;

      arr.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;

        if (b.x < 0 || b.x > window.innerWidth) b.vx *= -1;
        if (b.y < 0 || b.y > window.innerHeight) b.vy *= -1;
      });

      setBubbles([...arr]);
      requestAnimationFrame(loop);
    };

    loop();
  };

  const color = (ev) => {
    if (ev > 0.3) return "#00ff88";
    if (ev > 0.1) return "#ffaa00";
    return "#ff4444";
  };

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000" }}>
      {bubbles.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x,
            top: b.y,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: color(b.ev),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 25px ${color(b.ev)}`,
            color: "#000",
            fontSize: 11,
            textAlign: "center",
            padding: 5,
          }}
        >
          <div>
            {b.game}
            <br />
            EV {b.ev.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}
