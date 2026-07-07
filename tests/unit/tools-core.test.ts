import { describe, it, expect } from 'vitest';
import {
  planRoute,
  findAmenities,
  getTransport,
  getGateStatus,
  setFanTicket,
  runTool,
  answerOffline,
} from '../../src/lib/tools-core';
import { getOpsSnapshot } from '../../src/features/ops/opsFeed';
import { venue } from '../../src/features/venue/venue-data';
import { DEFAULT_CONTEXT, type FanContext } from '../../src/features/context/types';

const ctx = (over: Partial<FanContext> = {}): FanContext => ({ ...DEFAULT_CONTEXT, ...over });
const ops = getOpsSnapshot(venue, 20 * 60_000);

describe('tool-core implementations', () => {
  it('planRoute returns a route card to the requested section', () => {
    const r = planRoute({ toSection: '205', accessibility: 'wheelchair' }, ctx(), venue, ops);
    expect(r.card?.type).toBe('route');
    expect(r.summary.length).toBeGreaterThan(0);
  });

  it('findAmenities returns an amenity card filtered by query', () => {
    const r = findAmenities({ query: 'halal food' }, ctx(), venue, ops);
    expect(r.card?.type).toBe('amenity');
  });

  it('getTransport returns a transport card', () => {
    const r = getTransport({ mode: 'train' }, ctx(), venue, ops);
    expect(r.card?.type).toBe('transport');
  });

  it('getGateStatus summarizes every gate with no card', () => {
    const r = getGateStatus({}, ctx(), venue, ops);
    expect(r.card).toBeUndefined();
    expect(r.summary).toContain('Gate A');
    expect(r.data?.gates).toBeDefined();
  });

  it('setFanTicket produces a context patch from a scanned ticket', () => {
    const r = setFanTicket({ section: '114', seat: '12', gate: 'C' }, ctx(), venue, ops);
    expect(r.contextPatch?.location).toBe('Section 114');
    expect(r.summary).toContain('114');
  });

  it('runTool dispatches by name and handles unknown tools', () => {
    expect(runTool('planRoute', { toSection: '101' }, ctx(), venue, ops).card?.type).toBe('route');
    expect(runTool('nope', {}, ctx(), venue, ops).summary).toContain('Unknown tool');
  });
});

describe('answerOffline', () => {
  it('maps navigation to planRoute with a route card', () => {
    const { toolName, result } = answerOffline('How do I get to section 205?', ctx(), venue, ops);
    expect(toolName).toBe('planRoute');
    expect(result.card?.type).toBe('route');
  });

  it('maps small talk to getGateStatus', () => {
    const { toolName } = answerOffline('hello there', ctx(), venue, ops);
    expect(toolName).toBe('getGateStatus');
  });
});
