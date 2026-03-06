import { SupabaseClient } from '@supabase/supabase-js';
import { predictScore } from '@/lib/ai/prediction-engine';

interface TeamGoalAverages {
  scored: number;
  conceded: number;
}

interface TeamFixtureStat {
  home_team_id: number;
  away_team_id: number;
  home_goals: number | null;
  away_goals: number | null;
}

const DEFAULT_GOALS = 1.2;

function normalizeProbabilities(input: { homeWin: number; draw: number; awayWin: number }) {
  const total = input.homeWin + input.draw + input.awayWin;
  if (total <= 0) {
    return { homeWin: 0.34, draw: 0.33, awayWin: 0.33 };
  }

  return {
    homeWin: input.homeWin / total,
    draw: input.draw / total,
    awayWin: input.awayWin / total
  };
}

function confidenceFromProbabilities(prob: { homeWin: number; draw: number; awayWin: number }): 'high' | 'medium' | 'low' {
  const top = Math.max(prob.homeWin, prob.draw, prob.awayWin);
  if (top >= 0.58) return 'high';
  if (top >= 0.44) return 'medium';
  return 'low';
}

async function getTeamGoalAverages(supabase: SupabaseClient, teamId: number): Promise<TeamGoalAverages> {
  const { data, error } = await supabase
    .from('fixtures')
    .select('home_team_id,away_team_id,home_goals,away_goals')
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .eq('status_short', 'FT')
    .not('home_goals', 'is', null)
    .not('away_goals', 'is', null)
    .order('date', { ascending: false })
    .limit(10);

  if (error || !data || data.length === 0) {
    return { scored: DEFAULT_GOALS, conceded: DEFAULT_GOALS };
  }

  let scored = 0;
  let conceded = 0;
  let count = 0;

  for (const row of data as TeamFixtureStat[]) {
    if (row.home_goals === null || row.away_goals === null) {
      continue;
    }

    if (row.home_team_id === teamId) {
      scored += row.home_goals;
      conceded += row.away_goals;
      count += 1;
    } else if (row.away_team_id === teamId) {
      scored += row.away_goals;
      conceded += row.home_goals;
      count += 1;
    }

    if (count >= 5) {
      break;
    }
  }

  if (count === 0) {
    return { scored: DEFAULT_GOALS, conceded: DEFAULT_GOALS };
  }

  return {
    scored: scored / count,
    conceded: conceded / count
  };
}

export async function buildFixturePrediction(
  supabase: SupabaseClient,
  homeTeamId: number,
  awayTeamId: number
) {
  const [homeAvg, awayAvg] = await Promise.all([
    getTeamGoalAverages(supabase, homeTeamId),
    getTeamGoalAverages(supabase, awayTeamId)
  ]);

  const raw = predictScore(homeAvg.scored, awayAvg.scored);
  const probabilities = normalizeProbabilities(raw);

  return {
    ...probabilities,
    confidence: confidenceFromProbabilities(probabilities)
  };
}
