import { useEffect, useState } from "react";

export default function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/games")
      .then(res => res.json())
      .then(data => {
        console.log("DADOS API:", data);
        setGames(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro API:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "black"
      }}>
        Carregando jogos...
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div style={{
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "black"
      }}>
        Nenhum jogo encontrado
      </div>
    );
  }

  return (
    <div style={{
      background: "black",
      minHeight: "100vh",
      padding: "20px",
      color: "white"
    }}>
      <h2>Jogos encontrados:</h2>

      {games.map((g, i) => (
        <div key={i} style={{
          marginBottom: "10px",
          padding: "10px",
          border: "1px solid #333",
          borderRadius: "8px"
        }}>
          <div>{g.game}</div>
          <div>Odd: {g.bestOdd}</div>
        </div>
      ))}
    </div>
  );
}
