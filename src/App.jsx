import { useEffect, useState } from "react";

export default function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/games")
      .then(res => res.json())
      .then(data => {
        console.log("API OK:", data);
        setGames(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{color:"white",background:"black",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>Carregando...</div>;
  }

  return (
    <div style={{background:"black",minHeight:"100vh",color:"white",padding:"20px"}}>
      <h1>Jogos</h1>

      {games.length === 0 && <div>Sem dados</div>}

      {games.map(g => (
        <div key={g.id} style={{marginBottom:10}}>
          {g.game} — Odd: {g.bestOdd}
        </div>
      ))}
    </div>
  );
}
