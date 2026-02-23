/**
 * Demo alarm data for the alarm monitoring page.
 * Based on alarm types from the old perfomax-maintenance-ui project.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AlarmEntry {
  id: string;
  /** Unix timestamp in milliseconds */
  timestamp: number;
  alarm_text: string;
  engine: string;
  value: number | null;
  threshold_min: number | null;
  threshold_max: number | null;
  severity: 1 | 2; // 1 = High, 2 = Normal
  status: 'active' | 'resolved';
}

// ─── Unit mapping ────────────────────────────────────────────────────────────

const unitMapping: Record<string, string> = {
  'High coolant temperature': '°C',
  'Low coolant temperature': '°C',
  'Low lube oil pressure': 'kPa',
  'High lube oil pressure': 'kPa',
  'High lube oil temperature': '°C',
  'Low fuel pressure': 'kPa',
  'High fuel pressure': 'kPa',
  'High boost air pressure': 'kPa',
  'Low boost air pressure': 'kPa',
  'High intake air temperature': '°C',
  'Low battery voltage': 'V',
  'High battery voltage': 'V',
  'Engine overspeed': 'RPM',
};

export function getAlarmUnit(alarmText: string): string {
  return unitMapping[alarmText] || '–';
}

export function getSeverityLabel(severity: number): string {
  return severity === 1 ? 'High' : 'Normal';
}

// ─── Helper ──────────────────────────────────────────────────────────────────

const minsAgo = (m: number) => Date.now() - m * 60_000;

// ─── Per-vessel alarm data ───────────────────────────────────────────────────

export const vesselAlarmData: Record<number, AlarmEntry[]> = {
  // Ocean Voyager
  1: [
    { id: 'a1-01', timestamp: minsAgo(3),   alarm_text: 'High coolant temperature',    engine: 'ME PORT',   value: 98,   threshold_min: null, threshold_max: 95,   severity: 1, status: 'active' },
    { id: 'a1-02', timestamp: minsAgo(8),   alarm_text: 'Low lube oil pressure',       engine: 'ME STBD',   value: 180,  threshold_min: 200,  threshold_max: null, severity: 1, status: 'active' },
    { id: 'a1-03', timestamp: minsAgo(15),  alarm_text: 'High lube oil temperature',   engine: 'ME PORT',   value: 112,  threshold_min: null, threshold_max: 110,  severity: 2, status: 'resolved' },
    { id: 'a1-04', timestamp: minsAgo(22),  alarm_text: 'Low fuel pressure',           engine: 'ME CENTER', value: 140,  threshold_min: 150,  threshold_max: null, severity: 1, status: 'active' },
    { id: 'a1-05', timestamp: minsAgo(35),  alarm_text: 'High boost air pressure',     engine: 'ME PORT',   value: 320,  threshold_min: null, threshold_max: 300,  severity: 2, status: 'resolved' },
    { id: 'a1-06', timestamp: minsAgo(42),  alarm_text: 'Low battery voltage',         engine: 'AE1',       value: 23.2, threshold_min: 24,   threshold_max: null, severity: 1, status: 'active' },
    { id: 'a1-07', timestamp: minsAgo(50),  alarm_text: 'Engine overspeed',            engine: 'ME STBD',   value: 2450, threshold_min: null, threshold_max: 2400, severity: 1, status: 'resolved' },
    { id: 'a1-08', timestamp: minsAgo(61),  alarm_text: 'High intake air temperature', engine: 'ME PORT',   value: 58,   threshold_min: null, threshold_max: 55,   severity: 2, status: 'active' },
    { id: 'a1-09', timestamp: minsAgo(70),  alarm_text: 'High coolant temperature',    engine: 'ME CENTER', value: 97,   threshold_min: null, threshold_max: 95,   severity: 1, status: 'resolved' },
    { id: 'a1-10', timestamp: minsAgo(85),  alarm_text: 'Low lube oil pressure',       engine: 'ME PORT',   value: 190,  threshold_min: 200,  threshold_max: null, severity: 1, status: 'active' },
    { id: 'a1-11', timestamp: minsAgo(100), alarm_text: 'High fuel pressure',          engine: 'AE2',       value: 520,  threshold_min: null, threshold_max: 500,  severity: 2, status: 'resolved' },
    { id: 'a1-12', timestamp: minsAgo(115), alarm_text: 'Low boost air pressure',      engine: 'ME STBD',   value: 85,   threshold_min: 100,  threshold_max: null, severity: 2, status: 'active' },
    { id: 'a1-13', timestamp: minsAgo(130), alarm_text: 'High battery voltage',        engine: 'AE1',       value: 30.5, threshold_min: null, threshold_max: 29,   severity: 1, status: 'resolved' },
    { id: 'a1-14', timestamp: minsAgo(145), alarm_text: 'High lube oil temperature',   engine: 'ME CENTER', value: 115,  threshold_min: null, threshold_max: 110,  severity: 1, status: 'active' },
    { id: 'a1-15', timestamp: minsAgo(160), alarm_text: 'Low fuel pressure',           engine: 'ME PORT',   value: 145,  threshold_min: 150,  threshold_max: null, severity: 2, status: 'resolved' },
  ],

  // Sea Explorer
  2: [
    { id: 'a2-01', timestamp: minsAgo(5),   alarm_text: 'High coolant temperature',  engine: 'ME PORT', value: 99,   threshold_min: null, threshold_max: 95,   severity: 1, status: 'active' },
    { id: 'a2-02', timestamp: minsAgo(18),  alarm_text: 'Low lube oil pressure',     engine: 'ME STBD', value: 185,  threshold_min: 200,  threshold_max: null, severity: 1, status: 'active' },
    { id: 'a2-03', timestamp: minsAgo(30),  alarm_text: 'Engine overspeed',          engine: 'ME PORT', value: 2480, threshold_min: null, threshold_max: 2400, severity: 1, status: 'resolved' },
    { id: 'a2-04', timestamp: minsAgo(55),  alarm_text: 'High lube oil temperature', engine: 'ME STBD', value: 113,  threshold_min: null, threshold_max: 110,  severity: 2, status: 'active' },
    { id: 'a2-05', timestamp: minsAgo(80),  alarm_text: 'Low battery voltage',       engine: 'ME PORT', value: 22.8, threshold_min: 24,   threshold_max: null, severity: 1, status: 'resolved' },
    { id: 'a2-06', timestamp: minsAgo(120), alarm_text: 'High boost air pressure',   engine: 'ME STBD', value: 315,  threshold_min: null, threshold_max: 300,  severity: 2, status: 'resolved' },
  ],

  // Wave Rider
  3: [
    { id: 'a3-01', timestamp: minsAgo(2),  alarm_text: 'Low fuel pressure',           engine: 'ME PORT',   value: 135, threshold_min: 150, threshold_max: null, severity: 1, status: 'active' },
    { id: 'a3-02', timestamp: minsAgo(12), alarm_text: 'High coolant temperature',    engine: 'ME CENTER', value: 97,  threshold_min: null, threshold_max: 95,  severity: 1, status: 'active' },
    { id: 'a3-03', timestamp: minsAgo(28), alarm_text: 'High intake air temperature', engine: 'ME STBD',   value: 60,  threshold_min: null, threshold_max: 55,  severity: 2, status: 'resolved' },
    { id: 'a3-04', timestamp: minsAgo(40), alarm_text: 'Low lube oil pressure',       engine: 'ME AUX',    value: 175, threshold_min: 200, threshold_max: null, severity: 1, status: 'active' },
    { id: 'a3-05', timestamp: minsAgo(65), alarm_text: 'Engine overspeed',            engine: 'ME PORT',   value: 2500, threshold_min: null, threshold_max: 2400, severity: 1, status: 'resolved' },
  ],

  // Storm Chaser
  4: [
    { id: 'a4-01', timestamp: minsAgo(7),  alarm_text: 'High lube oil temperature', engine: 'ME PORT',   value: 118,  threshold_min: null, threshold_max: 110,  severity: 1, status: 'active' },
    { id: 'a4-02', timestamp: minsAgo(25), alarm_text: 'Low battery voltage',       engine: 'ME CENTER', value: 23.0, threshold_min: 24,   threshold_max: null, severity: 1, status: 'active' },
    { id: 'a4-03', timestamp: minsAgo(45), alarm_text: 'High coolant temperature',  engine: 'ME STBD',   value: 96,   threshold_min: null, threshold_max: 95,   severity: 2, status: 'resolved' },
    { id: 'a4-04', timestamp: minsAgo(90), alarm_text: 'Low fuel pressure',         engine: 'ME PORT',   value: 142,  threshold_min: 150,  threshold_max: null, severity: 2, status: 'active' },
  ],

  // Blue Horizon
  5: [
    { id: 'a5-01', timestamp: minsAgo(10), alarm_text: 'Engine overspeed',         engine: 'ME PORT', value: 2420, threshold_min: null, threshold_max: 2400, severity: 1, status: 'active' },
    { id: 'a5-02', timestamp: minsAgo(35), alarm_text: 'Low lube oil pressure',    engine: 'ME STBD', value: 192,  threshold_min: 200,  threshold_max: null, severity: 1, status: 'resolved' },
    { id: 'a5-03', timestamp: minsAgo(70), alarm_text: 'High coolant temperature', engine: 'ME PORT', value: 100,  threshold_min: null, threshold_max: 95,   severity: 1, status: 'active' },
  ],

  // Coral Navigator
  6: [
    { id: 'a6-01', timestamp: minsAgo(4),  alarm_text: 'High boost air pressure',   engine: 'ME PORT',   value: 310,  threshold_min: null, threshold_max: 300, severity: 2, status: 'active' },
    { id: 'a6-02', timestamp: minsAgo(20), alarm_text: 'Low fuel pressure',         engine: 'ME STBD',   value: 138,  threshold_min: 150,  threshold_max: null, severity: 1, status: 'active' },
    { id: 'a6-03', timestamp: minsAgo(50), alarm_text: 'High coolant temperature',  engine: 'ME CENTER', value: 96,   threshold_min: null, threshold_max: 95,  severity: 1, status: 'resolved' },
    { id: 'a6-04', timestamp: minsAgo(80), alarm_text: 'High lube oil temperature', engine: 'ME PORT',   value: 112,  threshold_min: null, threshold_max: 110, severity: 2, status: 'active' },
  ],

  // Aurora Spirit
  7: [
    { id: 'a7-01', timestamp: minsAgo(1),   alarm_text: 'Low battery voltage',         engine: 'ME AUX',    value: 22.5, threshold_min: 24,  threshold_max: null, severity: 1, status: 'active' },
    { id: 'a7-02', timestamp: minsAgo(15),  alarm_text: 'High coolant temperature',    engine: 'ME PORT',   value: 101,  threshold_min: null, threshold_max: 95,  severity: 1, status: 'active' },
    { id: 'a7-03', timestamp: minsAgo(30),  alarm_text: 'Low lube oil pressure',       engine: 'ME CENTER', value: 188,  threshold_min: 200, threshold_max: null, severity: 1, status: 'active' },
    { id: 'a7-04', timestamp: minsAgo(55),  alarm_text: 'High intake air temperature', engine: 'ME STBD',   value: 57,   threshold_min: null, threshold_max: 55,  severity: 2, status: 'resolved' },
    { id: 'a7-05', timestamp: minsAgo(75),  alarm_text: 'Engine overspeed',            engine: 'ME PORT',   value: 2460, threshold_min: null, threshold_max: 2400, severity: 1, status: 'resolved' },
    { id: 'a7-06', timestamp: minsAgo(100), alarm_text: 'High fuel pressure',          engine: 'ME AUX',    value: 515,  threshold_min: null, threshold_max: 500, severity: 2, status: 'active' },
  ],

  // Tide Breaker
  8: [
    { id: 'a8-01', timestamp: minsAgo(6),  alarm_text: 'High coolant temperature', engine: 'ME PORT', value: 97,   threshold_min: null, threshold_max: 95,   severity: 1, status: 'active' },
    { id: 'a8-02', timestamp: minsAgo(40), alarm_text: 'Low fuel pressure',        engine: 'ME STBD', value: 148,  threshold_min: 150,  threshold_max: null, severity: 2, status: 'resolved' },
  ],

  // Harbor Guardian
  9: [
    { id: 'a9-01', timestamp: minsAgo(9),   alarm_text: 'High lube oil temperature', engine: 'ME PORT',   value: 114,  threshold_min: null, threshold_max: 110, severity: 1, status: 'active' },
    { id: 'a9-02', timestamp: minsAgo(33),  alarm_text: 'Low lube oil pressure',     engine: 'ME CENTER', value: 195,  threshold_min: 200, threshold_max: null, severity: 1, status: 'active' },
    { id: 'a9-03', timestamp: minsAgo(60),  alarm_text: 'Engine overspeed',          engine: 'ME STBD',   value: 2430, threshold_min: null, threshold_max: 2400, severity: 1, status: 'resolved' },
    { id: 'a9-04', timestamp: minsAgo(100), alarm_text: 'High boost air pressure',   engine: 'ME PORT',   value: 318,  threshold_min: null, threshold_max: 300, severity: 2, status: 'active' },
    { id: 'a9-05', timestamp: minsAgo(140), alarm_text: 'Low battery voltage',       engine: 'ME CENTER', value: 23.1, threshold_min: 24,  threshold_max: null, severity: 1, status: 'resolved' },
  ],

  // Sea Sentinel
  10: [
    { id: 'a10-01', timestamp: minsAgo(11), alarm_text: 'High coolant temperature', engine: 'ME PORT', value: 98,  threshold_min: null, threshold_max: 95, severity: 1, status: 'active' },
    { id: 'a10-02', timestamp: minsAgo(45), alarm_text: 'Low fuel pressure',        engine: 'ME STBD', value: 143, threshold_min: 150, threshold_max: null, severity: 2, status: 'resolved' },
    { id: 'a10-03', timestamp: minsAgo(90), alarm_text: 'High lube oil temperature', engine: 'ME PORT', value: 111, threshold_min: null, threshold_max: 110, severity: 2, status: 'active' },
  ],
};
