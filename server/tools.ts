/**
 * Gemini function-calling declarations. The model chooses which tool(s) to call;
 * the server executes them via the pure `runTool` registry in src/lib/tools-core.
 */
export const FUNCTION_DECLARATIONS = [
  {
    name: 'planRoute',
    description:
      'Give step-by-step directions to a seating section, honoring the fan accessibility profile and live gate congestion.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        toSection: { type: 'string', description: 'Destination section id, e.g. "205".' },
        fromGate: { type: 'string', description: 'Optional starting gate letter, e.g. "B".' },
        accessibility: {
          type: 'string',
          enum: ['none', 'wheelchair', 'stroller', 'low-vision'],
          description: 'Override the fan accessibility profile if the user states a need.',
        },
      },
      required: ['toSection'],
    },
  },
  {
    name: 'findAmenities',
    description:
      'Find the nearest amenities: food (incl. dietary like halal/vegan/kosher/gluten-free), water, restroom, first aid, family room, prayer room, charging, ATM, store, information.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'What the fan wants, e.g. "halal food", "restroom".' },
        type: { type: 'string', description: 'Optional amenity category.' },
      },
      required: [],
    },
  },
  {
    name: 'getTransport',
    description:
      'Ways to leave the stadium (rail, bus, shuttle, rideshare, parking, bike), accessible-first.',
    parametersJsonSchema: {
      type: 'object',
      properties: { mode: { type: 'string', description: 'Optional preferred mode.' } },
      required: [],
    },
  },
  {
    name: 'getGateStatus',
    description:
      'Live per-gate congestion, queue times and kickoff countdown. Use it to steer fans toward quieter gates.',
    parametersJsonSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'setFanTicket',
    description:
      'Record the section, seat and gate read from a ticket photo so the app can route the fan. Call this when the user sends a ticket image.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        section: { type: 'string' },
        seat: { type: 'string' },
        gate: { type: 'string' },
      },
      required: [],
    },
  },
  {
    name: 'getSustainability',
    description:
      'Recommend the greenest, lowest-carbon ways to leave the stadium. Use for eco / sustainability / carbon / "greenest way" questions.',
    parametersJsonSchema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'bookAccessibilityService',
    description:
      'Book an accessibility service for the fan: wheelchair assistance, a sensory room, or an accessible meeting point.',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        service: { type: 'string', enum: ['wheelchair', 'sensory-room', 'meeting-point'] },
      },
      required: ['service'],
    },
  },
];
