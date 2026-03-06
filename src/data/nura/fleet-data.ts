// Dummy fleet vessel position data for the Leaflet map
// Positions are spread across major world oceans

export interface FleetVessel {
  vessel_id: number;
  name: string;
  position: { lat: number; long: number; direction: number; timestamp: number };
  position_status: 'at sea' | 'port';
  // engine status timestamps (unix seconds) — for popup indicators
  online: number;
  me1: number;
  me2: number;
  me3: number;
  ae1: number;
  ae2: number;
}

// Helper: generate a unix timestamp N minutes ago from now
const minutesAgo = (m: number) => Math.floor(Date.now() / 1000) - m * 60;

/**
 * 10 dummy vessels. Timestamps are relative so the green/yellow/red color
 * coding always looks correct regardless of when the page is opened.
 *
 * Green  = < 5 min ago
 * Yellow = < 3 hr ago
 * Red    = > 3 hr ago
 */
export const fleetVesselData: FleetVessel[] = [
  {
    vessel_id: 1,
    name: 'Ocean Voyager',
    position: {
      lat: 42.5,
      long: -30.0,
      direction: 45,
      timestamp: minutesAgo(2),
    },
    position_status: 'at sea',
    online: minutesAgo(1),
    me1: minutesAgo(2),
    me2: minutesAgo(3),
    me3: minutesAgo(2),
    ae1: minutesAgo(1),
    ae2: minutesAgo(3),
  },
  {
    vessel_id: 2,
    name: 'Sea Explorer',
    position: {
      lat: 36.0,
      long: 20.0,
      direction: 120,
      timestamp: minutesAgo(3),
    },
    position_status: 'at sea',
    online: minutesAgo(2),
    me1: minutesAgo(4),
    me2: minutesAgo(3),
    me3: minutesAgo(5),
    ae1: minutesAgo(2),
    ae2: minutesAgo(4),
  },
  {
    vessel_id: 3,
    name: 'Wave Rider',
    position: {
      lat: -18.0,
      long: -155.0,
      direction: 270,
      timestamp: minutesAgo(30),
    },
    position_status: 'at sea',
    online: minutesAgo(25),
    me1: minutesAgo(28),
    me2: minutesAgo(35),
    me3: minutesAgo(30),
    ae1: minutesAgo(27),
    ae2: minutesAgo(32),
  },
  {
    vessel_id: 4,
    name: 'Storm Chaser',
    position: {
      lat: 35.0,
      long: 170.0,
      direction: 0,
      timestamp: minutesAgo(90),
    },
    position_status: 'at sea',
    online: minutesAgo(80),
    me1: minutesAgo(85),
    me2: minutesAgo(100),
    me3: minutesAgo(90),
    ae1: minutesAgo(88),
    ae2: minutesAgo(95),
  },
  {
    vessel_id: 5,
    name: 'Blue Horizon',
    position: {
      lat: 18.0,
      long: -75.0,
      direction: 180,
      timestamp: minutesAgo(60),
    },
    position_status: 'port',
    online: minutesAgo(55),
    me1: minutesAgo(60),
    me2: minutesAgo(65),
    me3: minutesAgo(58),
    ae1: minutesAgo(62),
    ae2: minutesAgo(70),
  },
  {
    vessel_id: 6,
    name: 'Coral Navigator',
    position: {
      lat: 14.0,
      long: 115.0,
      direction: 310,
      timestamp: minutesAgo(250),
    },
    position_status: 'at sea',
    online: minutesAgo(240),
    me1: minutesAgo(250),
    me2: minutesAgo(260),
    me3: minutesAgo(255),
    ae1: minutesAgo(248),
    ae2: minutesAgo(265),
  },
  {
    vessel_id: 7,
    name: 'Aurora Spirit',
    position: {
      lat: 62.0,
      long: 5.0,
      direction: 135,
      timestamp: minutesAgo(400),
    },
    position_status: 'at sea',
    online: minutesAgo(390),
    me1: minutesAgo(400),
    me2: minutesAgo(420),
    me3: minutesAgo(410),
    ae1: minutesAgo(395),
    ae2: minutesAgo(430),
  },
  {
    vessel_id: 8,
    name: 'Tide Breaker',
    position: {
      lat: 15.0,
      long: 62.0,
      direction: 225,
      timestamp: minutesAgo(1),
    },
    position_status: 'port',
    online: minutesAgo(1),
    me1: minutesAgo(1),
    me2: minutesAgo(2),
    me3: minutesAgo(1),
    ae1: minutesAgo(1),
    ae2: minutesAgo(2),
  },
  {
    vessel_id: 9,
    name: 'Harbor Guardian',
    position: {
      lat: -8.0,
      long: -120.0,
      direction: 60,
      timestamp: minutesAgo(150),
    },
    position_status: 'at sea',
    online: minutesAgo(140),
    me1: minutesAgo(148),
    me2: minutesAgo(155),
    me3: minutesAgo(150),
    ae1: minutesAgo(142),
    ae2: minutesAgo(160),
  },
  {
    vessel_id: 10,
    name: 'Sea Sentinel',
    position: {
      lat: -30.0,
      long: -15.0,
      direction: 90,
      timestamp: minutesAgo(4),
    },
    position_status: 'at sea',
    online: minutesAgo(3),
    me1: minutesAgo(4),
    me2: minutesAgo(4),
    me3: minutesAgo(5),
    ae1: minutesAgo(3),
    ae2: minutesAgo(4),
  },
];
