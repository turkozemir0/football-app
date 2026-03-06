import { NextRequest, NextResponse } from 'next/server';
import { buildFixturePrediction } from '@/lib/ai/prediction-service';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

interface UpcomingFixture {
  id: number;
  date: string;
  home_team_id: number;
  away_team_id: number;
  home: Array<{ name: string }> | { name: string } | null;
  away: Array<{ name: string }> | { name: string } | null;
}

function teamName(team: UpcomingFixture['home']): string | null {
  if (!team) return null;
  if (Array.isArray(team)) return team[0]?.name ?? null;
  return team.name ?? null;
}

function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return true;
  }

  const bearer = request.headers.get('authorization');
  if (bearer === `Bearer ${cronSecret}`) {
    return true;
  }

  return request.nextUrl.searchParams.get('secret') === cronSecret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Missing Supabase admin environment variables' }, { status: 500 });
  }

  const now = new Date();
  const horizonHours = Number(request.nextUrl.searchParams.get('horizonHours') ?? 48);
  const horizon = Number.isFinite(horizonHours) && horizonHours > 0 ? horizonHours : 48;
  const until = new Date(now.getTime() + horizon * 60 * 60 * 1000).toISOString();

  try {
    const { data, error } = await supabase
      .from('fixtures')
      .select(
        'id,date,home_team_id,away_team_id,home:teams!fixtures_home_team_id_fkey(name),away:teams!fixtures_away_team_id_fkey(name)'
      )
      .gte('date', now.toISOString())
      .lte('date', until)
      .in('status_short', ['NS', 'TBD'])
      .order('date', { ascending: true })
      .limit(200);

    if (error) throw error;

    const fixtures = (data ?? []) as UpcomingFixture[];
    const updates: Array<{ id: number; ai_prediction: Record<string, unknown>; updated_at: string }> = [];
    const preview: Array<Record<string, unknown>> = [];

    for (const fixture of fixtures) {
      const prediction = await buildFixturePrediction(supabase, fixture.home_team_id, fixture.away_team_id);
      const payload = {
        homeWinProb: prediction.homeWin,
        drawProb: prediction.draw,
        awayWinProb: prediction.awayWin,
        confidence: prediction.confidence,
        generatedAt: new Date().toISOString(),
        model: 'poisson-v1'
      };

      updates.push({
        id: fixture.id,
        ai_prediction: payload,
        updated_at: new Date().toISOString()
      });

      if (preview.length < 10) {
        preview.push({
          fixtureId: fixture.id,
          fixture: `${teamName(fixture.home) ?? fixture.home_team_id} vs ${teamName(fixture.away) ?? fixture.away_team_id}`,
          ...payload
        });
      }
    }

    if (updates.length > 0) {
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('fixtures')
          .update({ ai_prediction: update.ai_prediction, updated_at: update.updated_at })
          .eq('id', update.id);

        if (updateError) throw new Error(JSON.stringify(updateError));
      }
    }

    return NextResponse.json({ ok: true, processed: updates.length, preview });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate predictions',
        details:
          error instanceof Error
            ? error.message
            : typeof error === 'object' && error !== null
              ? JSON.stringify(error)
              : String(error)
      },
      { status: 500 }
    );
  }
}
