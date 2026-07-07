import type { Venue } from '../types';

/** Representative sample data for a third host venue — not official. */
export const altiplanoVenue: Venue = {
  name: 'Alto Sol Stadium',
  city: 'Altiplano City',
  note: 'Representative sample data — not official FIFA or venue information.',

  gates: [
    { id: 'A', name: 'Gate A — Plaza Norte', side: 'north', stepFree: true, nearTransport: ['rail-altiplano', 'shuttle-centro'] },
    { id: 'B', name: 'Gate B — Oriente', side: 'east', stepFree: true, nearTransport: ['bus-oriente', 'rideshare-oriente'] },
    { id: 'C', name: 'Gate C — Familia Sur', side: 'south', stepFree: true, nearTransport: ['parking-accesible', 'shuttle-centro'] },
    { id: 'D', name: 'Gate D — Poniente', side: 'west', stepFree: false, nearTransport: ['bike-poniente'] },
  ],

  sections: [
    { id: '104', level: 'lower', side: 'north', nearestGate: 'A', walkMinutes: 4, stepFreeAccess: true, hasElevator: true },
    { id: '109', level: 'lower', side: 'east', nearestGate: 'B', walkMinutes: 5, stepFreeAccess: true, hasElevator: true },
    { id: '115', level: 'lower', side: 'south', nearestGate: 'C', walkMinutes: 6, stepFreeAccess: true, hasElevator: true },
    { id: '121', level: 'lower', side: 'west', nearestGate: 'D', walkMinutes: 6, stepFreeAccess: false, hasElevator: false },
    { id: '206', level: 'club', side: 'south', nearestGate: 'C', walkMinutes: 9, stepFreeAccess: true, hasElevator: true },
    { id: '304', level: 'upper', side: 'north', nearestGate: 'A', walkMinutes: 13, stepFreeAccess: true, hasElevator: true },
    { id: '319', level: 'upper', side: 'west', nearestGate: 'D', walkMinutes: 14, stepFreeAccess: false, hasElevator: false },
  ],

  amenities: [
    { id: 'alt-food-1', name: 'Fonda del Estadio', type: 'food', tags: ['halal', 'hot-food'], nearSection: '115', level: 'lower', stepFree: true, hours: 'Gates open until full time' },
    { id: 'alt-food-2', name: 'Cocina Verde', type: 'food', tags: ['vegetarian', 'vegan', 'gluten-free'], nearSection: '109', level: 'lower', stepFree: true, hours: 'Gates open until full time' },
    { id: 'alt-water-1', name: 'Free Water Refill Point', type: 'water', tags: ['free', 'bottle-refill'], nearSection: '104', level: 'lower', stepFree: true, hours: 'All day' },
    { id: 'alt-firstaid-1', name: 'First Aid Station Norte', type: 'first-aid', tags: ['medical', 'accessible'], nearSection: '104', level: 'lower', stepFree: true, hours: 'All day' },
    { id: 'alt-family-1', name: 'Family & Baby Care Room', type: 'family', tags: ['baby-change', 'nursing', 'stroller'], nearSection: '115', level: 'lower', stepFree: true, hours: 'All day' },
    { id: 'alt-prayer-1', name: 'Multi-Faith Prayer Room', type: 'prayer', tags: ['quiet', 'wudu', 'accessible'], nearSection: '109', level: 'lower', stepFree: true, hours: 'All day' },
    { id: 'alt-restroom-1', name: 'Accessible Restroom', type: 'restroom', tags: ['accessible', 'changing-places'], nearSection: '115', level: 'lower', stepFree: true, hours: 'All day' },
    { id: 'alt-store-1', name: 'Official Team Store', type: 'store', tags: ['merch', 'jerseys'], nearSection: '206', level: 'club', stepFree: true, hours: 'Until 60 min after full time' },
    { id: 'alt-info-1', name: 'Fan Information Point', type: 'info', tags: ['lost-found', 'multilingual', 'accessible'], nearSection: '104', level: 'concourse', stepFree: true, hours: 'All day' },
  ],

  transport: [
    { id: 'rail-altiplano', mode: 'rail', name: 'Altiplano Line — Estadio Station', description: 'Metro rail directly to Plaza Norte. Step-free platform to Gate A.', nearGate: 'A', accessible: true, frequency: 'Every 5 min on match day', destinations: ['Centro', 'Airport', 'Zocalo'], carbonKg: 0.4 },
    { id: 'shuttle-centro', mode: 'shuttle', name: 'Centro Express Shuttle', description: 'Free accessible shuttle looping between the stadium and centro hotels.', nearGate: 'A', accessible: true, frequency: 'Every 10 min, 3h before to 2h after', destinations: ['Centro', 'Convention Center'], carbonKg: 0.5 },
    { id: 'bus-oriente', mode: 'bus', name: 'Rapido Oriente 9', description: 'High-capacity bus to the east transit hub. Low-floor accessible vehicles.', nearGate: 'B', accessible: true, frequency: 'Every 8 min', destinations: ['Oriente Hub', 'Universidad'], carbonKg: 0.6 },
    { id: 'rideshare-oriente', mode: 'rideshare', name: 'Rideshare Pickup — Oriente', description: 'Designated rideshare and taxi pickup zone outside Gate B.', nearGate: 'B', accessible: true, frequency: 'On demand', destinations: ['Anywhere'], carbonKg: 2.6 },
    { id: 'parking-accesible', mode: 'parking', name: 'Accessible Parking — Lote Sur', description: 'Reserved accessible parking with step-free path to Gate C.', nearGate: 'C', accessible: true, frequency: 'Pre-book recommended', destinations: [], carbonKg: 3.2 },
    { id: 'bike-poniente', mode: 'bike', name: 'Bike Share Hub — Poniente', description: 'Docked bike share and secure cycle parking near Gate D.', nearGate: 'D', accessible: false, frequency: 'On demand', destinations: ['Parque Poniente', 'Centro'], carbonKg: 0 },
  ],
};
