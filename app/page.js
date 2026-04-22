"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [jogos, setJogos] = useState([]);

  useEffect(() => {
    fetch("/api/refresh")
      .then((r) => r.json())
      .then(setJogos)
      .catch(() => setJogos([]));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Jogos ao vivo</h1>

      {jogos.length === 0 && <p>Nenhum jogo encontrado</p>}

      {jogos.map((jogo, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          {jogo.teams?.home?.name} vs {jogo.teams?.away?.name}
        </div>
      ))}
    </div>
  );
}
