/** Representative sample group standings (not official). */
export interface StandingRow {
  code: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
}

export const GROUP_STANDINGS: Record<string, StandingRow[]> = {
  'Group C': [
    { code: 'BRA', name: 'Brazil', played: 2, won: 2, drawn: 0, lost: 0, points: 6 },
    { code: 'ARG', name: 'Argentina', played: 2, won: 1, drawn: 1, lost: 0, points: 4 },
    { code: 'CMR', name: 'Cameroon', played: 2, won: 1, drawn: 0, lost: 1, points: 3 },
    { code: 'KOR', name: 'South Korea', played: 2, won: 0, drawn: 1, lost: 1, points: 1 },
  ],
  'Group A': [
    { code: 'MEX', name: 'Mexico', played: 2, won: 2, drawn: 0, lost: 0, points: 6 },
    { code: 'USA', name: 'United States', played: 2, won: 1, drawn: 0, lost: 1, points: 3 },
    { code: 'CAN', name: 'Canada', played: 2, won: 1, drawn: 0, lost: 1, points: 3 },
    { code: 'PAN', name: 'Panama', played: 2, won: 0, drawn: 0, lost: 2, points: 0 },
  ],
  'Group D': [
    { code: 'FRA', name: 'France', played: 2, won: 1, drawn: 1, lost: 0, points: 4 },
    { code: 'JPN', name: 'Japan', played: 2, won: 1, drawn: 1, lost: 0, points: 4 },
    { code: 'SEN', name: 'Senegal', played: 2, won: 1, drawn: 0, lost: 1, points: 3 },
    { code: 'POL', name: 'Poland', played: 2, won: 0, drawn: 0, lost: 2, points: 0 },
  ],
  'Group F': [
    { code: 'ENG', name: 'England', played: 2, won: 2, drawn: 0, lost: 0, points: 6 },
    { code: 'GHA', name: 'Ghana', played: 2, won: 1, drawn: 0, lost: 1, points: 3 },
    { code: 'ECU', name: 'Ecuador', played: 2, won: 1, drawn: 0, lost: 1, points: 3 },
    { code: 'AUS', name: 'Australia', played: 2, won: 0, drawn: 0, lost: 2, points: 0 },
  ],
};
