// Ship / vessel data with per-vessel engine lists and positions

export interface ShipPosition {
  lat: number;
  long: number;
  direction: number;
  /** Unix timestamp in seconds */
  timestamp: number;
}

export interface Ship {
  label: string;
  value: string;
  id: number;
  /** Main engine IDs this vessel has */
  engines: string[];
  /** Current vessel position */
  position: ShipPosition;
}

const minutesAgo = (m: number) => Math.floor(Date.now() / 1000) - m * 60;

export const shipData: Ship[] = [
  {
    label: 'Ocean Voyager',
    value: 'ocean-voyager',
    id: 1,
    engines: ['ME PORT', 'ME STBD', 'ME CENTER'],
    position: {
      lat: 1.29,
      long: 103.85,
      direction: 45,
      timestamp: minutesAgo(2),
    },
  },
  {
    label: 'Sea Explorer',
    value: 'sea-explorer',
    id: 2,
    engines: ['ME PORT', 'ME STBD'],
    position: {
      lat: 1.35,
      long: 104.0,
      direction: 120,
      timestamp: minutesAgo(15),
    },
  },
  {
    label: 'Wave Rider',
    value: 'wave-rider',
    id: 3,
    engines: ['ME PORT', 'ME STBD', 'ME CENTER', 'AUX 1'],
    position: {
      lat: 1.1,
      long: 103.6,
      direction: 270,
      timestamp: minutesAgo(45),
    },
  },
  {
    label: 'Storm Chaser',
    value: 'storm-chaser',
    id: 4,
    engines: ['ME PORT', 'ME STBD', 'ME CENTER'],
    position: { lat: 1.5, long: 104.2, direction: 0, timestamp: minutesAgo(3) },
  },
  {
    label: 'Blue Horizon',
    value: 'blue-horizon',
    id: 5,
    engines: ['ME PORT', 'ME STBD'],
    position: {
      lat: 1.0,
      long: 103.5,
      direction: 180,
      timestamp: minutesAgo(200),
    },
  },
  {
    label: 'Coral Navigator',
    value: 'coral-navigator',
    id: 6,
    engines: ['ME PORT', 'ME STBD', 'ME CENTER'],
    position: {
      lat: 1.7,
      long: 103.85,
      direction: 310,
      timestamp: minutesAgo(90),
    },
  },
  {
    label: 'Aurora Spirit',
    value: 'aurora-spirit',
    id: 7,
    engines: ['ME PORT', 'ME STBD', 'ME CENTER', 'AUX 1'],
    position: {
      lat: 1.25,
      long: 103.2,
      direction: 135,
      timestamp: minutesAgo(1),
    },
  },
  {
    label: 'Tide Breaker',
    value: 'tide-breaker',
    id: 8,
    engines: ['ME PORT', 'ME STBD'],
    position: {
      lat: 1.15,
      long: 104.05,
      direction: 225,
      timestamp: minutesAgo(60),
    },
  },
  {
    label: 'Harbor Guardian',
    value: 'harbor-guardian',
    id: 9,
    engines: ['ME PORT', 'ME STBD', 'ME CENTER'],
    position: {
      lat: 1.55,
      long: 103.4,
      direction: 60,
      timestamp: minutesAgo(4),
    },
  },
  {
    label: 'Sea Sentinel',
    value: 'sea-sentinel',
    id: 10,
    engines: ['ME PORT', 'ME STBD'],
    position: {
      lat: 0.8,
      long: 103.85,
      direction: 90,
      timestamp: minutesAgo(150),
    },
  },
];

export const engineData = [
  { label: 'All Engine', value: 'all' },
  { label: 'ME Port', value: 'me1' },
  { label: 'ME Stbd', value: 'me2' },
  { label: 'ME Center', value: 'me3' },
  { label: 'AE1', value: 'ae1' },
  { label: 'AE2', value: 'ae2' },
  { label: 'Crane', value: 'crane' },
  { label: 'Winch', value: 'winch' },
];
