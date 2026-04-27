import { useEffect, useState } from "react";

export default function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/games");

        const data = await res.json();

        console.log("API DATA:", data);

        setGames(data);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div style={{ background: "black", color: "white", minHeight: "100vh", padding: 20 }}>
      <h1>BET BUBBLES v2.0</h1>

      {loading && <p>Carregando...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && games.length === 0 && (
        <p>Nenhum jogo encontrado (API pode estar vazia)</p>
      )}

      {games.map((g) => (
        <div
          key={g.id}
          style={{
            padding: 10,
            marginBottom: 10,
            border: "1px solid #333",
            borderRadius: 8,
          }}
        >
          <strong>{g.game}</strong>
          <br />
          Odd: {g.oddHome}
          <br />
          EV: {g.ev}
        </div>
      ))}
    </div>
  );
}
