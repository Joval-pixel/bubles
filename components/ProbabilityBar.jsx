export default function ProbabilityBar({ label, value }) {
  const pct = Math.max(0, Math.min(1, value || 0));
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-neutral-600 dark:text-white/70">{(pct*100).toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
        <div className="h-full" style={{ width: `${pct*100}%`, background: 'linear-gradient(90deg, rgba(37,99,235,1) 0%, rgba(37,99,235,0.6) 100%)' }} />
      </div>
    </div>
  );
}
