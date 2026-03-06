export interface Prediction {
  fixtureId: number;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  confidence: 'high' | 'medium' | 'low';
}
