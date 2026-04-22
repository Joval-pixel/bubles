"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [jogos, setJogos] = useState([]);

  useEffect(() => {
    fetch("/api/refresh")
      .then((r) => r.json())
      .then(setJogos);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Jogos</h1>

      {jogos.length === 0 && <p>Carregando...</p>}

      {jogos.map((j, i) => (
        <div key={i}>
          {j.teams?.home?.name} vs {j.teams?.away?.name}
        </div>
      ))}
    </div>
  );
}
