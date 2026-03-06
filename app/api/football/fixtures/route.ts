import { NextRequest, NextResponse } from 'next/server';
import { getFixturesByDate } from '@/lib/api-football';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { FixtureSummary } from '@/types';

function normalizeFixture(raw: any): FixtureSummary {
  return {
    id: raw.fixture.id,
    league: {
      id: raw.league.id,
      name: raw.league.name
    },
    date: raw.fixture.date,
    statusShort: raw.fixture.status.short,
    homeTeam: {
      id: raw.teams.home.id,
      name: raw.teams.home.name
    },
    awayTeam: {
      id: raw.teams.away.id,
      name: raw.teams.away.name
    },
    goals: {
      home: raw.goals.home,
      away: raw.goals.away
    }
  };
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date') ?? new Date().toISOString().slice(0, 10);

  try {
    const { data: cached } = await supabaseAdmin
      .from('fixtures')
      .select('id,date,status_short,home_team_id,away_team_id,home_goals,away_goals,leagues(id,name),home:teams!fixtures_home_team_id_fkey(id,name),away:teams!fixtures_away_team_id_fkey(id,name)')
      .gte('date', `${date}T00:00:00.000Z`)
      .lte('date', `${date}T23:59:59.999Z`)
      .limit(100);

    if (cached && cached.length > 0) {
      const fixtures: FixtureSummary[] = cached.map((item: any) => ({
        id: item.id,
        league: {
          id: item.leagues?.id ?? 0,
          name: item.leagues?.name ?? 'Unknown league'
        },
        date: item.date,
        statusShort: item.status_short,
        homeTeam: {
          id: item.home?.id ?? item.home_team_id,
          name: item.home?.name ?? 'Home'
        },
        awayTeam: {
          id: item.away?.id ?? item.away_team_id,
          name: item.away?.name ?? 'Away'
        },
        goals: {
          home: item.home_goals,
          away: item.away_goals
        }
      }));

      return NextResponse.json({ source: 'cache', fixtures });
    }

    const apiFixtures = await getFixturesByDate(date);
    const fixtures = apiFixtures.map(normalizeFixture);

    return NextResponse.json({ source: 'api', fixtures });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch fixtures',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
