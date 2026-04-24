import { useEffect, useState } from "react";

export default function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/games");
      const data = await res.json();

      console.log("dados:", data);

      setGames(data);
    } catch (err) {
      console.log("erro:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#000", minHeight: "100vh", color: "#fff", padding: 20 }}>
      <h1>Odds ao vivo</h1>

      {loading && <p>Carregando...</p>}

      {!loading && games.length === 0 && (
        <p>Nenhum jogo disponível</p>
      )}

      {games.map((g) => (
        <div
          key={g.id}
          style={{
            padding: 15,
            margin: 10,
            background: "#111",
            borderRadius: 10,
          }}
        >
          <h3>{g.game}</h3>
          <p>Liga: {g.league}</p>
          <p>Casa: {g.oddHome}</p>
          <p>Fora: {g.oddAway}</p>
        </div>
      ))}
    </div>
  );
}
