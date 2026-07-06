import type { ChatStreamEvent } from '../../src/features/chat/types';

/** Build a fake streaming /api/chat Response from a list of SSE events. */
export function mockChatResponse(
  events: ChatStreamEvent[],
  mode: 'mock' | 'live' = 'mock',
  status = 200,
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    status,
    headers: { 'Content-Type': 'text/event-stream', 'X-Pitchpal-Mode': mode },
  });
}

/** Serialize a card into the fenced block the client parses. */
export function cardBlock(card: unknown): string {
  return `\n\n\`\`\`card\n${JSON.stringify(card)}\n\`\`\``;
}
