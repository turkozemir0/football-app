export interface TeamForm {
  teamId: number;
  last5: ('W' | 'D' | 'L')[];
  avgGoalsScored: number;
  avgGoalsConceded: number;
  leaguePosition: number;
  points: number;
}

const values = { W: 3, D: 1, L: 0 };
const weights = [1.0, 0.9, 0.75, 0.6, 0.45];

export function calculateFormScore(form: ('W' | 'D' | 'L')[]): number {
  return form.reduce((sum, result, i) => sum + values[result] * (weights[i] || 0.3), 0);
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

export function poissonProbability(lambda: number, k: number): number {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

export function predictScore(homeAvgGoals: number, awayAvgGoals: number, homeAdvantage = 0.25) {
  const homeExpected = homeAvgGoals + homeAdvantage;
  const awayExpected = awayAvgGoals;

  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;

  for (let h = 0; h <= 6; h++) {
    for (let a = 0; a <= 6; a++) {
      const prob = poissonProbability(homeExpected, h) * poissonProbability(awayExpected, a);
      if (h > a) homeWin += prob;
      else if (h === a) draw += prob;
      else awayWin += prob;
    }
  }

  return { homeWin, draw, awayWin };
}
