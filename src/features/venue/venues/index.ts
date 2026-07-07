import type { Venue } from '../types';
import { venue as meadowVenue } from '../venue-data';
import { sunsetVenue } from './sunset';
import { altiplanoVenue } from './altiplano';
import { mapleVenue } from './maple';

export interface VenueOption {
  id: string;
  name: string;
  city: string;
}

export const VENUES: Record<string, Venue> = {
  meadow: meadowVenue,
  sunset: sunsetVenue,
  altiplano: altiplanoVenue,
  maple: mapleVenue,
};

export const DEFAULT_VENUE_ID = 'meadow';

export const VENUE_OPTIONS: VenueOption[] = Object.entries(VENUES).map(([id, v]) => ({
  id,
  name: v.name,
  city: v.city,
}));

export function resolveVenue(id: string | undefined): Venue {
  return (id && VENUES[id]) || meadowVenue;
}
