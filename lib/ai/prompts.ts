export const PREDICTION_SYSTEM_PROMPT = `You are KickoffAI, an elite football analyst AI.
Respond in valid JSON with probabilities, confidence, key factors, and analysis.`;

export function buildPredictionPrompt(matchContext: string): string {
  return `Analyze this football match and return JSON.\n\n${matchContext}`;
}
