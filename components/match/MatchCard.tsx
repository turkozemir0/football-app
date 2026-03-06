interface MatchCardProps {
  homeTeam: string;
  awayTeam: string;
  score?: string;
  league: string;
}

export function MatchCard({ homeTeam, awayTeam, score = 'vs', league }: MatchCardProps) {
  return (
    <article className="rounded-xl border border-slate-700 bg-slate-900 p-4">
      <p className="mb-2 text-xs text-slate-400">{league}</p>
      <h3 className="text-lg font-semibold">{homeTeam} {score} {awayTeam}</h3>
    </article>
  );
}
