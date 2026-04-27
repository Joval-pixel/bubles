import { useEffect, useState } from "react";

export default function Dashboard() {
  const [games, setGames] = useState([]);

  async function load() {
    const res = await fetch("/api/games");
    const data = await res.json();
    setGames(data);
  }

  useEffect(() => {
    load();
    setInterval(load, 30000);
  }, []);

  async function pagar() {
    const res = await fetch("/api/stripe");
    const data = await res.json();
    window.location.href = data.url;
  }

  return (
    <div style={{ background: "#000", color: "#fff", height: "100vh", padding: 20 }}>
      <h1>🔥 Painel Premium</h1>

      <button onClick={pagar}>Assinar Premium</button>

      <h2>📡 Alertas EV+</h2>

      {games
        .filter(g => g.ev > 0.05)
        .map(g => (
          <div key={g.id} style={{ color: "#00ff88" }}>
            {g.game} | EV {g.ev}
          </div>
        ))}
    </div>
  );
}
