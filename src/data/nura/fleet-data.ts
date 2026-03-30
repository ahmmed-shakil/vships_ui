// Dummy fleet vessel position data for the Leaflet map
// Positions from ship_positions.json — updated for demo

export interface FleetVessel {
  vessel_id: number;
  name: string;
  position: { lat: number; long: number; direction: number; timestamp: number };
  position_status: string;
  // engine status timestamps (unix seconds) — for popup indicators
  online: number;
  me1: number;
  me2: number;
  me3: number;
  ae1: number;
  ae2: number;
  /**
   * API may return engine status timestamps grouped by type, e.g.:
   * engines: { DG1: 177..., DG2: 177..., ... }
   */
  engines?: Record<string, number>;
}

// Helper: generate a unix timestamp N minutes ago from now
const minutesAgo = (m: number) => Math.floor(Date.now() / 1000) - m * 60;

/**
 * 10 dummy vessels with positions from ship_positions.json.
 * Timestamps are relative so the green/yellow/red color coding always
 * looks correct regardless of when the page is opened.
 *
 * Green  = < 5 min ago   → online, me1, me2, ae1
 * Red    = > 3 hr ago    → me3, ae2
 *
 * All position timestamps are 1–5 min ago so "last data received" shows fresh.
 */
export const fleetVesselData: FleetVessel[] = [
  {
    vessel_id: 7,
    name: 'Aurora Spirit',
    position: {
      lat: 58.5,
      long: 2.5,
      direction: 135,
      timestamp: minutesAgo(1),
    },
    position_status: 'Producing',
    online: minutesAgo(1),
    me1: minutesAgo(2),
    me2: minutesAgo(1),
    me3: minutesAgo(250),
    ae1: minutesAgo(1),
    ae2: minutesAgo(300),
  },
  {
    vessel_id: 1,
    name: 'Ocean Voyager',
    position: {
      lat: 25.5,
      long: -93.0,
      direction: 45,
      timestamp: minutesAgo(2),
    },
    position_status: 'Operation',
    online: minutesAgo(1),
    me1: minutesAgo(2),
    me2: minutesAgo(3),
    me3: minutesAgo(260),
    ae1: minutesAgo(1),
    ae2: minutesAgo(280),
  },
  {
    vessel_id: 2,
    name: 'Sea Explorer',
    position: {
      lat: 26.5,
      long: 52.5,
      direction: 120,
      timestamp: minutesAgo(3),
    },
    position_status: 'Supply Run',
    online: minutesAgo(2),
    me1: minutesAgo(3),
    me2: minutesAgo(2),
    me3: minutesAgo(270),
    ae1: minutesAgo(2),
    ae2: minutesAgo(310),
  },
  {
    vessel_id: 4,
    name: 'Storm Chaser',
    position: {
      lat: 11.0,
      long: 115.5,
      direction: 0,
      timestamp: minutesAgo(2),
    },
    position_status: 'Anchor Handling',
    online: minutesAgo(1),
    me1: minutesAgo(2),
    me2: minutesAgo(3),
    me3: minutesAgo(255),
    ae1: minutesAgo(2),
    ae2: minutesAgo(290),
  },
  {
    vessel_id: 5,
    name: 'Blue Horizon',
    position: {
      lat: 27.5,
      long: -90.5,
      direction: 180,
      timestamp: minutesAgo(4),
    },
    position_status: 'Drilling',
    online: minutesAgo(2),
    me1: minutesAgo(3),
    me2: minutesAgo(4),
    me3: minutesAgo(280),
    ae1: minutesAgo(3),
    ae2: minutesAgo(320),
  },
  {
    vessel_id: 8,
    name: 'Tide Breaker',
    position: {
      lat: 3.5,
      long: 4.5,
      direction: 225,
      timestamp: minutesAgo(1),
    },
    position_status: 'Offloading',
    online: minutesAgo(1),
    me1: minutesAgo(1),
    me2: minutesAgo(2),
    me3: minutesAgo(265),
    ae1: minutesAgo(1),
    ae2: minutesAgo(305),
  },
  {
    vessel_id: 6,
    name: 'Coral Navigator',
    position: {
      lat: 6.5,
      long: 114.5,
      direction: 310,
      timestamp: minutesAgo(3),
    },
    position_status: 'Maintenance',
    online: minutesAgo(2),
    me1: minutesAgo(3),
    me2: minutesAgo(4),
    me3: minutesAgo(275),
    ae1: minutesAgo(3),
    ae2: minutesAgo(295),
  },
  {
    vessel_id: 9,
    name: 'Harbor Guardian',
    position: {
      lat: 28.8,
      long: -88.5,
      direction: 60,
      timestamp: minutesAgo(2),
    },
    position_status: 'Standby',
    online: minutesAgo(1),
    me1: minutesAgo(2),
    me2: minutesAgo(3),
    me3: minutesAgo(290),
    ae1: minutesAgo(2),
    ae2: minutesAgo(315),
  },
  {
    vessel_id: 3,
    name: 'Wave Rider',
    position: {
      lat: -24.5,
      long: -42.5,
      direction: 270,
      timestamp: minutesAgo(5),
    },
    position_status: 'Seismic Survey',
    online: minutesAgo(3),
    me1: minutesAgo(4),
    me2: minutesAgo(3),
    me3: minutesAgo(260),
    ae1: minutesAgo(4),
    ae2: minutesAgo(285),
  },
  {
    vessel_id: 10,
    name: 'Sea Sentinel',
    position: {
      lat: -1.5,
      long: 9.5,
      direction: 90,
      timestamp: minutesAgo(4),
    },
    position_status: 'Emergency Ready',
    online: minutesAgo(3),
    me1: minutesAgo(4),
    me2: minutesAgo(4),
    me3: minutesAgo(300),
    ae1: minutesAgo(3),
    ae2: minutesAgo(330),
  },
];
