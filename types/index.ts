export interface Prediction {
  fixtureId: number;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface FixtureSummary {
  id: number;
  league: {
    id: number;
    name: string;
  };
  date: string;
  statusShort: string;
  homeTeam: {
    id: number;
    name: string;
  };
  awayTeam: {
    id: number;
    name: string;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}
