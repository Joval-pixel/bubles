import { useEffect, useState } from "react";

export default function App() {
  const [games, setGames] = useState([]);

  async function load() {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();
      setGames(data);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: "#000",
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      position: "relative",
      fontFamily: "Arial"
    }}>
      <h1 style={{
        color: "#fff",
        padding: "20px",
        position: "absolute",
        zIndex: 10
      }}>
        🎯 BET BUBBLES
      </h1>

      {games.map((g, i) => {
        const size = 60 + (g.ev * 300);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: Math.random() * 90 + "%",
              top: Math.random() * 90 + "%",
              width: size,
              height: size,
              borderRadius: "50%",
              background: g.ev > 0 ? "#00ff88" : "#ff3b3b",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#000",
              fontSize: "10px",
              textAlign: "center",
              boxShadow: g.ev > 0
                ? "0 0 25px #00ff88"
                : "0 0 15px #ff3b3b",
              transition: "0.3s"
            }}
          >
            <div>{g.game}</div>
            <div>Odd {g.odd}</div>
            <div>EV {g.ev}</div>
          </div>
        );
      })}
    </div>
  );
}
