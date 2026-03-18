/**
 * Demo alarm data for the alarm monitoring page.
 * Based on alarm types from the old perfomax-maintenance-ui project.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type AlarmCategory = 'critical' | 'warning' | 'notice' | 'info';

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
  /** Alarm category for severity classification */
  category: AlarmCategory;
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

// ─── Compute active alarm counts by engine ───────────────────────────────────

/** Map engine selector values to alarm-data engine strings */
export const engineValueToAlarmEngine: Record<string, string> = {
  me1: 'ME PORT',
  me2: 'ME STBD',
  me3: 'ME CENTER',
  ae1: 'AE1',
  ae2: 'AE2',
  crane: 'CRANE',
  winch: 'WINCH',
};

/**
 * Count active alarms by category for a given vessel + engine.
 * Returns { critical, warning, notice, info } matching the card format.
 */
export function getActiveAlarmCounts(
  vesselId: number,
  engineValue?: string
): { critical: number; warning: number; notice: number; info: number } {
  const counts = { critical: 0, warning: 0, notice: 0, info: 0 };
  const alarms = vesselAlarmData[vesselId] ?? [];
  const engineName = engineValue
    ? engineValueToAlarmEngine[engineValue]
    : undefined;

  for (const alarm of alarms) {
    if (alarm.status !== 'active') continue;
    if (engineName && alarm.engine !== engineName) continue;
    counts[alarm.category]++;
  }
  return counts;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

const minsAgo = (m: number) => Date.now() - m * 60_000;

// ─── Per-vessel alarm data ───────────────────────────────────────────────────

export const vesselAlarmData: Record<number, AlarmEntry[]> = {
  // Ocean Voyager
  1: [
    {
      id: 'a1-01',
      timestamp: minsAgo(3),
      alarm_text: 'High coolant temperature',
      engine: 'ME PORT',
      value: 98,
      threshold_min: null,
      threshold_max: 95,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
    {
      id: 'a1-02',
      timestamp: minsAgo(8),
      alarm_text: 'Low lube oil pressure',
      engine: 'ME STBD',
      value: 180,
      threshold_min: 200,
      threshold_max: null,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
    {
      id: 'a1-03',
      timestamp: minsAgo(15),
      alarm_text: 'High lube oil temperature',
      engine: 'ME PORT',
      value: 112,
      threshold_min: null,
      threshold_max: 110,
      severity: 2,
      status: 'resolved',
      category: 'info',
    },
    {
      id: 'a1-04',
      timestamp: minsAgo(22),
      alarm_text: 'Low fuel pressure',
      engine: 'ME CENTER',
      value: 140,
      threshold_min: 150,
      threshold_max: null,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
    {
      id: 'a1-05',
      timestamp: minsAgo(35),
      alarm_text: 'High boost air pressure',
      engine: 'ME PORT',
      value: 320,
      threshold_min: null,
      threshold_max: 300,
      severity: 2,
      status: 'resolved',
      category: 'info',
    },
    {
      id: 'a1-06',
      timestamp: minsAgo(42),
      alarm_text: 'Low battery voltage',
      engine: 'AE1',
      value: 23.2,
      threshold_min: 24,
      threshold_max: null,
      severity: 1,
      status: 'active',
      category: 'warning',
    },
    {
      id: 'a1-07',
      timestamp: minsAgo(50),
      alarm_text: 'Engine overspeed',
      engine: 'ME STBD',
      value: 2450,
      threshold_min: null,
      threshold_max: 2400,
      severity: 1,
      status: 'resolved',
      category: 'warning',
    },
    {
      id: 'a1-08',
      timestamp: minsAgo(61),
      alarm_text: 'High intake air temperature',
      engine: 'ME PORT',
      value: 58,
      threshold_min: null,
      threshold_max: 55,
      severity: 2,
      status: 'active',
      category: 'notice',
    },
    {
      id: 'a1-09',
      timestamp: minsAgo(70),
      alarm_text: 'High coolant temperature',
      engine: 'ME CENTER',
      value: 97,
      threshold_min: null,
      threshold_max: 95,
      severity: 1,
      status: 'resolved',
      category: 'warning',
    },
    {
      id: 'a1-10',
      timestamp: minsAgo(85),
      alarm_text: 'Low lube oil pressure',
      engine: 'ME PORT',
      value: 190,
      threshold_min: 200,
      threshold_max: null,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
    {
      id: 'a1-11',
      timestamp: minsAgo(100),
      alarm_text: 'High fuel pressure',
      engine: 'AE2',
      value: 520,
      threshold_min: null,
      threshold_max: 500,
      severity: 2,
      status: 'resolved',
      category: 'info',
    },
    {
      id: 'a1-12',
      timestamp: minsAgo(115),
      alarm_text: 'Low boost air pressure',
      engine: 'ME STBD',
      value: 85,
      threshold_min: 100,
      threshold_max: null,
      severity: 2,
      status: 'active',
      category: 'notice',
    },
    {
      id: 'a1-13',
      timestamp: minsAgo(130),
      alarm_text: 'High battery voltage',
      engine: 'AE1',
      value: 30.5,
      threshold_min: null,
      threshold_max: 29,
      severity: 1,
      status: 'resolved',
      category: 'info',
    },
    {
      id: 'a1-14',
      timestamp: minsAgo(145),
      alarm_text: 'High lube oil temperature',
      engine: 'ME CENTER',
      value: 115,
      threshold_min: null,
      threshold_max: 110,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
    {
      id: 'a1-15',
      timestamp: minsAgo(160),
      alarm_text: 'Low fuel pressure',
      engine: 'ME PORT',
      value: 145,
      threshold_min: 150,
      threshold_max: null,
      severity: 2,
      status: 'resolved',
      category: 'info',
    },
  ],

  // Sea Explorer
  2: [
    {
      id: 'a2-01',
      timestamp: minsAgo(5),
      alarm_text: 'High coolant temperature',
      engine: 'ME PORT',
      value: 99,
      threshold_min: null,
      threshold_max: 95,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
    {
      id: 'a2-02',
      timestamp: minsAgo(18),
      alarm_text: 'Low lube oil pressure',
      engine: 'ME STBD',
      value: 185,
      threshold_min: 200,
      threshold_max: null,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
    {
      id: 'a2-03',
      timestamp: minsAgo(30),
      alarm_text: 'Engine overspeed',
      engine: 'ME PORT',
      value: 2480,
      threshold_min: null,
      threshold_max: 2400,
      severity: 1,
      status: 'resolved',
      category: 'warning',
    },
    {
      id: 'a2-04',
      timestamp: minsAgo(55),
      alarm_text: 'High lube oil temperature',
      engine: 'ME STBD',
      value: 113,
      threshold_min: null,
      threshold_max: 110,
      severity: 2,
      status: 'active',
      category: 'notice',
    },
    {
      id: 'a2-05',
      timestamp: minsAgo(80),
      alarm_text: 'Low battery voltage',
      engine: 'ME PORT',
      value: 22.8,
      threshold_min: 24,
      threshold_max: null,
      severity: 1,
      status: 'resolved',
      category: 'warning',
    },
    {
      id: 'a2-06',
      timestamp: minsAgo(120),
      alarm_text: 'High boost air pressure',
      engine: 'ME STBD',
      value: 315,
      threshold_min: null,
      threshold_max: 300,
      severity: 2,
      status: 'resolved',
      category: 'info',
    },
  ],

  // Wave Rider
  3: [
    {
      id: 'a3-01',
      timestamp: minsAgo(2),
      alarm_text: 'Low fuel pressure',
      engine: 'ME PORT',
      value: 135,
      threshold_min: 150,
      threshold_max: null,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
    {
      id: 'a3-02',
      timestamp: minsAgo(12),
      alarm_text: 'High coolant temperature',
      engine: 'ME CENTER',
      value: 97,
      threshold_min: null,
      threshold_max: 95,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
    {
      id: 'a3-03',
      timestamp: minsAgo(28),
      alarm_text: 'High intake air temperature',
      engine: 'ME STBD',
      value: 60,
      threshold_min: null,
      threshold_max: 55,
      severity: 2,
      status: 'resolved',
      category: 'info',
    },
    {
      id: 'a3-04',
      timestamp: minsAgo(40),
      alarm_text: 'Low lube oil pressure',
      engine: 'AUX 1',
      value: 175,
      threshold_min: 200,
      threshold_max: null,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
    {
      id: 'a3-05',
      timestamp: minsAgo(65),
      alarm_text: 'Engine overspeed',
      engine: 'ME PORT',
      value: 2500,
      threshold_min: null,
      threshold_max: 2400,
      severity: 1,
      status: 'resolved',
      category: 'warning',
    },
  ],

  // Storm Chaser
  4: [
    {
      id: 'a4-01',
      timestamp: minsAgo(7),
      alarm_text: 'High lube oil temperature',
      engine: 'ME PORT',
      value: 118,
      threshold_min: null,
      threshold_max: 110,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
    {
      id: 'a4-02',
      timestamp: minsAgo(25),
      alarm_text: 'Low battery voltage',
      engine: 'ME CENTER',
      value: 23.0,
      threshold_min: 24,
      threshold_max: null,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
    {
      id: 'a4-03',
      timestamp: minsAgo(45),
      alarm_text: 'High coolant temperature',
      engine: 'ME STBD',
      value: 96,
      threshold_min: null,
      threshold_max: 95,
      severity: 2,
      status: 'resolved',
      category: 'info',
    },
    {
      id: 'a4-04',
      timestamp: minsAgo(90),
      alarm_text: 'Low fuel pressure',
      engine: 'ME PORT',
      value: 142,
      threshold_min: 150,
      threshold_max: null,
      severity: 2,
      status: 'active',
      category: 'notice',
    },
  ],

  // Blue Horizon
  5: [
    {
      id: 'a5-01',
      timestamp: minsAgo(10),
      alarm_text: 'Engine overspeed',
      engine: 'ME PORT',
      value: 2420,
      threshold_min: null,
      threshold_max: 2400,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
    {
      id: 'a5-02',
      timestamp: minsAgo(35),
      alarm_text: 'Low lube oil pressure',
      engine: 'ME STBD',
      value: 192,
      threshold_min: 200,
      threshold_max: null,
      severity: 1,
      status: 'resolved',
      category: 'warning',
    },
    {
      id: 'a5-03',
      timestamp: minsAgo(70),
      alarm_text: 'High coolant temperature',
      engine: 'ME PORT',
      value: 100,
      threshold_min: null,
      threshold_max: 95,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
  ],

  // Coral Navigator
  6: [
    {
      id: 'a6-01',
      timestamp: minsAgo(4),
      alarm_text: 'High boost air pressure',
      engine: 'ME PORT',
      value: 310,
      threshold_min: null,
      threshold_max: 300,
      severity: 2,
      status: 'active',
      category: 'notice',
    },
    {
      id: 'a6-02',
      timestamp: minsAgo(20),
      alarm_text: 'Low fuel pressure',
      engine: 'ME STBD',
      value: 138,
      threshold_min: 150,
      threshold_max: null,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
    {
      id: 'a6-03',
      timestamp: minsAgo(50),
      alarm_text: 'High coolant temperature',
      engine: 'ME CENTER',
      value: 96,
      threshold_min: null,
      threshold_max: 95,
      severity: 1,
      status: 'resolved',
      category: 'warning',
    },
    {
      id: 'a6-04',
      timestamp: minsAgo(80),
      alarm_text: 'High lube oil temperature',
      engine: 'ME PORT',
      value: 112,
      threshold_min: null,
      threshold_max: 110,
      severity: 2,
      status: 'active',
      category: 'notice',
    },
  ],

  // Aurora Spirit
  7: [
    {
      id: 'a7-01',
      timestamp: minsAgo(1),
      alarm_text: 'Low battery voltage',
      engine: 'AUX 2',
      value: 22.5,
      threshold_min: 24,
      threshold_max: null,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
    {
      id: 'a7-02',
      timestamp: minsAgo(15),
      alarm_text: 'High coolant temperature',
      engine: 'ME PORT',
      value: 101,
      threshold_min: null,
      threshold_max: 95,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
    {
      id: 'a7-03',
      timestamp: minsAgo(30),
      alarm_text: 'Low lube oil pressure',
      engine: 'ME CENTER',
      value: 188,
      threshold_min: 200,
      threshold_max: null,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
    {
      id: 'a7-04',
      timestamp: minsAgo(55),
      alarm_text: 'High intake air temperature',
      engine: 'ME STBD',
      value: 57,
      threshold_min: null,
      threshold_max: 55,
      severity: 2,
      status: 'resolved',
      category: 'info',
    },
    {
      id: 'a7-05',
      timestamp: minsAgo(75),
      alarm_text: 'Engine overspeed',
      engine: 'ME PORT',
      value: 2460,
      threshold_min: null,
      threshold_max: 2400,
      severity: 1,
      status: 'resolved',
      category: 'warning',
    },
    {
      id: 'a7-06',
      timestamp: minsAgo(100),
      alarm_text: 'High fuel pressure',
      engine: 'AUX 1',
      value: 515,
      threshold_min: null,
      threshold_max: 500,
      severity: 2,
      status: 'active',
      category: 'notice',
    },
  ],

  // Tide Breaker
  8: [
    {
      id: 'a8-01',
      timestamp: minsAgo(6),
      alarm_text: 'High coolant temperature',
      engine: 'ME PORT',
      value: 97,
      threshold_min: null,
      threshold_max: 95,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
    {
      id: 'a8-02',
      timestamp: minsAgo(40),
      alarm_text: 'Low fuel pressure',
      engine: 'ME STBD',
      value: 148,
      threshold_min: 150,
      threshold_max: null,
      severity: 2,
      status: 'resolved',
      category: 'info',
    },
  ],

  // Harbor Guardian
  9: [
    {
      id: 'a9-01',
      timestamp: minsAgo(9),
      alarm_text: 'High lube oil temperature',
      engine: 'ME PORT',
      value: 114,
      threshold_min: null,
      threshold_max: 110,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
    {
      id: 'a9-02',
      timestamp: minsAgo(33),
      alarm_text: 'Low lube oil pressure',
      engine: 'ME CENTER',
      value: 195,
      threshold_min: 200,
      threshold_max: null,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
    {
      id: 'a9-03',
      timestamp: minsAgo(60),
      alarm_text: 'Engine overspeed',
      engine: 'ME STBD',
      value: 2430,
      threshold_min: null,
      threshold_max: 2400,
      severity: 1,
      status: 'resolved',
      category: 'warning',
    },
    {
      id: 'a9-04',
      timestamp: minsAgo(100),
      alarm_text: 'High boost air pressure',
      engine: 'ME PORT',
      value: 318,
      threshold_min: null,
      threshold_max: 300,
      severity: 2,
      status: 'active',
      category: 'notice',
    },
    {
      id: 'a9-05',
      timestamp: minsAgo(140),
      alarm_text: 'Low battery voltage',
      engine: 'ME CENTER',
      value: 23.1,
      threshold_min: 24,
      threshold_max: null,
      severity: 1,
      status: 'resolved',
      category: 'warning',
    },
  ],

  // Sea Sentinel
  10: [
    {
      id: 'a10-01',
      timestamp: minsAgo(11),
      alarm_text: 'High coolant temperature',
      engine: 'ME PORT',
      value: 98,
      threshold_min: null,
      threshold_max: 95,
      severity: 1,
      status: 'active',
      category: 'critical',
    },
    {
      id: 'a10-02',
      timestamp: minsAgo(45),
      alarm_text: 'Low fuel pressure',
      engine: 'ME STBD',
      value: 143,
      threshold_min: 150,
      threshold_max: null,
      severity: 2,
      status: 'resolved',
      category: 'info',
    },
    {
      id: 'a10-03',
      timestamp: minsAgo(90),
      alarm_text: 'High lube oil temperature',
      engine: 'ME PORT',
      value: 111,
      threshold_min: null,
      threshold_max: 110,
      severity: 2,
      status: 'active',
      category: 'notice',
    },
  ],
};
