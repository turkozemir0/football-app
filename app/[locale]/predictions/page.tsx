import { getTranslations } from 'next-intl/server';
import { PremiumGate } from '@/components/prediction/PremiumGate';
import { PredictionCard } from '@/components/prediction/PredictionCard';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

interface PredictionPayload {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  confidence: 'high' | 'medium' | 'low';
}

interface PredictionFixtureRow {
  id: number;
  date: string;
  status_short: string;
  league: Array<{ id: number; name: string }> | { id: number; name: string } | null;
  home_team_id: number;
  away_team_id: number;
  ai_prediction: PredictionPayload | null;
  home: Array<{ name: string }> | { name: string } | null;
  away: Array<{ name: string }> | { name: string } | null;
}

function teamName(team: PredictionFixtureRow['home']): string | null {
  if (!team) return null;
  if (Array.isArray(team)) return team[0]?.name ?? null;
  return team.name ?? null;
}

function leagueInfo(league: PredictionFixtureRow['league']) {
  if (!league) return null;
  if (Array.isArray(league)) return league[0] ?? null;
  return league;
}

function parsePrediction(value: unknown): PredictionPayload | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Partial<PredictionPayload>;
  if (
    typeof item.homeWinProb !== 'number' ||
    typeof item.drawProb !== 'number' ||
    typeof item.awayWinProb !== 'number' ||
    !item.confidence
  ) {
    return null;
  }
  return {
    homeWinProb: item.homeWinProb,
    drawProb: item.drawProb,
    awayWinProb: item.awayWinProb,
    confidence: item.confidence
  };
}

function validDateInput(input: string | undefined): string | null {
  if (!input) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(input) ? input : null;
}

async function getPredictionRows(selectedDate: string | null) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [] as PredictionFixtureRow[];

  const query = supabase
    .from('fixtures')
    .select(
      'id,date,status_short,home_team_id,away_team_id,ai_prediction,league:leagues(id,name),home:teams!fixtures_home_team_id_fkey(name),away:teams!fixtures_away_team_id_fkey(name)'
    )
    .in('status_short', ['NS', 'TBD', 'PST'])
    .not('ai_prediction', 'is', null)
    .order('date', { ascending: true });

  if (selectedDate) {
    query.gte('date', `${selectedDate}T00:00:00.000Z`).lte('date', `${selectedDate}T23:59:59.999Z`);
  } else {
    query.gte('date', new Date().toISOString()).limit(300);
  }

  const { data } = await query;
  return (data ?? []) as PredictionFixtureRow[];
}

type SearchParams = { date?: string; league?: string };

export default async function PredictionsPage({
  searchParams
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const t = await getTranslations('prediction');
  const filters = (await searchParams) ?? {};
  const selectedDate = validDateInput(filters.date);
  const selectedLeagueId = filters.league ? Number(filters.league) : null;

  const rows = await getPredictionRows(selectedDate);
  const leagueOptions = Array.from(
    new Map(
      rows
        .map((row) => leagueInfo(row.league))
        .filter((league): league is { id: number; name: string } => Boolean(league))
        .map((league) => [league.id, league])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  const predictions = rows
    .filter((row) => {
      if (!selectedLeagueId) return true;
      const league = leagueInfo(row.league);
      return league?.id === selectedLeagueId;
    })
    .map((row) => {
      const prediction = parsePrediction(row.ai_prediction);
      if (!prediction) return null;
      return {
        id: row.id,
        fixture: `${teamName(row.home) ?? row.home_team_id} vs ${teamName(row.away) ?? row.away_team_id}`,
        league: leagueInfo(row.league)?.name ?? 'Unknown league',
        ...prediction
      };
    })
    .filter((item): item is { id: number; fixture: string; league: string } & PredictionPayload => Boolean(item));

  const freeTier = predictions.slice(0, 3);
  const premiumTier = predictions.slice(3, 10);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('aiPrediction')}</h1>

      <form className="grid gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3 sm:grid-cols-3" method="GET">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-300">{t('filterDate')}</span>
          <input
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            type="date"
            name="date"
            defaultValue={selectedDate ?? ''}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-300">{t('filterLeague')}</span>
          <select
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            name="league"
            defaultValue={selectedLeagueId ? String(selectedLeagueId) : ''}
          >
            <option value="">{t('allLeagues')}</option>
            {leagueOptions.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white" type="submit">
            {t('applyFilters')}
          </button>
          <a className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200" href="?">
            {t('resetFilters')}
          </a>
        </div>
      </form>

      {predictions.length === 0 ? (
        <p className="text-sm text-slate-400">{t('noPredictions')}</p>
      ) : (
        <>
          {freeTier.map((prediction) => (
            <div key={prediction.id} className="space-y-1">
              <p className="text-xs text-slate-400">{prediction.league}</p>
              <PredictionCard {...prediction} />
            </div>
          ))}

          {premiumTier.length > 0 && (
            <PremiumGate isPremium={false}>
              <div className="space-y-4">
                {premiumTier.map((prediction) => (
                  <div key={prediction.id} className="space-y-1">
                    <p className="text-xs text-slate-400">{prediction.league}</p>
                    <PredictionCard {...prediction} />
                  </div>
                ))}
              </div>
            </PremiumGate>
          )}
        </>
      )}
    </div>
  );
}
