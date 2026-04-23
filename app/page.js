"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [jogos, setJogos] = useState([]);

  useEffect(() => {
    fetch("/api/refresh")
      .then((res) => res.json())
      .then((data) => {
        console.log("API:", data); // debug
        setJogos(data || []);
      })
      .catch((err) => {
        console.error(err);
        setJogos([]);
      });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Jogos ao vivo</h1>

      {jogos.length === 0 ? (
        <p>Nenhum jogo ao vivo</p>
      ) : (
        jogos.map((jogo, index) => (
          <div key={index}>
            {jogo?.teams?.home?.name || "Time A"} vs{" "}
            {jogo?.teams?.away?.name || "Time B"}
          </div>
        ))
      )}
    </div>
  );
}
