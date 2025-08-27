import MatchCard from "../components/MatchCard";

async function getData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/matches`, { cache: 'no-store' });
  return res.json();
}

export default async function Home() {
  const { matches } = await getData();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Partidas de hoje</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {matches.map(m => (<MatchCard key={m.id} match={m} />))}
      </div>
    </div>
  );
}
