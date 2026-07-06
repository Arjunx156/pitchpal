import { z } from 'zod';

/**
 * Structured "action cards" the assistant can attach to a reply. The model is
 * asked to emit these as a fenced ```card JSON block; {@link parseAnswerCard}
 * extracts and *validates* it, so malformed or injected content can never reach
 * the UI as a card — it simply falls back to plain text.
 */

const routeCardSchema = z.object({
  type: z.literal('route'),
  title: z.string().min(1).max(120),
  fromLabel: z.string().max(80).optional(),
  toLabel: z.string().max(80).optional(),
  etaMinutes: z.number().int().nonnegative().max(240).optional(),
  stepFree: z.boolean().optional(),
  steps: z.array(z.string().min(1).max(200)).min(1).max(10),
});

const amenityCardSchema = z.object({
  type: z.literal('amenity'),
  title: z.string().min(1).max(120),
  items: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        detail: z.string().max(200).optional(),
        stepFree: z.boolean().optional(),
        hours: z.string().max(80).optional(),
      }),
    )
    .min(1)
    .max(6),
});

const transportCardSchema = z.object({
  type: z.literal('transport'),
  title: z.string().min(1).max(120),
  options: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        detail: z.string().max(240).optional(),
        accessible: z.boolean().optional(),
        frequency: z.string().max(80).optional(),
      }),
    )
    .min(1)
    .max(6),
});

export const answerCardSchema = z.discriminatedUnion('type', [
  routeCardSchema,
  amenityCardSchema,
  transportCardSchema,
]);

export type AnswerCard = z.infer<typeof answerCardSchema>;
export type RouteCard = z.infer<typeof routeCardSchema>;
export type AmenityCard = z.infer<typeof amenityCardSchema>;
export type TransportCard = z.infer<typeof transportCardSchema>;

const FENCE_RE = /```(?:card|json)\s*\n?([\s\S]*?)```/i;

export interface ParsedAnswer {
  /** The prose reply with any card block stripped out. */
  text: string;
  /** The validated card, if one was present and well-formed. */
  card?: AnswerCard;
}

/**
 * Split an assistant message into prose + an optional validated card. Never
 * throws: on any parse or validation failure it returns the original text with
 * no card.
 */
export function parseAnswerCard(raw: string): ParsedAnswer {
  const match = raw.match(FENCE_RE);
  if (!match || !match[1]) return { text: raw.trim() };

  const text = raw.replace(FENCE_RE, '').trim();

  try {
    const json: unknown = JSON.parse(match[1].trim());
    const result = answerCardSchema.safeParse(json);
    if (!result.success) return { text };
    return { text, card: result.data };
  } catch {
    return { text };
  }
}
