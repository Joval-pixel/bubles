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
        const ai = calcAI(g);

        return {
          ...g,
          ...ai,
          size: 50 + ai.ev * 200,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
        };
      });

      ref.current = processed;
      setBubbles(processed);
    } catch (e) {
      console.log("Erro fetch:", e);
    }
  };

  const calcAI = (g) => {
    const attack = g.dangerous * 0.04;
    const pressure = g.shots * 0.06;
    const corners = g.corners * 0.03;
    const tempo = g.minute * 0.01;

    const raw = attack + pressure + corners + tempo;

    const prob = Math.min(0.9, raw / 10);
    const ev = prob * g.oddHome - 1;

    return { prob, ev, score: raw };
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

  const getColor = (b) => {
    if (b.ev > 0.25) return "#00ff88";
    if (b.ev > 0.1) return "#ffaa00";
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
            background: getColor(b),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#000",
            fontSize: 12,
            boxShadow: `0 0 30px ${getColor(b)}`,
            textAlign: "center",
            padding: 5,
          }}
        >
          <div>
            {b.game}
            <br />
            EV: {b.ev.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}
