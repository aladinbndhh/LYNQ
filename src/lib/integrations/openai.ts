/**
 * OpenRouter AI client — OpenAI-compatible REST API.
 * Model: NVIDIA Nemotron Nano 30B A3B (free tier)
 */

export const AI_MODEL = 'meta-llama/llama-3.1-8b-instruct:free';
export const AI_MAX_TOKENS = 1000;
export const AI_TEMPERATURE = 0.7;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callOpenRouter(
  messages: ChatMessage[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set. AI features are unavailable.');
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://lynq.cards',
      'X-Title': 'LynQ AI Secretary',
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages,
      temperature: options?.temperature ?? AI_TEMPERATURE,
      max_tokens: options?.max_tokens ?? AI_MAX_TOKENS,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenRouter returned an empty response.');
  }

  return content as string;
}
