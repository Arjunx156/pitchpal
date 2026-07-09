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
