import { useEffect, useState } from "react";

export default function App() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/games")
      .then(res => res.json())
      .then(data => {
        console.log("API DATA:", data);
        setGames(data);
      })
      .catch(err => {
        console.error(err);
        setError("Erro ao carregar API");
      });
  }, []);

  return (
    <div style={{
      background: "black",
      minHeight: "100vh",
      color: "white",
      padding: "20px"
    }}>
      <h1>Radar de Jogos</h1>

      {error && <div style={{color:"red"}}>{error}</div>}

      {games.length === 0 && <div>Sem dados</div>}

      {games.map((g) => (
        <div key={g.id} style={{
          marginBottom: "10px",
          padding: "10px",
          border: "1px solid #333",
          borderRadius: "8px"
        }}>
          <strong>{g.game}</strong><br/>
          Odd: {g.bestOdd}
        </div>
      ))}
    </div>
  );
}
