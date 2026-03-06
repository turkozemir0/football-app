import { MatchCard } from '@/components/match/MatchCard';

export default function MatchesPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Today's Matches</h1>
      <MatchCard league="Premier League" homeTeam="Arsenal" awayTeam="Chelsea" />
      <MatchCard league="Super Lig" homeTeam="Galatasaray" awayTeam="Fenerbahce" />
    </div>
  );
}
