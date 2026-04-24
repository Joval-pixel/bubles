import { useEffect, useRef, useState } from "react";

export default function App() {
  const [bubbles, setBubbles] = useState([]);
  const [top, setTop] = useState([]);

  const ref = useRef([]);
  const containerRef = useRef();

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchGames();
    animate();
  }, []);

  const fetchGames = async () => {
    const res = await fetch("/api/games");
    const data = await res.json();

    const b = data.map(g => ({
      ...g,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      score: calcScore(g)
    }));

    ref.current = b;
    setBubbles(b);
    updateTop(b);
  };

  const calcScore = (g) => {
    let s = 0;
    s += g.dangerous * 2;
    s += g.shots * 1.5;
    s += g.corners * 1.2;
    s += g.minute * 0.5;
    return Math.min(120, Math.max(40, s));
  };

  const getColor = (s) => {
    if (s > 90) return "#00ff88";
    if (s > 70) return "#ffaa00";
    return "#ff4444";
  };

  const updateTop = (b) => {
    const sorted = [...b].sort((a, b) => b.score - a.score).slice(0, 5);
    setTop(sorted);
  };

  const animate = () => {
    const loop = () => {
      const arr = ref.current;

      for (let i = 0; i < arr.length; i++) {
        let b = arr[i];

        b.x += b.vx;
        b.y += b.vy;

        if (b.x < 0 || b.x > window.innerWidth) b.vx *= -1;
        if (b.y < 0 || b.y > window.innerHeight) b.vy *= -1;

        for (let j = i + 1; j < arr.length; j++) {
          let o = arr[j];

          let dx = o.x - b.x;
          let dy = o.y - b.y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          let min = 60;

          if (dist < min) {
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

  // ZOOM
  const handleWheel = (e) => {
    e.preventDefault();
    setZoom(z => Math.min(2, Math.max(0.5, z - e.deltaY * 0.001)));
  };

  // DRAG
  let dragging = false;
  let start = { x: 0, y: 0 };

  const onMouseDown = (e) => {
    dragging = true;
    start = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    setOffset(o => ({
      x: o.x + (e.clientX - start.x),
      y: o.y + (e.clientY - start.y)
    }));
    start = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = () => dragging = false;

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
        cursor: "grab"
      }}
    >

      {/* MAPA */}
      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`
        }}
      >
        {bubbles.map((b, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: b.x,
              top: b.y,
              width: b.score,
              height: b.score,
              borderRadius: "50%",
              background: getColor(b.score),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#000",
              fontSize: 11,
              boxShadow: `0 0 30px ${getColor(b.score)}`
            }}
          >
            <div>
              <b>{b.game.slice(0, 16)}</b>
              <br />
              {Math.round(b.score)}
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 TOP OPORTUNIDADES */}
      <div style={{
        position: "absolute",
        right: 10,
        top: 10,
        background: "#111",
        padding: 10,
        borderRadius: 10,
        color: "#fff",
        width: 200
      }}>
        <b>🔥 TOP APOSTAS</b>
        {top.map((t, i) => (
          <div key={i} style={{ marginTop: 8 }}>
            {t.game.slice(0, 20)}<br />
            Score: {Math.round(t.score)}
          </div>
        ))}
      </div>
    </div>
  );
}
