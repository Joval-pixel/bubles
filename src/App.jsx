import { useEffect, useState } from "react";

export default function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/games")
      .then(res => res.json())
      .then(data => {
        setGames(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setGames([]);
        setLoading(false);
      });
  }, []);

  const filtered = games.filter(g => g.ev > 0);

  return (
    <div style={{
      background: "#0b0b0b",
      color: "#fff",
      minHeight: "100vh",
      padding: 20,
      fontFamily: "Arial"
    }}>

      <h1>🎯 BET BUBBLES</h1>
      <p style={{ opacity: 0.7 }}>
        Radar de apostas com valor (EV+)
      </p>

      {loading && <p>Carregando...</p>}

      {!loading && filtered.length === 0 && (
        <p>⚠️ Nenhuma oportunidade no momento</p>
      )}

      {/* TOP OPORTUNIDADES */}
      <h2 style={{ marginTop: 30 }}>🔥 TOP OPORTUNIDADES</h2>

      {filtered
        .sort((a, b) => b.ev - a.ev)
        .slice(0, 5)
        .map(g => (
          <div key={g.id} style={{
            padding: 12,
            marginTop: 10,
            background: "#111",
            borderRadius: 8,
            border: "1px solid #00ff88"
          }}>
            <strong>{g.game}</strong><br />
            Odd {g.oddHome} | EV {g.ev}
          </div>
        ))}

      {/* LISTA COMPLETA */}
      <h2 style={{ marginTop: 40 }}>📊 TODOS OS JOGOS</h2>

      {games.map(g => (
        <div key={g.id} style={{
          marginTop: 8,
          color: g.ev > 0 ? "#00ff88" : "#ff3b3b"
        }}>
          {g.game} | Odd {g.oddHome} | EV {g.ev}
        </div>
      ))}
    </div>
  );
}
