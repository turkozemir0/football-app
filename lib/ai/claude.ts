import Anthropic from '@anthropic-ai/sdk';
import { buildPredictionPrompt, PREDICTION_SYSTEM_PROMPT } from '@/lib/ai/prompts';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generatePrediction(matchContext: string) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: PREDICTION_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildPredictionPrompt(matchContext) }]
  });

  const text = response.content[0]?.type === 'text' ? response.content[0].text : '{}';
  return JSON.parse(text);
}
