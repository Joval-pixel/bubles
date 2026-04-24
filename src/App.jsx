import { useEffect, useState } from "react";

export default function App() {
  const [games, setGames] = useState([]);
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();

      setGames(data);
      generateBubbles(data);

    } catch (err) {
      console.log("erro:", err);
    }
  };

  // 🔥 GERA POSIÇÕES SEM COLISÃO
  const generateBubbles = (data) => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const placed = [];

    const newBubbles = data.map((g) => {
      const score = calcScore(g);

      const size = Math.max(40, score * 1.2);

      let x, y, tries = 0;
      let valid = false;

      while (!valid && tries < 200) {
        x = Math.random() * (width - size);
        y = Math.random() * (height - size);

        valid = true;

        for (let p of placed) {
          const dx = p.x - x;
          const dy = p.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < (p.size + size) / 2 + 10) {
            valid = false;
            break;
          }
        }

        tries++;
      }

      const bubble = { ...g, x, y, size, score };
      placed.push(bubble);
      return bubble;
    });

    setBubbles(newBubbles);
  };

  // 🧠 SCORE PROFISSIONAL
  const calcScore = (g) => {
    let score = 0;

    score += g.dangerous * 2;
    score += g.shots * 1.5;
    score += g.corners * 1.2;
    score += g.minute * 0.5;

    return Math.min(120, score);
  };

  const getColor = (score) => {
    if (score > 90) return "#00ff88";
    if (score > 70) return "#ffaa00";
    return "#ff4444";
  };

  return (
    <div style={{ background: "#000", width: "100vw", height: "100vh" }}>
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
            textAlign: "center",
            fontSize: 12,
            color: "#000",
            boxShadow: `0 0 30px ${getColor(b.score)}`,
            padding: 5,
            overflow: "hidden"
          }}
        >
          <div>
            <div style={{ fontWeight: "bold" }}>
              {b.game.slice(0, 18)}
            </div>
            <div>{Math.round(b.score)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
