import { useMemo } from 'react';
import { retrieveContext } from '../../lib/retrieval';
import type { FanContext } from '../context/types';
import type { Venue } from '../venue/types';
import { useFanContext } from '../context/ContextProvider';
import { useChatContext } from '../chat/ChatProvider';

export interface MapFocus {
  originGateId?: string;
  targetSectionId?: string;
  amenitySectionIds: string[];
  transportGateIds: string[];
}

const EMPTY: MapFocus = { amenitySectionIds: [], transportGateIds: [] };

/** Derive which map elements to highlight from a fan message (pure). */
export function deriveMapFocus(message: string, context: FanContext, venue: Venue): MapFocus {
  const slice = retrieveContext(message, context, venue);
  const target = slice.sections[0];

  let originGateId: string | undefined;
  if (slice.origin?.kind === 'gate') originGateId = slice.origin.gate.id;
  else if (slice.origin?.kind === 'section') originGateId = slice.origin.section.nearestGate;
  if (!originGateId && target) originGateId = target.nearestGate;

  return {
    originGateId,
    targetSectionId: target?.id,
    amenitySectionIds: slice.amenities.map((a) => a.nearSection),
    transportGateIds: slice.transport
      .map((t) => t.nearGate)
      .filter((g): g is string => Boolean(g)),
  };
}

/** Highlight state driven by the most recent fan message. */
export function useMapFocus(): MapFocus {
  const { context, venue } = useFanContext();
  const { messages } = useChatContext();
  const lastUser = useMemo(
    () => [...messages].reverse().find((m) => m.role === 'user')?.content ?? '',
    [messages],
  );
  return useMemo(
    () => (lastUser ? deriveMapFocus(lastUser, context, venue) : EMPTY),
    [lastUser, context, venue],
  );
}
