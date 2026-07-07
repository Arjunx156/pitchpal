import type { FanContext, AccessibilityProfile } from '../features/context/types';
import type { Venue } from '../features/venue/types';
import type { OpsSnapshot } from '../features/ops/opsFeed';
import type { AnswerCard } from './cards';
import { retrieveContext } from './retrieval';
import { composeGroundedAnswer } from './compose';
import { classifyIntent } from './intent';
import { fmt, ECO_PHRASES, ACCESS_PHRASES, type AccessServiceKey } from '../i18n/answers';

/**
 * Pure tool implementations shared by the live agent (Gemini function calls),
 * the mock server, and the offline client router. Each tool reuses the existing
 * deterministic pipeline (retrieve → compose) so behaviour is identical across
 * all three paths and fully unit-testable.
 */

export type ToolName =
  | 'planRoute'
  | 'findAmenities'
  | 'getTransport'
  | 'getGateStatus'
  | 'setFanTicket'
  | 'getSustainability'
  | 'bookAccessibilityService';

export interface ToolResult {
  summary: string;
  card?: AnswerCard;
  data?: Record<string, unknown>;
  /** Tools may update the fan context (e.g. after reading a ticket photo). */
  contextPatch?: Partial<FanContext>;
}

function answerFor(
  query: string,
  context: FanContext,
  venue: Venue,
  ops: OpsSnapshot,
): ToolResult {
  const slice = retrieveContext(query, context, venue);
  const { text, card } = composeGroundedAnswer(slice, context, venue, ops);
  return card ? { summary: text, card } : { summary: text };
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

export function planRoute(
  args: Record<string, unknown>,
  context: FanContext,
  venue: Venue,
  ops: OpsSnapshot,
): ToolResult {
  const ctx: FanContext = { ...context };
  const accessibility = asString(args.accessibility);
  if (accessibility) ctx.accessibility = accessibility as AccessibilityProfile;
  const fromGate = asString(args.fromGate);
  if (fromGate) ctx.location = `Gate ${fromGate.toUpperCase()}`;
  const toSection = asString(args.toSection) ?? '';
  return answerFor(`How do I get to section ${toSection}?`, ctx, venue, ops);
}

export function findAmenities(
  args: Record<string, unknown>,
  context: FanContext,
  venue: Venue,
  ops: OpsSnapshot,
): ToolResult {
  const what = asString(args.query) ?? asString(args.type) ?? 'food';
  return answerFor(`Where is the nearest ${what}?`, context, venue, ops);
}

export function getTransport(
  args: Record<string, unknown>,
  context: FanContext,
  venue: Venue,
  ops: OpsSnapshot,
): ToolResult {
  const mode = asString(args.mode);
  const q = mode ? `How do I leave the stadium by ${mode}?` : 'How do I get downtown after the match?';
  return answerFor(q, context, venue, ops);
}

export function getGateStatus(
  _args: Record<string, unknown>,
  _context: FanContext,
  _venue: Venue,
  ops: OpsSnapshot,
): ToolResult {
  const lines = ops.gates.map(
    (g) => `Gate ${g.gateId}: ${g.level} (~${g.queueMinutes} min, ${Math.round(g.occupancy * 100)}%)`,
  );
  return {
    summary: `Live gate status — ${lines.join('; ')}. Kickoff ${ops.minutesToKickoff > 0 ? `in ${ops.minutesToKickoff} min` : 'has passed'}.`,
    data: { phase: ops.phase, minutesToKickoff: ops.minutesToKickoff, gates: ops.gates },
  };
}

/** Apply seat/section/gate read from a ticket photo to the fan context. */
export function setFanTicket(
  args: Record<string, unknown>,
  _context: FanContext,
  _venue: Venue,
  _ops: OpsSnapshot,
): ToolResult {
  const section = asString(args.section);
  const seat = asString(args.seat);
  const gate = asString(args.gate);
  const patch: Partial<FanContext> = {};
  if (section) patch.location = `Section ${section}`;
  else if (gate) patch.location = `Gate ${gate.toUpperCase()}`;

  const bits = [
    section ? `section ${section}` : null,
    seat ? `seat ${seat}` : null,
    gate ? `gate ${gate}` : null,
  ].filter(Boolean);

  return {
    summary: bits.length ? `Ticket read — ${bits.join(', ')}.` : 'I could not read the ticket clearly.',
    data: { section: section ?? null, seat: seat ?? null, gate: gate ?? null },
    contextPatch: patch,
  };
}

/** Rank ways to leave by carbon footprint and recommend the greenest. */
export function getSustainability(
  _args: Record<string, unknown>,
  context: FanContext,
  venue: Venue,
  _ops: OpsSnapshot,
): ToolResult {
  const p = ECO_PHRASES[context.language];
  const sorted = [...venue.transport].sort((a, b) => a.carbonKg - b.carbonKg);
  const greenest = sorted[0];
  const card: AnswerCard = {
    type: 'transport',
    title: p.title,
    options: sorted.slice(0, 5).map((t) => ({
      name: t.name,
      detail: fmt(p.carbon, { kg: t.carbonKg }),
      accessible: t.accessible,
      frequency: t.frequency,
    })),
  };
  const summary = greenest ? fmt(p.greenest, { name: greenest.name, kg: greenest.carbonKg }) : p.title;
  return { summary, card };
}

const ACCESS_SERVICES: readonly AccessServiceKey[] = ['wheelchair', 'sensory-room', 'meeting-point'];

/** Book an accessibility service and return a deterministic confirmation. */
export function bookAccessibilityService(
  args: Record<string, unknown>,
  context: FanContext,
  _venue: Venue,
  _ops: OpsSnapshot,
): ToolResult {
  const p = ACCESS_PHRASES[context.language];
  const raw = asString(args.service) ?? 'wheelchair';
  const key: AccessServiceKey = ACCESS_SERVICES.includes(raw as AccessServiceKey)
    ? (raw as AccessServiceKey)
    : 'wheelchair';
  const service = p.services[key];
  const ref = `AS-${((key.length * 137 + context.location.length * 31) % 9000) + 1000}`;
  const where = context.location ? ` (${context.location})` : '';
  return {
    summary: fmt(p.booked, { service, ref, where }),
    data: { service: key, ref },
  };
}

export const TOOL_IMPLS: Record<
  ToolName,
  (args: Record<string, unknown>, context: FanContext, venue: Venue, ops: OpsSnapshot) => ToolResult
> = {
  planRoute,
  findAmenities,
  getTransport,
  getGateStatus,
  setFanTicket,
  getSustainability,
  bookAccessibilityService,
};

export function runTool(
  name: string,
  args: Record<string, unknown>,
  context: FanContext,
  venue: Venue,
  ops: OpsSnapshot,
): ToolResult {
  const impl = TOOL_IMPLS[name as ToolName];
  if (!impl) return { summary: `Unknown tool: ${name}` };
  return impl(args, context, venue, ops);
}

export interface OfflineAnswer {
  toolName: ToolName;
  result: ToolResult;
}

/**
 * Deterministic answer for the mock server and offline client: classify the
 * message, run the matching tool, and return a structured result identical in
 * shape to the live agent's tool output.
 */
export function answerOffline(
  message: string,
  context: FanContext,
  venue: Venue,
  ops: OpsSnapshot,
): OfflineAnswer {
  const intent = classifyIntent(message);
  const slice = retrieveContext(message, context, venue);
  const { text, card } = composeGroundedAnswer(slice, context, venue, ops);
  const toolName: ToolName =
    intent === 'navigation'
      ? 'planRoute'
      : intent === 'amenity'
        ? 'findAmenities'
        : intent === 'transport'
          ? 'getTransport'
          : 'getGateStatus';
  return { toolName, result: card ? { summary: text, card } : { summary: text } };
}
