const API_BASE = process.env.API_FOOTBALL_BASE_URL;
const API_KEY = process.env.API_FOOTBALL_KEY;

interface APIFootballResponse<T> {
  response: T[];
}

async function fetchAPI<T>(endpoint: string, params: Record<string, string> = {}): Promise<T[]> {
  const searchParams = new URLSearchParams(params);
  const url = `${API_BASE}/${endpoint}?${searchParams}`;

  const res = await fetch(url, {
    headers: {
      'x-apisports-key': API_KEY ?? ''
    },
    next: { revalidate: 300 }
  });

  if (!res.ok) throw new Error(`API-Football error: ${res.status}`);

  const data: APIFootballResponse<T> = await res.json();
  return data.response;
}

export const getFixturesByDate = (date: string) => fetchAPI('fixtures', { date });
export const getLiveFixtures = () => fetchAPI('fixtures', { live: 'all' });
export const getStandings = (leagueId: number, season: number) =>
  fetchAPI('standings', { league: String(leagueId), season: String(season) });
