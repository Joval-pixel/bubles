import { useEffect, useRef, useState } from "react";

export default function App() {
  const [bubbles, setBubbles] = useState([]);
  const [top, setTop] = useState([]);

  const ref = useRef([]);

  useEffect(() => {
    fetchGames();
    animate();
  }, []);

  // 🧠 BUSCA + PROCESSA DADOS
  const fetchGames = async () => {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();

      // calcula score
      const scored = data.map((g) => ({
        ...g,
        score: calcScore(g),
      }));

      // ordena
      const sorted = scored.sort((a, b) => b.score - a.score);

      const max = sorted[0]?.score || 1;
      const min = sorted[sorted.length - 1]?.score || 0;

      // normalização estilo Crypto
      const bubbles = sorted.map((g) => {
        const normalized = (g.score - min) / (max - min || 1);

        const size = 40 + Math.pow(normalized, 2.5) * 200;

        return {
          ...g,
          size,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
        };
      });

      ref.current = bubbles;
      setBubbles(bubbles);
      updateTop(bubbles);

    } catch (err) {
      console.log("erro:", err);
    }
  };

  // 🧠 SCORE PROFISSIONAL
  const calcScore = (g) => {
    let s = 0;

    s += g.dangerous * 3;
    s += g.shots * 2;
    s += g.corners * 1.5;

    if (g.minute > 60) s *= 1.5;
    if (g.odds > 2) s *= 1.2;

    return s;
  };

  // 🎯 TOP 5
  const updateTop = (arr) => {
    const sorted = [...arr].sort((a, b) => b.score - a.score).slice(0, 5);
    setTop(sorted);
  };

  // 🎨 COR
  const getColor = (s) => {
    if (s > 90) return "#00ff88";
    if (s > 70) return "#ffaa00";
    return "#ff4444";
  };

  // 🔄 ANIMAÇÃO (MOVIMENTO REAL)
  const animate = () => {
    const loop = () => {
      const arr = ref.current;

      for (let i = 0; i < arr.length; i++) {
        let b = arr[i];

        b.x += b.vx;
        b.y += b.vy;

        // bordas
        if (b.x < 0 || b.x > window.innerWidth) b.vx *= -1;
        if (b.y < 0 || b.y > window.innerHeight) b.vy *= -1;

        // colisão
        for (let j = i + 1; j < arr.length; j++) {
          let o = arr[j];

          let dx = o.x - b.x;
          let dy = o.y - b.y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          let minDist = (b.size + o.size) / 2;

          if (dist < minDist) {
            let angle = Math.atan2(dy, dx);

            b.vx -= Math.cos(angle) * 0.3;
            b.vy -= Math.sin(angle) * 0.3;

            o.vx += Math.cos(angle) * 0.3;
            o.vy += Math.sin(angle) * 0.3;
          }
        }
      }

      setBubbles([...arr]);
      requestAnimationFrame(loop);
    };

    loop();
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        overflow: "hidden",
      }}
    >
      {/* BOLHAS */}
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
            background: getColor(b.score),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#000",
            fontSize: 12,
            textAlign: "center",
            boxShadow: `0 0 30px ${getColor(b.score)}`,
            padding: 6,
          }}
        >
          <div>
            <div style={{ fontWeight: "bold" }}>
              {b.game?.slice(0, 18)}
            </div>
            <div>{Math.round(b.score)}</div>
          </div>
        </div>
      ))}

      {/* 🔥 TOP APOSTAS */}
      <div
        style={{
          position: "absolute",
          right: 10,
          top: 10,
          background: "#111",
          padding: 10,
          borderRadius: 10,
          color: "#fff",
          width: 220,
        }}
      >
        <b>🔥 TOP APOSTAS</b>

        {top.map((t, i) => (
          <div key={i} style={{ marginTop: 8 }}>
            {t.game?.slice(0, 22)}
            <br />
            Score: {Math.round(t.score)}
          </div>
        ))}
      </div>
    </div>
  );
}
