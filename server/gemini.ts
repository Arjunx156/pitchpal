import { GoogleGenAI } from '@google/genai';
import type { BuiltPrompt } from './prompt';
import type { ComposedAnswer } from '../src/lib/compose';

export type GenerationMode = 'live' | 'mock';

export interface AppEnv {
  GEMINI_API_KEY?: string | undefined;
  GEMINI_MODEL?: string | undefined;
}

const DEFAULT_MODEL = 'gemini-2.5-flash';

/** Live when a non-empty API key is present, otherwise the offline mock. */
export function resolveMode(env: AppEnv): GenerationMode {
  return env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0 ? 'live' : 'mock';
}

/** Stream tokens from Gemini. Errors bubble up to the handler's error event. */
export async function* streamLive(prompt: BuiltPrompt, env: AppEnv): AsyncGenerator<string> {
  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY as string });
  const model = env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;

  const response = await ai.models.generateContentStream({
    model,
    contents: prompt.contents,
    config: {
      systemInstruction: prompt.systemInstruction,
      temperature: 0.4,
      maxOutputTokens: 800,
    },
  });

  for await (const chunk of response) {
    const text = chunk.text;
    if (text) yield text;
  }
}

/**
 * Stream a deterministic, grounded answer without any network. The card (if
 * any) is appended as a fenced block so the client parses it exactly as it
 * would a live reply. Tokenised word-by-word to mimic streaming.
 */
export async function* streamMock(
  answer: ComposedAnswer,
  delayMs = 0,
): AsyncGenerator<string> {
  const full = answer.card
    ? `${answer.text}\n\n\`\`\`card\n${JSON.stringify(answer.card)}\n\`\`\``
    : answer.text;

  const tokens = full.match(/\S+\s*|\s+/g) ?? [full];
  for (const token of tokens) {
    yield token;
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
  }
}
