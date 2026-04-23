"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [jogos, setJogos] = useState([]);

  useEffect(() => {
    fetch("/api/refresh")
      .then((res) => res.json())
      .then((data) => {
        setJogos(data);
      });
  }, []);

  return (
    <div>
      <h1>Jogos ao vivo</h1>

      {jogos.length === 0 ? (
        <p>Carregando...</p>
      ) : (
        jogos.map((jogo) => (
          <div key={jogo.fixture.id}>
            {jogo.teams.home.name} vs {jogo.teams.away.name}
          </div>
        ))
      )}
    </div>
  );
}
