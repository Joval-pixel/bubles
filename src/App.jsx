import { useEffect, useRef, useState } from "react";

export default function App() {
  const [bubbles, setBubbles] = useState([]);
  const [status, setStatus] = useState("Carregando...");
  const ref = useRef([]);

  useEffect(() => {
    fetchGames();
    animate();
  }, []);

  // =========================
  // FETCH
  // =========================
  const fetchGames = async () => {
    try {
      setStatus("Buscando jogos...");

      const res = await fetch("/api/games");
      const data = await res.json();

      if (!data || data.length === 0) {
        setStatus("⚠️ Sem dados da API");
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
      setStatus(`OK (${processed.length} jogos)`);
    } catch (e) {
      console.log("Erro:", e);
      setStatus("❌ Erro ao carregar API");
    }
  };

  // =========================
  // EV
  // =========================
  const calcEV = (g) => {
    const pressure =
      (g.attacks || 0) * 0.03 +
      (g.dangerous || 0) * 0.06 +
      (g.possession || 0) * 0.01 +
      (g.minute || 0) * 0.02;

    const prob = Math.min(0.85, pressure / 10);

    return prob * (g.odd || 2) - 1;
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

        if (b.x < 0 || b.x > window.innerWidth) b.vx *= -1;
        if (b.y < 0 || b.y > window.innerHeight) b.vy *= -1;
      });

      setBubbles([...arr]);
      requestAnimationFrame(loop);
    };

    loop();
  };

  // =========================
  // COR
  // =========================
  const getColor = (ev) => {
    if (ev > 0.3) return "#00ff88";
    if (ev > 0.1) return "#ffaa00";
    return "#ff4444";
  };

  // ⚠️ NÃO DEIXA TELA VAZIA
  const visible = bubbles.length > 0 ? bubbles : [];

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        overflow: "hidden",
      }}
    >
      {/* STATUS (DEBUG) */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          color: "#0f0",
          fontSize: 14,
        }}
      >
        {status}
      </div>

      {/* SE NÃO TEM NADA */}
      {visible.length === 0 && (
        <div
          style={{
            color: "#fff",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          Nenhum jogo disponível
        </div>
      )}

      {/* BOLHAS */}
      {visible.map((b, i) => (
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
            {b.game || "Jogo"}
            <br />
            {Math.round(b.minute || 0)}'
            <br />
            EV {b.ev.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}
