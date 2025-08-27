async function getData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/matches`, { cache: 'no-store' });
  return res.json();
}

export default async function Leagues() {
  const { matches } = await getData();
  const byLeague = matches.reduce((acc, m) => {
    acc[m.league] = acc[m.league] || [];
    acc[m.league].push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Ligas</h1>
      {Object.entries(byLeague).map(([lg, list]) => (
        <section key={lg} className="card mt-4">
          <h2 className="text-lg mb-3 font-semibold">{lg}</h2>
          <ul className="divide-y divide-black/5 dark:divide-white/5">
            {list.map(m => (
              <li key={m.id} className="py-2 flex items-center justify-between">
                <a href={`/match/${m.id}`} className="hover:underline">{m.home} vs {m.away}</a>
                <span className="text-neutral-600 dark:text-white/60 text-sm">
                  {new Date(m.kickoff).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
