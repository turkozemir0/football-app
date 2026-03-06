import { MatchCard } from '@/components/match/MatchCard';
import { FixtureSummary } from '@/types';

async function getTodaysFixtures(): Promise<FixtureSummary[]> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const date = new Date().toISOString().slice(0, 10);

  const response = await fetch(`${appUrl}/api/football/fixtures?date=${date}`, {
    next: { revalidate: 120 }
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as { fixtures?: FixtureSummary[] };
  return data.fixtures ?? [];
}

export default async function MatchesPage() {
  const fixtures = await getTodaysFixtures();

  const byLeague = fixtures.reduce<Record<string, FixtureSummary[]>>((acc, fixture) => {
    const leagueName = fixture.league.name;
    if (!acc[leagueName]) {
      acc[leagueName] = [];
    }
    acc[leagueName].push(fixture);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Today's Matches</h1>

      {Object.keys(byLeague).length === 0 ? (
        <p className="text-sm text-slate-400">No fixtures found in cache/API for today.</p>
      ) : (
        Object.entries(byLeague).map(([league, leagueFixtures]) => (
          <section key={league} className="space-y-2">
            <h2 className="text-lg font-medium text-slate-200">{league}</h2>
            {leagueFixtures.map((fixture) => (
              <MatchCard
                key={fixture.id}
                league={league}
                homeTeam={fixture.homeTeam.name}
                awayTeam={fixture.awayTeam.name}
                score={
                  fixture.goals.home === null || fixture.goals.away === null
                    ? 'vs'
                    : `${fixture.goals.home} - ${fixture.goals.away}`
                }
              />
            ))}
          </section>
        ))
      )}
    </div>
  );
}
