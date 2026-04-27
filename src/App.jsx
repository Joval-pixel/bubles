import { useEffect, useState } from "react";

export default function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/games");

        if (!res.ok) throw new Error("API error");

        const data = await res.json();

        setGames(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>BET BUBBLES v2.0</h1>

      {loading && <p>Carregando...</p>}

      {error && <p style={styles.error}>{error}</p>}

      {!loading && games.length === 0 && (
        <p>Nenhum jogo disponível</p>
      )}

      <div style={styles.list}>
        {games.map((g) => (
          <div key={g.id} style={styles.card}>
            <div style={styles.game}>{g.game}</div>
            <div>Odd: {g.oddHome}</div>
            <div>EV: {g.ev}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#0a0a0a",
    color: "#fff",
    minHeight: "100vh",
    padding: 20,
    fontFamily: "Arial",
  },
  title: {
    marginBottom: 20,
  },
  list: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: 15,
  },
  card: {
    background: "#111",
    padding: 15,
    borderRadius: 10,
    border: "1px solid #222",
  },
  game: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  error: {
    color: "red",
  },
};
