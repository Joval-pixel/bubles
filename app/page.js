import { getJogos } from "../lib/api";

export default async function Home() {
  const jogos = await getJogos();

  return (
    <div>
      <h1>Jogos ao vivo</h1>

      {jogos?.map((jogo) => (
        <div key={jogo.fixture.id}>
          {jogo.teams.home.name} vs {jogo.teams.away.name}
        </div>
      ))}
    </div>
  );
}
