import { useEffect, useState } from "react";

export default function App() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/games")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setGames(data);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div style={{ color: "#fff", background: "#000", height: "100vh", padding: 20 }}>
        ❌ Erro ao carregar API
      </div>
    );
  }

  if (!games.length) {
    return (
      <div style={{ color: "#fff", background: "#000", height: "100vh", padding: 20 }}>
        ⏳ Carregando dados...
      </div>
    );
  }

  return (
    <div style={{ color: "#fff", background: "#000", height: "100vh", padding: 20 }}>
      <h1>BET BUBBLES</h1>

      {games.slice(0, 10).map(g => (
        <div key={g.id}>
          {g.game} | Odd {g.oddHome} | EV {g.ev}
        </div>
      ))}
    </div>
  );
}
