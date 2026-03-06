import { NextRequest, NextResponse } from 'next/server';
import { getFixturesByDate } from '@/lib/api-football';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

type RawFixture = {
  fixture: {
    id: number;
    date: string;
    status: { short: string; long: string };
  };
  league: {
    id: number;
    name: string;
    country?: string;
    logo?: string;
    flag?: string;
    season?: number;
  };
  teams: {
    home: { id: number; name: string; logo?: string };
    away: { id: number; name: string; logo?: string };
  };
  goals: { home: number | null; away: number | null };
};

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

function toDateRange(startISO: string, days: number) {
  const dates: string[] = [];
  const start = new Date(`${startISO}T00:00:00.000Z`);
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: 'Missing Supabase admin environment variables' }, { status: 500 });
  }

  const start = request.nextUrl.searchParams.get('start') ?? new Date().toISOString().slice(0, 10);
  const days = Number(request.nextUrl.searchParams.get('days') ?? 2);
  const dates = toDateRange(start, Number.isFinite(days) && days > 0 && days <= 7 ? days : 2);

  try {
    const fixtureResponses = await Promise.all(dates.map((date) => getFixturesByDate(date)));
    const rawFixtures = fixtureResponses.flat() as RawFixture[];

    const leagues = new Map<number, Record<string, unknown>>();
    const teams = new Map<number, Record<string, unknown>>();
    const fixtures = new Map<number, Record<string, unknown>>();

    for (const item of rawFixtures) {
      leagues.set(item.league.id, {
        id: item.league.id,
        name: item.league.name,
        country: item.league.country ?? null,
        logo_url: item.league.logo ?? null,
        flag_url: item.league.flag ?? null,
        season: item.league.season ?? new Date(item.fixture.date).getUTCFullYear()
      });

      teams.set(item.teams.home.id, {
        id: item.teams.home.id,
        name: item.teams.home.name,
        logo_url: item.teams.home.logo ?? null,
        league_id: item.league.id
      });

      teams.set(item.teams.away.id, {
        id: item.teams.away.id,
        name: item.teams.away.name,
        logo_url: item.teams.away.logo ?? null,
        league_id: item.league.id
      });

      fixtures.set(item.fixture.id, {
        id: item.fixture.id,
        league_id: item.league.id,
        season: item.league.season ?? new Date(item.fixture.date).getUTCFullYear(),
        date: item.fixture.date,
        status_short: item.fixture.status.short,
        status_long: item.fixture.status.long,
        home_team_id: item.teams.home.id,
        away_team_id: item.teams.away.id,
        home_goals: item.goals.home,
        away_goals: item.goals.away,
        updated_at: new Date().toISOString()
      });
    }

    if (leagues.size > 0) {
      const { error } = await supabase.from('leagues').upsert([...leagues.values()], { onConflict: 'id' });
      if (error) throw error;
    }

    if (teams.size > 0) {
      const { error } = await supabase.from('teams').upsert([...teams.values()], { onConflict: 'id' });
      if (error) throw error;
    }

    if (fixtures.size > 0) {
      const { error } = await supabase.from('fixtures').upsert([...fixtures.values()], { onConflict: 'id' });
      if (error) throw error;
    }

    return NextResponse.json({
      ok: true,
      dates,
      synced: {
        leagues: leagues.size,
        teams: teams.size,
        fixtures: fixtures.size
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to sync fixtures', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
