import ProbabilityBar from "../../../components/ProbabilityBar";

async function getPred(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/predict?id=${id}`, { cache: 'no-store' });
  return res.json();
}

export default async function MatchPage({ params }) {
  const data = await getPred(params.id);
  const { match, probs, tips, matrix } = data;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{match.home} vs {match.away}</h1>
            <p className="text-neutral-600 dark:text-white/60 text-sm">
              {match.league} • {new Date(match.kickoff).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
            </p>
          </div>
          <div className="text-right text-sm">
            <p>Estádio: <span className="badge">{match.venue}</span></p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <h2 className="font-semibold mb-3">Probabilidades 1X2</h2>
          <ProbabilityBar label={`${match.home} (1)`} value={probs.homeWin} />
          <ProbabilityBar label={`Empate (X)`} value={probs.draw} />
          <ProbabilityBar label={`${match.away} (2)`} value={probs.awayWin} />
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3">Mercados</h2>
          <ul className="space-y-2 text-sm">
            <li>Mais de 2.5 gols: <strong>{(probs.over25*100).toFixed(1)}%</strong></li>
            <li>Ambos marcam (BTTS): <strong>{(probs.btts*100).toFixed(1)}%</strong></li>
            <li>Menos de 2.5 gols: <strong>{(probs.under25*100).toFixed(1)}%</strong></li>
          </ul>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3">Dicas do algoritmo</h2>
          <ul className="flex flex-wrap gap-2">
            {tips.map(t => (<span key={t} className="badge">{t}</span>))}
          </ul>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="font-semibold mb-3">Placar correto (0–3)</h2>
        <table className="w-full text-sm">
          <thead className="text-neutral-600 dark:text-white/60">
            <tr>
              <th className="text-left">Casa↓ / Fora→</th>
              {[0,1,2,3].map(g => <th key={g} className="text-right pr-2">{g}</th>)}
            </tr>
          </thead>
          <tbody>
            {[0,1,2,3].map(h => (
              <tr key={h} className="border-t border-black/5 dark:border-white/5">
                <td className="py-1">{h}</td>
                {[0,1,2,3].map(a => (
                  <td key={a} className="text-right pr-2 py-1">{(matrix[h][a]*100).toFixed(1)}%</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
