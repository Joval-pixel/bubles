import { useEffect, useRef, useState } from "react";

export default function App() {
  const [bubbles, setBubbles] = useState([]);
  const animationRef = useRef();

  useEffect(() => {
    fetchGames();
  }, []);

  // 🚀 BUSCAR DADOS
  const fetchGames = async () => {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();

      const formatted = data.map((g) => {
        const score = calcScore(g);

        return {
          ...g,
          score,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: 40 + score * 2,
        };
      });

      setBubbles(formatted);
      startAnimation(formatted);
    } catch (err) {
      console.log(err);
    }
  };

  // 🎯 SCORE BASEADO EM ODDS (SIMPLES)
  const calcScore = (g) => {
    if (!g.oddHome) return 0;
    return Math.max(0, (1 / g.oddHome) * 100);
  };

  // 🎬 ANIMAÇÃO
  const startAnimation = (initial) => {
    let items = [...initial];

    const animate = () => {
      items = items.map((b) => {
        let x = b.x + b.vx;
        let y = b.y + b.vy;

        // 🔥 colisão com parede
        if (x < 0 || x > window.innerWidth - b.size) b.vx *= -1;
        if (y < 0 || y > window.innerHeight - b.size) b.vy *= -1;

        return { ...b, x, y };
      });

      setBubbles([...items]);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  // 🎨 COR DA BOLHA
  const getColor = (score) => {
    if (score > 60) return "#00ff88"; // verde
    if (score > 40) return "#ffcc00"; // amarelo
    return "#ff4444"; // vermelho
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
            alignItems: "center",
            justifyContent: "center",
            color: "#000",
            fontSize: 10,
            textAlign: "center",
            boxShadow: `0 0 20px ${getColor(b.score)}`,
            transition: "0.1s",
          }}
        >
          <div>
            <div>{b.game}</div>
            <div>{b.oddHome}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
