import { GoogleGenAI } from '@google/genai';
import type { AppEnv } from './gemini';
import type { FanContext, LanguageCode } from '../src/features/context/types';
import type { Venue } from '../src/features/venue/types';
import type { OpsSnapshot } from '../src/features/ops/opsFeed';
import type { ChatTurn, ChatStreamEvent, ChatImage } from '../src/features/chat/types';
import { runTool } from '../src/lib/tools-core';
import { FUNCTION_DECLARATIONS } from './tools';
import { buildAgentSystemInstruction } from './prompt';

const DEFAULT_MODEL = 'gemini-2.5-flash';
const MAX_TOOL_ROUNDS = 4;

/** Shown when the model exhausts its tool rounds without a final text answer. */
const OVERFLOW_FALLBACK: Record<LanguageCode, string> = {
  en: 'I gathered what I could but ran out of time to finish — could you ask that again a little more simply?',
  es: 'Reuní lo que pude pero no alcancé a terminar. ¿Podrías preguntarlo de nuevo de forma más sencilla?',
  fr: "J'ai rassemblé ce que j'ai pu mais je n'ai pas pu terminer — pouvez-vous reformuler plus simplement ?",
  pt: 'Reuni o que consegui, mas não deu tempo de terminar. Pode perguntar de novo de um jeito mais simples?',
  ar: 'جمعت ما استطعت لكن لم أتمكن من الإنهاء — هل يمكنك طرح السؤال مرة أخرى بشكل أبسط؟',
};

interface Part {
  text?: string;
  inlineData?: { mimeType: string; data: string };
  functionCall?: { name: string; args: Record<string, unknown> };
  functionResponse?: { name: string; response: Record<string, unknown> };
}
interface Content {
  role: 'user' | 'model';
  parts: Part[];
}

export interface AgentInput {
  message: string;
  history: ChatTurn[];
  context: FanContext;
  venue: Venue;
  ops: OpsSnapshot;
  image?: ChatImage | undefined;
}

/** Minimal structural slice of the GenAI SDK used by the agent — injectable in tests. */
export interface AgentAi {
  models: {
    generateContentStream(params: {
      model: string;
      contents: Content[];
      config: Record<string, unknown>;
    }): Promise<
      AsyncIterable<{
        text?: string | undefined;
        functionCalls?: { name?: string; args?: Record<string, unknown> }[] | undefined;
      }>
    >;
  };
}

/**
 * Agentic loop: stream from Gemini with function-calling. On each function call,
 * run the pure tool, emit a structured `tool_result` (with a card) + `context`
 * patch, feed the result back, and continue until the model returns final text.
 * Honors `signal` — aborts stop the loop (and the upstream call) immediately.
 */
export async function* runAgent(
  input: AgentInput,
  env: AppEnv,
  signal?: AbortSignal,
  aiOverride?: AgentAi,
): AsyncGenerator<ChatStreamEvent> {
  const ai =
    aiOverride ?? (new GoogleGenAI({ apiKey: env.GEMINI_API_KEY as string }) as unknown as AgentAi);
  const model = env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;

  const contents: Content[] = input.history.map((t) => ({
    role: t.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: t.content }],
  }));
  const userParts: Part[] = [];
  if (input.image) userParts.push({ inlineData: { mimeType: input.image.mimeType, data: input.image.data } });
  userParts.push({ text: input.message });
  contents.push({ role: 'user', parts: userParts });

  const config: Record<string, unknown> = {
    systemInstruction: buildAgentSystemInstruction(input.context, input.venue, input.ops),
    temperature: 0.4,
    maxOutputTokens: 900,
    tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
  };
  if (signal) config.abortSignal = signal;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    if (signal?.aborted) return;
    const stream = await ai.models.generateContentStream({ model, contents, config });

    const calls: { name: string; args: Record<string, unknown> }[] = [];
    let text = '';
    for await (const chunk of stream) {
      if (signal?.aborted) return;
      const t = chunk.text;
      if (t) {
        text += t;
        yield { type: 'token', value: t };
      }
      const fnCalls = chunk.functionCalls;
      if (fnCalls) {
        for (const c of fnCalls) calls.push({ name: c.name ?? '', args: (c.args as Record<string, unknown>) ?? {} });
      }
    }

    if (calls.length === 0) return; // final answer already streamed

    contents.push({
      role: 'model',
      parts: [...(text ? [{ text }] : []), ...calls.map((c) => ({ functionCall: { name: c.name, args: c.args } }))],
    });

    const responseParts: Part[] = [];
    for (const call of calls) {
      yield { type: 'status', tool: call.name };
      const result = runTool(call.name, call.args, input.context, input.venue, input.ops);
      if (result.card) yield { type: 'tool_result', tool: call.name, card: result.card };
      if (result.contextPatch && Object.keys(result.contextPatch).length > 0) {
        yield { type: 'context', patch: result.contextPatch };
      }
      responseParts.push({
        functionResponse: { name: call.name, response: { summary: result.summary, data: result.data ?? null } },
      });
    }
    contents.push({ role: 'user', parts: responseParts });
  }

  // Tool rounds exhausted with no final text — close out gracefully instead of
  // ending silently (the client would otherwise misreport this as an error).
  if (!signal?.aborted) {
    yield { type: 'token', value: OVERFLOW_FALLBACK[input.context.language] };
  }
}
