export default function MatchCard({ match }) {
  return (
    <a href={`/match/${match.id}`} className="card block hover:ring-2 hover:ring-accent/50 transition">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">{match.home} vs {match.away}</h3>
          <p className="text-xs text-neutral-600 dark:text-white/60">
            {match.league} • {new Date(match.kickoff).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}
          </p>
        </div>
        <div className="text-right text-sm">
          <div className="badge">Modelo Poisson</div>
        </div>
      </div>
    </a>
  );
}
