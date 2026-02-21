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
    label: 'Ocean Voyager', value: 'ocean-voyager', id: 1,
    engines: ['ME PORT', 'ME STBD', 'ME CENTER'],
    position: { lat: 1.29, long: 103.85, direction: 45, timestamp: minutesAgo(2) },
  },
  {
    label: 'Sea Explorer', value: 'sea-explorer', id: 2,
    engines: ['ME PORT', 'ME STBD'],
    position: { lat: 1.35, long: 104.00, direction: 120, timestamp: minutesAgo(15) },
  },
  {
    label: 'Wave Rider', value: 'wave-rider', id: 3,
    engines: ['ME PORT', 'ME STBD', 'ME CENTER', 'ME AUX'],
    position: { lat: 1.10, long: 103.60, direction: 270, timestamp: minutesAgo(45) },
  },
  {
    label: 'Storm Chaser', value: 'storm-chaser', id: 4,
    engines: ['ME PORT', 'ME STBD', 'ME CENTER'],
    position: { lat: 1.50, long: 104.20, direction: 0, timestamp: minutesAgo(3) },
  },
  {
    label: 'Blue Horizon', value: 'blue-horizon', id: 5,
    engines: ['ME PORT', 'ME STBD'],
    position: { lat: 1.00, long: 103.50, direction: 180, timestamp: minutesAgo(200) },
  },
  {
    label: 'Coral Navigator', value: 'coral-navigator', id: 6,
    engines: ['ME PORT', 'ME STBD', 'ME CENTER'],
    position: { lat: 1.70, long: 103.85, direction: 310, timestamp: minutesAgo(90) },
  },
  {
    label: 'Aurora Spirit', value: 'aurora-spirit', id: 7,
    engines: ['ME PORT', 'ME STBD', 'ME CENTER', 'ME AUX'],
    position: { lat: 1.25, long: 103.20, direction: 135, timestamp: minutesAgo(1) },
  },
  {
    label: 'Tide Breaker', value: 'tide-breaker', id: 8,
    engines: ['ME PORT', 'ME STBD'],
    position: { lat: 1.15, long: 104.05, direction: 225, timestamp: minutesAgo(60) },
  },
  {
    label: 'Harbor Guardian', value: 'harbor-guardian', id: 9,
    engines: ['ME PORT', 'ME STBD', 'ME CENTER'],
    position: { lat: 1.55, long: 103.40, direction: 60, timestamp: minutesAgo(4) },
  },
  {
    label: 'Sea Sentinel', value: 'sea-sentinel', id: 10,
    engines: ['ME PORT', 'ME STBD'],
    position: { lat: 0.80, long: 103.85, direction: 90, timestamp: minutesAgo(150) },
  },
];

export const engineData = [
  { label: 'AE1', value: 'ae1' },
  { label: 'AE2', value: 'ae2' },
  { label: 'ME Port', value: 'me-port' },
  { label: 'ME Stbd', value: 'me-stbd' },
  { label: 'ME Center', value: 'me-center' },
];