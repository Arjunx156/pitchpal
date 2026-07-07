import { describe, it, expect } from 'vitest';
import {
  buildMapGeometry,
  pointOnEllipse,
  routePath,
  VIEW,
} from '../../src/features/map/geometry';
import { venue } from '../../src/features/venue/venue-data';

describe('pointOnEllipse', () => {
  it('places angle 0 at the east edge', () => {
    const p = pointOnEllipse(100, 100, 50, 30, 0);
    expect(p.x).toBeCloseTo(150);
    expect(p.y).toBeCloseTo(100);
  });
  it('places angle 270 above the center', () => {
    const p = pointOnEllipse(100, 100, 50, 30, 270);
    expect(p.y).toBeLessThan(100);
  });
});

describe('buildMapGeometry', () => {
  const geo = buildMapGeometry(venue);

  it('places every gate and section', () => {
    expect(geo.gates).toHaveLength(venue.gates.length);
    expect(geo.sections).toHaveLength(venue.sections.length);
  });

  it('keeps all points within the viewBox', () => {
    for (const el of [...geo.gates, ...geo.sections]) {
      expect(el.point.x).toBeGreaterThanOrEqual(0);
      expect(el.point.x).toBeLessThanOrEqual(VIEW.width);
      expect(el.point.y).toBeGreaterThanOrEqual(0);
      expect(el.point.y).toBeLessThanOrEqual(VIEW.height);
    }
  });

  it('positions north sections above center and south sections below', () => {
    const north = geo.sections.find((s) => s.id === '101');
    const south = geo.sections.find((s) => s.id === '114');
    expect(north!.point.y).toBeLessThan(geo.center.y);
    expect(south!.point.y).toBeGreaterThan(geo.center.y);
  });
});

describe('routePath', () => {
  const geo = buildMapGeometry(venue);

  it('starts at the gate and ends at the section', () => {
    const path = routePath(geo, 'C', '205');
    const gate = geo.gates.find((g) => g.id === 'C')!;
    const section = geo.sections.find((s) => s.id === '205')!;
    expect(path.length).toBeGreaterThanOrEqual(3);
    expect(path[0]).toEqual(gate.point);
    expect(path[path.length - 1]).toEqual(section.point);
  });

  it('returns an empty path for unknown ids', () => {
    expect(routePath(geo, 'Z', '205')).toEqual([]);
    expect(routePath(geo, 'C', '999')).toEqual([]);
  });
});
