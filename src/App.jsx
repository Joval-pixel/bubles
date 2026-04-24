import { useEffect, useRef, useState } from "react";

export default function App() {
  const [bubbles, setBubbles] = useState([]);
  const containerRef = useRef();

  const zoomRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });

  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const animationRef = useRef();

  useEffect(() => {
    fetchGames();
  }, []);

  // 🚀 BUSCAR DADOS
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
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.max(50, score * 1.3),
      };
    });

    setBubbles(items);
    animate(items);
  };

  // 🎯 SCORE
  const calcScore = (g) => {
    if (!g.oddHome) return 10;
    return Math.min(120, (1 / g.oddHome) * 120);
  };

  // 🚀 FÍSICA REAL (REPULSÃO + COLISÃO)
  const animate = (initial) => {
    let items = [...initial];

    const loop = () => {
      for (let i = 0; i < items.length; i++) {
        const a = items[i];

        // movimento
        a.x += a.vx;
        a.y += a.vy;

        // atrito leve (suaviza)
        a.vx *= 0.995;
        a.vy *= 0.995;

        // parede
        if (a.x < 0 || a.x > window.innerWidth - a.size) a.vx *= -1;
        if (a.y < 0 || a.y > window.innerHeight - a.size) a.vy *= -1;

        for (let j = i + 1; j < items.length; j++) {
          const b = items[j];

          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = (a.size + b.size) / 2;

          if (dist < minDist) {
            // 🔥 repulsão suave
            const angle = Math.atan2(dy, dx);
            const force = (minDist - dist) * 0.02;

            a.vx += Math.cos(angle) * force;
            a.vy += Math.sin(angle) * force;

            b.vx -= Math.cos(angle) * force;
            b.vy -= Math.sin(angle) * force;
          }
        }
      }

      setBubbles([...items]);
      animationRef.current = requestAnimationFrame(loop);
    };

    loop();
  };

  // 🎨 COR
  const getColor = (score) => {
    if (score > 80) return "#00ff99";
    if (score > 50) return "#ffcc00";
    return "#ff4444";
  };

  // 🖱️ ZOOM
  const handleWheel = (e) => {
    const zoomFactor = 0.1;
    zoomRef.current += e.deltaY > 0 ? -zoomFactor : zoomFactor;
    zoomRef.current = Math.max(0.5, Math.min(2, zoomRef.current));
  };

  // 🖱️ DRAG
  const onMouseDown = (e) => {
    dragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e) => {
    if (!dragging.current) return;

    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;

    offsetRef.current.x += dx;
    offsetRef.current.y += dy;

    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        overflow: "hidden",
        position: "relative",
        cursor: "grab",
      }}
    >
      {bubbles.map((b) => {
        const x = b.x * zoomRef.current + offsetRef.current.x;
        const y = b.y * zoomRef.current + offsetRef.current.y;
        const size = b.size * zoomRef.current;

        return (
          <div
            key={b.id}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: getColor(b.score),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#000",
              fontSize: size > 80 ? 12 : 9,
              fontWeight: "bold",
              textAlign: "center",
              padding: 6,
              boxShadow: `0 0 30px ${getColor(b.score)}`,
              userSelect: "none",
            }}
          >
            <div style={{ maxWidth: "90%" }}>{b.game}</div>
            <div>{b.oddHome}</div>
          </div>
        );
      })}
    </div>
  );
}
