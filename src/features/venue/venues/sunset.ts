import type { Venue } from '../types';

/** Representative sample data for a second host venue — not official. */
export const sunsetVenue: Venue = {
  name: 'Sunset Coast Arena',
  city: 'Pacific City',
  note: 'Representative sample data — not official FIFA or venue information.',

  gates: [
    { id: 'A', name: 'Gate A — Coastal Plaza', side: 'north', stepFree: true, nearTransport: ['rail-coast', 'shuttle-pier'] },
    { id: 'B', name: 'Gate B — Palm Concourse', side: 'east', stepFree: true, nearTransport: ['bus-metro', 'rideshare-palm'] },
    { id: 'C', name: 'Gate C — South Access', side: 'south', stepFree: true, nearTransport: ['parking-blue', 'shuttle-pier'] },
    { id: 'D', name: 'Gate D — Marina Walk', side: 'west', stepFree: false, nearTransport: ['bike-marina'] },
  ],

  sections: [
    { id: '102', level: 'lower', side: 'north', nearestGate: 'A', walkMinutes: 3, stepFreeAccess: true, hasElevator: true },
    { id: '110', level: 'lower', side: 'east', nearestGate: 'B', walkMinutes: 5, stepFreeAccess: true, hasElevator: true },
    { id: '116', level: 'lower', side: 'south', nearestGate: 'C', walkMinutes: 6, stepFreeAccess: true, hasElevator: true },
    { id: '122', level: 'lower', side: 'west', nearestGate: 'D', walkMinutes: 7, stepFreeAccess: false, hasElevator: false },
    { id: '208', level: 'club', side: 'north', nearestGate: 'A', walkMinutes: 8, stepFreeAccess: true, hasElevator: true },
    { id: '303', level: 'upper', side: 'east', nearestGate: 'B', walkMinutes: 12, stepFreeAccess: true, hasElevator: true },
    { id: '318', level: 'upper', side: 'south', nearestGate: 'C', walkMinutes: 13, stepFreeAccess: true, hasElevator: true },
  ],

  amenities: [
    { id: 'sun-food-1', name: 'Taqueria Costa', type: 'food', tags: ['halal', 'hot-food'], nearSection: '116', level: 'lower', stepFree: true, hours: 'Gates open until full time' },
    { id: 'sun-food-2', name: 'Pier Greens Kitchen', type: 'food', tags: ['vegetarian', 'vegan'], nearSection: '110', level: 'lower', stepFree: true, hours: 'Gates open until full time' },
    { id: 'sun-water-1', name: 'Free Water Refill Point', type: 'water', tags: ['free', 'bottle-refill'], nearSection: '102', level: 'lower', stepFree: true, hours: 'All day' },
    { id: 'sun-firstaid-1', name: 'First Aid Station Coast', type: 'first-aid', tags: ['medical', 'accessible'], nearSection: '102', level: 'lower', stepFree: true, hours: 'All day' },
    { id: 'sun-family-1', name: 'Family & Baby Care Room', type: 'family', tags: ['baby-change', 'nursing'], nearSection: '116', level: 'lower', stepFree: true, hours: 'All day' },
    { id: 'sun-prayer-1', name: 'Multi-Faith Prayer Room', type: 'prayer', tags: ['quiet', 'wudu', 'accessible'], nearSection: '110', level: 'lower', stepFree: true, hours: 'All day' },
    { id: 'sun-restroom-1', name: 'Accessible Restroom', type: 'restroom', tags: ['accessible', 'changing-places'], nearSection: '116', level: 'lower', stepFree: true, hours: 'All day' },
    { id: 'sun-store-1', name: 'Official Team Store', type: 'store', tags: ['merch', 'jerseys'], nearSection: '208', level: 'club', stepFree: true, hours: 'Until 60 min after full time' },
    { id: 'sun-info-1', name: 'Fan Information Point', type: 'info', tags: ['lost-found', 'multilingual', 'accessible'], nearSection: '102', level: 'concourse', stepFree: true, hours: 'All day' },
  ],

  transport: [
    { id: 'rail-coast', mode: 'rail', name: 'Coast Line — Pier Station', description: 'Regional rail directly to the Coastal Plaza. Step-free platform to Gate A.', nearGate: 'A', accessible: true, frequency: 'Every 7 min on match day', destinations: ['Downtown', 'Airport', 'Pier District'], carbonKg: 0.4 },
    { id: 'shuttle-pier', mode: 'shuttle', name: 'Pier Express Shuttle', description: 'Free accessible shuttle looping between the stadium and pier hotels.', nearGate: 'A', accessible: true, frequency: 'Every 10 min, 3h before to 2h after', destinations: ['Pier District', 'Convention Center'], carbonKg: 0.5 },
    { id: 'bus-metro', mode: 'bus', name: 'Metro Rapid Route 14', description: 'High-capacity bus to the east transit hub. Low-floor accessible vehicles.', nearGate: 'B', accessible: true, frequency: 'Every 9 min', destinations: ['East Hub', 'University'], carbonKg: 0.6 },
    { id: 'rideshare-palm', mode: 'rideshare', name: 'Rideshare Pickup — Palm', description: 'Designated rideshare and taxi pickup zone outside Gate B.', nearGate: 'B', accessible: true, frequency: 'On demand', destinations: ['Anywhere'], carbonKg: 2.6 },
    { id: 'parking-blue', mode: 'parking', name: 'Accessible Parking — Blue Lot', description: 'Reserved accessible parking with step-free path to Gate C. Blue Badge required.', nearGate: 'C', accessible: true, frequency: 'Pre-book recommended', destinations: [], carbonKg: 3.2 },
    { id: 'bike-marina', mode: 'bike', name: 'Bike Share Hub — Marina', description: 'Docked bike share and secure cycle parking near Gate D.', nearGate: 'D', accessible: false, frequency: 'On demand', destinations: ['Marina Walk', 'Downtown'], carbonKg: 0 },
  ],
};
