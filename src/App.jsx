import { useEffect, useRef, useState } from "react";

export default function App() {
  const [bubbles, setBubbles] = useState([]);
  const ref = useRef([]);

  useEffect(() => {
    fetchGames();
    animate();
  }, []);

  // =========================
  // BUSCAR DADOS
  // =========================
  const fetchGames = async () => {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();

      if (!data || data.length === 0) {
        console.log("Sem dados da API");
        return;
      }

      const processed = data.map((g) => {
        const ev = calcEV(g);

        return {
          ...g,
          ev,
          size: 40 + Math.max(0, ev) * 250,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
        };
      });

      ref.current = processed;
      setBubbles(processed);
    } catch (e) {
      console.log("Erro fetch:", e);
    }
  };

  // =========================
  // CALCULO EV (ARRUMADO)
  // =========================
  const calcEV = (g) => {
    const pressure =
      g.attacks * 0.03 +
      g.dangerous * 0.06 +
      g.possession * 0.01 +
      g.minute * 0.02;

    const prob = Math.min(0.85, pressure / 10);

    return prob * g.odd - 1;
  };

  // =========================
  // ANIMAÇÃO
  // =========================
  const animate = () => {
    const loop = () => {
      const arr = ref.current;

      arr.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;

        // colisão parede
        if (b.x < 0 || b.x > window.innerWidth) b.vx *= -1;
        if (b.y < 0 || b.y > window.innerHeight) b.vy *= -1;
      });

      setBubbles([...arr]);
      requestAnimationFrame(loop);
    };

    loop();
  };

  // =========================
  // COR DAS BOLHAS
  // =========================
  const getColor = (ev) => {
    if (ev > 0.3) return "#00ff88"; // MUITO BOM
    if (ev > 0.1) return "#ffaa00"; // MÉDIO
    return "#ff4444"; // RUIM
  };

  // =========================
  // FILTRO (IMPORTANTE)
  // =========================
  const visibleBubbles = bubbles.filter((b) => b.ev > 0);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        overflow: "hidden",
      }}
    >
      {visibleBubbles.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: b.x,
            top: b.y,
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: getColor(b.ev),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 25px ${getColor(b.ev)}`,
            color: "#000",
            fontSize: 11,
            textAlign: "center",
            padding: 6,
            fontWeight: "bold",
          }}
        >
          <div>
            {b.game}
            <br />
            {Math.round(b.minute)}'
            <br />
            EV {b.ev.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}
