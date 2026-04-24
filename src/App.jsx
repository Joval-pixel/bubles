import { useEffect, useRef, useState } from "react";

export default function App() {
  const [bubbles, setBubbles] = useState([]);
  const [top, setTop] = useState([]);
  const ref = useRef([]);

  useEffect(() => {
    fetchGames();
    animate();
  }, []);

  // -----------------------
  // 🔢 MODELO (heurístico)
  // -----------------------

  // Score bruto (pressão do jogo)
  const calcScore = (g) => {
    let s = 0;
    s += g.dangerous * 3;
    s += g.shots * 2;
    s += g.corners * 1.5;
    if (g.minute > 60) s *= 1.4;
    return s;
  };

  // Probabilidade de gol (0–1)
  const calcGoalProb = (g) => {
    let p = 0;

    p += g.dangerous * 0.002;
    p += g.shots * 0.01;
    p += g.corners * 0.015;

    // fase do jogo
    if (g.minute > 60) p *= 1.2;
    if (g.minute > 75) p *= 1.3;

    // clamp
    return Math.max(0.01, Math.min(0.95, p));
  };

  // Probabilidade implícita das odds
  const impliedProb = (odds) => {
    if (!odds || odds <= 1) return 0;
    return 1 / odds;
  };

  // EV = valor esperado
  const calcEV = (prob, odds) => {
    return prob * odds - 1; // > 0 = valor positivo
  };

  // -----------------------
  // 🎨 Cor por qualidade
  // -----------------------
  const getColor = (b) => {
    if (b.isValue && b.ev > 0.25) return "#00ff88"; // ótimo
    if (b.isValue) return "#ffaa00"; // bom
    return "#ff4444"; // ruim
  };

  // -----------------------
  // 🔄 Fetch + ranking real
  // -----------------------
  const fetchGames = async () => {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();

      const enriched = data.map((g) => {
        const score = calcScore(g);
        const prob = calcGoalProb(g);
        const imp = impliedProb(g.odds);
        const ev = calcEV(prob, g.odds);

        return {
          ...g,
          score,
          prob,
          imp,
          ev,
          isValue: ev > 0.05, // threshold mínimo
        };
      });

      // ordena por EV (melhor primeiro)
      const sorted = enriched.sort((a, b) => b.ev - a.ev);

      const max = sorted[0]?.ev || 1;
      const min = sorted[sorted.length - 1]?.ev || 0;

      // normalização → tamanho estilo Crypto
      const bubbles = sorted.map((g) => {
        const normalized = (g.ev - min) / (max - min || 1);
        const size = 40 + Math.pow(Math.max(0, normalized), 2.5) * 220;

        return {
          ...g,
          size,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          alerted: false,
        };
      });

      ref.current = bubbles;
      setBubbles(bubbles);
      setTop(bubbles.slice(0, 5));

    } catch (e) {
      console.log("erro:", e);
    }
  };

  // -----------------------
  // 🎬 Movimento (física leve)
  // -----------------------
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

        // colisão simples
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

        // 🔔 ALERTA DE VALOR
        if (b.isValue && b.ev > 0.3 && !b.alerted) {
          b.alerted = true;
          console.log("🔥 VALUE BET:", b.game, "EV:", b.ev.toFixed(2));
        }
      }

      setBubbles([...arr]);
      requestAnimationFrame(loop);
    };

    loop();
  };

  // -----------------------
  // 🖥️ UI
  // -----------------------
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", overflow: "hidden" }}>
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
            textAlign: "center",
            fontSize: 11,
            boxShadow: `0 0 30px ${getColor(b)}`,
            padding: 6,
          }}
          title={`Prob: ${(b.prob*100).toFixed(1)}% | Odds: ${b.odds.toFixed(2)} | EV: ${b.ev.toFixed(2)}`}
        >
          <div>
            <b>{b.game.slice(0, 16)}</b>
            <br />
            EV: {b.ev.toFixed(2)}
          </div>
        </div>
      ))}

      {/* TOP VALUE */}
      <div
        style={{
          position: "absolute",
          right: 10,
          top: 10,
          background: "#111",
          padding: 10,
          borderRadius: 10,
          color: "#fff",
          width: 240,
        }}
      >
        <b>🔥 TOP VALUE</b>
        {top.map((t, i) => (
          <div key={i} style={{ marginTop: 8 }}>
            {t.game.slice(0, 20)}
            <br />
            EV: {t.ev.toFixed(2)} | Prob: {(t.prob*100).toFixed(0)}%
          </div>
        ))}
      </div>
    </div>
  );
}
