import { NextRequest, NextResponse } from 'next/server';
import { buildFixturePrediction } from '@/lib/ai/prediction-service';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

interface FixtureRow {
  id: number;
  home_team_id: number;
  away_team_id: number;
  home: Array<{ name: string }> | { name: string } | null;
  away: Array<{ name: string }> | { name: string } | null;
}

function teamName(team: FixtureRow['home']): string | null {
  if (!team) return null;
  if (Array.isArray(team)) return team[0]?.name ?? null;
  return team.name ?? null;
}

export async function GET(request: NextRequest) {
  const fixtureId = Number(request.nextUrl.searchParams.get('fixtureId'));
  if (!Number.isFinite(fixtureId) || fixtureId <= 0) {
    return NextResponse.json({ error: 'fixtureId query parameter is required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Missing Supabase admin environment variables' }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from('fixtures')
      .select(
        'id,home_team_id,away_team_id,home:teams!fixtures_home_team_id_fkey(name),away:teams!fixtures_away_team_id_fkey(name)'
      )
      .eq('id', fixtureId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Fixture not found' }, { status: 404 });
    }

    const fixture = data as FixtureRow;
    const prediction = await buildFixturePrediction(supabase, fixture.home_team_id, fixture.away_team_id);

    const payload = {
      fixtureId: fixture.id,
      fixture: `${teamName(fixture.home) ?? fixture.home_team_id} vs ${teamName(fixture.away) ?? fixture.away_team_id}`,
      homeWinProb: prediction.homeWin,
      drawProb: prediction.draw,
      awayWinProb: prediction.awayWin,
      confidence: prediction.confidence,
      generatedAt: new Date().toISOString(),
      model: 'poisson-v1'
    };

    await supabase
      .from('fixtures')
      .update({ ai_prediction: payload, updated_at: new Date().toISOString() })
      .eq('id', fixture.id);

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate prediction', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
