/** Domain types for the stadium knowledge base. */

export type Side = 'north' | 'south' | 'east' | 'west';
export type Level = 'lower' | 'club' | 'upper' | 'concourse';

export type AmenityType =
  | 'food'
  | 'water'
  | 'restroom'
  | 'first-aid'
  | 'family'
  | 'prayer'
  | 'store'
  | 'charging'
  | 'atm'
  | 'info';

export type TransportMode =
  | 'rail'
  | 'bus'
  | 'shuttle'
  | 'rideshare'
  | 'parking'
  | 'bike';

export interface Gate {
  id: string;
  name: string;
  side: Side;
  /** Whether the gate has a step-free (ramp/level) entrance. */
  stepFree: boolean;
  /** Transport option ids reachable near this gate. */
  nearTransport: string[];
}

export interface Section {
  id: string;
  level: Exclude<Level, 'concourse'>;
  side: Side;
  /** Gate id closest to this seating section. */
  nearestGate: string;
  /** Walking minutes from the nearest gate to the section. */
  walkMinutes: number;
  /** True when the section is reachable without stairs (ramp or elevator). */
  stepFreeAccess: boolean;
  hasElevator: boolean;
}

export interface Amenity {
  id: string;
  name: string;
  type: AmenityType;
  /** Free-form searchable tags, e.g. dietary needs. */
  tags: string[];
  /** Section id this amenity sits nearest to. */
  nearSection: string;
  level: Level;
  stepFree: boolean;
  hours: string;
}

export interface TransportOption {
  id: string;
  mode: TransportMode;
  name: string;
  description: string;
  /** Gate id this option is closest to, if any. */
  nearGate?: string;
  /** Step-free / wheelchair accessible. */
  accessible: boolean;
  frequency: string;
  destinations: string[];
  /** Rough CO₂ estimate per trip (kg) — for the sustainability tool. */
  carbonKg: number;
}

export interface Venue {
  name: string;
  city: string;
  /** Honest note that this is representative sample data. */
  note: string;
  gates: Gate[];
  sections: Section[];
  amenities: Amenity[];
  transport: TransportOption[];
}
