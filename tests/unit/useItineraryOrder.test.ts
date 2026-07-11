import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useItineraryOrder } from '../../src/features/itinerary/useItineraryOrder';
import { buildItinerary } from '../../src/features/itinerary/itinerary';
import { getOpsSnapshot } from '../../src/features/ops/opsFeed';
import { venue } from '../../src/features/venue/venue-data';

const MATCH_ID = 'bra-arg';

describe('useItineraryOrder', () => {
  beforeEach(() => localStorage.clear());

  it('returns the base steps in their natural order when nothing is persisted', () => {
    const ops = getOpsSnapshot(venue, Date.now());
    const base = buildItinerary(venue, ops, 'A');
    const { result } = renderHook(() => useItineraryOrder(MATCH_ID, base));
    expect(result.current.steps.map((s) => s.kind)).toEqual(base.map((s) => s.kind));
  });

  it('reorders steps and persists the new order across remounts', () => {
    const ops = getOpsSnapshot(venue, Date.now());
    const base = buildItinerary(venue, ops, 'A');
    const { result, rerender } = renderHook(({ steps }) => useItineraryOrder(MATCH_ID, steps), {
      initialProps: { steps: base },
    });

    act(() => result.current.reorder(0, 2));
    const reorderedKinds = result.current.steps.map((s) => s.kind);
    expect(reorderedKinds[2]).toBe(base[0]?.kind);

    // Re-render with a fresh hook instance for the same match — order should persist.
    rerender({ steps: base });
    const { result: second } = renderHook(() => useItineraryOrder(MATCH_ID, base));
    expect(second.current.steps.map((s) => s.kind)).toEqual(reorderedKinds);
  });

  it('drops malformed persisted entries instead of trusting them', () => {
    const ops = getOpsSnapshot(venue, Date.now());
    const base = buildItinerary(venue, ops, 'A');
    // Simulate corrupted / older-schema storage: non-string order keys and
    // custom steps missing required fields should all be discarded.
    localStorage.setItem(
      `pitchpal.itinerary.${MATCH_ID}`,
      JSON.stringify({
        order: ['seat', 42, null, 'kickoff'],
        custom: [
          { kind: 'custom', id: 'ok', label: 'Valid', time: ops.kickoffAt },
          { kind: 'custom', id: 'bad-time', label: 'No time' },
          { kind: 'custom', label: 'No id', time: ops.kickoffAt },
          'not-an-object',
        ],
      }),
    );

    const { result } = renderHook(() => useItineraryOrder(MATCH_ID, base));
    const customSteps = result.current.steps.filter((s) => s.kind === 'custom');
    expect(customSteps).toHaveLength(1);
    expect(customSteps[0]?.label).toBe('Valid');
  });

  it('adds and removes a custom step', () => {
    const ops = getOpsSnapshot(venue, Date.now());
    const base = buildItinerary(venue, ops, 'A');
    const { result } = renderHook(() => useItineraryOrder(MATCH_ID, base));

    act(() => result.current.addCustomStep('Meet friends', ops.kickoffAt - 30 * 60_000));
    const custom = result.current.steps.find((s) => s.kind === 'custom');
    expect(custom?.label).toBe('Meet friends');
    expect(custom?.id).toBeDefined();

    act(() => result.current.removeCustomStep(custom!.id!));
    expect(result.current.steps.some((s) => s.kind === 'custom')).toBe(false);
  });
});
