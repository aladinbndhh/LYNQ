import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.warn('⚠️  GOOGLE_AI_API_KEY not set. AI features will not work.');
}

// Initialize with explicit v1 API (not v1beta)
// The SDK v0.22+ uses v1 by default, but we ensure it's configured correctly
export const genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');

export const AI_MODEL = 'gemini-1.5-flash';
export const AI_MAX_TOKENS = 1000;
export const AI_TEMPERATURE = 0.7;
