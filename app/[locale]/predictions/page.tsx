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

async function getPredictions() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [] as Array<{ fixture: string } & PredictionPayload>;

  const { data } = await supabase
    .from('fixtures')
    .select(
      'id,date,status_short,home_team_id,away_team_id,ai_prediction,home:teams!fixtures_home_team_id_fkey(name),away:teams!fixtures_away_team_id_fkey(name)'
    )
    .gte('date', new Date().toISOString())
    .in('status_short', ['NS', 'TBD', 'PST'])
    .not('ai_prediction', 'is', null)
    .order('date', { ascending: true })
    .limit(20);

  const rows = (data ?? []) as PredictionFixtureRow[];
  return rows
    .map((row) => {
      const prediction = row.ai_prediction;
      if (!prediction) return null;

      return {
        fixture: `${teamName(row.home) ?? row.home_team_id} vs ${teamName(row.away) ?? row.away_team_id}`,
        homeWinProb: prediction.homeWinProb,
        drawProb: prediction.drawProb,
        awayWinProb: prediction.awayWinProb,
        confidence: prediction.confidence
      };
    })
    .filter((item): item is { fixture: string } & PredictionPayload => Boolean(item));
}

export default async function PredictionsPage() {
  const t = await getTranslations('prediction');
  const predictions = await getPredictions();
  const freeTier = predictions.slice(0, 3);
  const premiumTier = predictions.slice(3, 10);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('aiPrediction')}</h1>

      {predictions.length === 0 ? (
        <p className="text-sm text-slate-400">No predictions available yet. Run prediction cron after fixture sync.</p>
      ) : (
        <>
          {freeTier.map((prediction) => (
            <PredictionCard key={prediction.fixture} {...prediction} />
          ))}

          {premiumTier.length > 0 && (
            <PremiumGate isPremium={false}>
              <div className="space-y-4">
                {premiumTier.map((prediction) => (
                  <PredictionCard key={prediction.fixture} {...prediction} />
                ))}
              </div>
            </PremiumGate>
          )}
        </>
      )}
    </div>
  );
}
