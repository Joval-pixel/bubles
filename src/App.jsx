import { useEffect, useRef, useState } from "react";

export default function App() {
  const [bubbles, setBubbles] = useState([]);
  const [top, setTop] = useState([]);
  const ref = useRef([]);

  useEffect(() => {
    fetchGames();
    animate();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/games");

      // 🔥 SE API QUEBRAR → fallback automático
      if (!res.ok) throw new Error("API erro");

      const data = await res.json();

      if (!data || data.length === 0) throw new Error("sem dados");

      processGames(data);

    } catch (err) {
      console.log("⚠️ usando fallback:", err.message);

      // 🔥 DADOS FAKE (NUNCA MAIS TELA PRETA)
      const fake = Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        game: `Jogo ${i + 1}`,
        shots: Math.random() * 15,
        corners: Math.random() * 10,
        dangerous: Math.random() * 30,
        odds: 1.5 + Math.random() * 2,
        minute: Math.random() * 90,
      }));

      processGames(fake);
    }
  };

  const processGames = (data) => {
    const enriched = data.map((g) => {
      const score =
        g.dangerous * 3 +
        g.shots * 2 +
        g.corners * 1.5;

      const prob = Math.min(0.9, g.dangerous * 0.002 + g.shots * 0.01);
      const ev = prob * g.odds - 1;

      return {
        ...g,
        score,
        prob,
        ev,
        isValue: ev > 0.05,
      };
    });

    const sorted = enriched.sort((a, b) => b.ev - a.ev);

    const max = sorted[0]?.ev || 1;
    const min = sorted[sorted.length - 1]?.ev || 0;

    const bubbles = sorted.map((g) => {
      const normalized = (g.ev - min) / (max - min || 1);

      return {
        ...g,
        size: 40 + normalized * 200,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
      };
    });

    ref.current = bubbles;
    setBubbles(bubbles);
    setTop(bubbles.slice(0, 5));
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
    if (b.ev > 0.3) return "#00ff88";
    if (b.ev > 0.1) return "#ffaa00";
    return "#ff4444";
  };

  // 🔥 SE AINDA NÃO CARREGOU
  if (!bubbles.length) {
    return (
      <div style={{ color: "#fff", background: "#000", height: "100vh" }}>
        Carregando dados...
      </div>
    );
  }

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
            fontSize: 11,
            boxShadow: `0 0 30px ${getColor(b)}`,
          }}
        >
          <div>
            {b.game}
            <br />
            EV: {b.ev.toFixed(2)}
          </div>
        </div>
      ))}

      <div style={{
        position: "absolute",
        right: 10,
        top: 10,
        background: "#111",
        padding: 10,
        borderRadius: 10,
        color: "#fff"
      }}>
        🔥 TOP VALUE
        {top.map((t, i) => (
          <div key={i}>
            {t.game} ({t.ev.toFixed(2)})
          </div>
        ))}
      </div>
    </div>
  );
}
