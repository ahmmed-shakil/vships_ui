/**
 * Condition Monitoring Charts — dummy data
 */

// ─── Delta Deviation Trendline ───────────────────────────────────────────────

export interface TrendlinePoint {
  date: string;
  chargeAirTemp: number;
  lubeOilTemp: number;
  exhTemp: number;
  htCoolingWaterTemp: number;
  fuelOilPressure: number;
  lubeOilPressure: number;
  chargeAirPressure: number;
}

export const trendlineData: TrendlinePoint[] = [
  {
    date: '01.05.25\n11:00',
    chargeAirTemp: 0.5,
    lubeOilTemp: 1.2,
    exhTemp: -0.3,
    htCoolingWaterTemp: 0.8,
    fuelOilPressure: -1.5,
    lubeOilPressure: 0.2,
    chargeAirPressure: -0.8,
  },
  {
    date: '01.05.25\n11:00',
    chargeAirTemp: 1.8,
    lubeOilTemp: 2.5,
    exhTemp: 0.5,
    htCoolingWaterTemp: 1.2,
    fuelOilPressure: -2.0,
    lubeOilPressure: 0.8,
    chargeAirPressure: -1.2,
  },
  {
    date: '02.05.25\n11:00',
    chargeAirTemp: 3.5,
    lubeOilTemp: 4.2,
    exhTemp: 1.0,
    htCoolingWaterTemp: 2.0,
    fuelOilPressure: -2.5,
    lubeOilPressure: 1.5,
    chargeAirPressure: -1.8,
  },
  {
    date: '03.05.25\n11:00',
    chargeAirTemp: 5.8,
    lubeOilTemp: 6.5,
    exhTemp: 1.5,
    htCoolingWaterTemp: 3.2,
    fuelOilPressure: -3.0,
    lubeOilPressure: 2.0,
    chargeAirPressure: -2.5,
  },
  {
    date: '04.05.25\n11:00',
    chargeAirTemp: 8.2,
    lubeOilTemp: 9.0,
    exhTemp: 2.0,
    htCoolingWaterTemp: 4.5,
    fuelOilPressure: -3.8,
    lubeOilPressure: 2.5,
    chargeAirPressure: -3.0,
  },
  {
    date: '05.05.25\n11:00',
    chargeAirTemp: 10.5,
    lubeOilTemp: 11.2,
    exhTemp: 2.8,
    htCoolingWaterTemp: 5.8,
    fuelOilPressure: -5.0,
    lubeOilPressure: 3.0,
    chargeAirPressure: -3.5,
  },
  {
    date: '06.05.25\n11:00',
    chargeAirTemp: 12.8,
    lubeOilTemp: 13.5,
    exhTemp: 3.2,
    htCoolingWaterTemp: 7.0,
    fuelOilPressure: -6.5,
    lubeOilPressure: 3.5,
    chargeAirPressure: -4.2,
  },
  {
    date: '07.05.25\n11:00',
    chargeAirTemp: 15.0,
    lubeOilTemp: 15.8,
    exhTemp: 3.8,
    htCoolingWaterTemp: 8.5,
    fuelOilPressure: -8.0,
    lubeOilPressure: 4.0,
    chargeAirPressure: -5.0,
  },
  {
    date: '08.05.25\n11:00',
    chargeAirTemp: 16.5,
    lubeOilTemp: 17.2,
    exhTemp: 4.2,
    htCoolingWaterTemp: 9.8,
    fuelOilPressure: -10.0,
    lubeOilPressure: 4.5,
    chargeAirPressure: -5.5,
  },
  {
    date: '09.05.25\n11:00',
    chargeAirTemp: 17.8,
    lubeOilTemp: 18.5,
    exhTemp: 4.5,
    htCoolingWaterTemp: 11.0,
    fuelOilPressure: -12.0,
    lubeOilPressure: 4.8,
    chargeAirPressure: -6.0,
  },
  {
    date: '10.05.25\n11:00',
    chargeAirTemp: 18.5,
    lubeOilTemp: 19.0,
    exhTemp: 5.0,
    htCoolingWaterTemp: 12.0,
    fuelOilPressure: -14.0,
    lubeOilPressure: 5.0,
    chargeAirPressure: -6.5,
  },
];

// Series config for the trendline chart
export const trendlineSeries = [
  {
    key: 'chargeAirTemp',
    label: 'Charge Air Temp',
    color: '#3B82F6',
    dash: '',
  }, // blue
  { key: 'lubeOilTemp', label: 'Lube Oil Temp', color: '#F97316', dash: '' }, // orange
  { key: 'exhTemp', label: 'Exh Temp', color: '#22C55E', dash: '' }, // green
  {
    key: 'htCoolingWaterTemp',
    label: 'HT Cooling Water Temp',
    color: '#A855F7',
    dash: '',
  }, // purple
  {
    key: 'fuelOilPressure',
    label: 'Fuel Oil Pressure',
    color: '#EF4444',
    dash: '8 4',
  }, // red dashed
  {
    key: 'lubeOilPressure',
    label: 'Lube Oil Pressure',
    color: '#14B8A6',
    dash: '',
  }, // teal
  {
    key: 'chargeAirPressure',
    label: 'Charge Air Pressure',
    color: '#6366F1',
    dash: '4 4',
  }, // indigo dashed
] as const;

// ─── Scatter Chart ───────────────────────────────────────────────────────────

export interface ScatterPoint {
  x: number; // Fuel Pump Index
  y: number; // Charge Air Pressure
}

export const scatterDataGreen: ScatterPoint[] = [
  { x: 5, y: 0.5 },
  { x: 10, y: 1.0 },
  { x: 15, y: 1.5 },
  { x: 20, y: 2.0 },
  { x: 25, y: 2.3 },
  { x: 30, y: 2.6 },
  { x: 35, y: 2.8 },
  { x: 40, y: 3.0 },
  { x: 45, y: 3.2 },
  { x: 50, y: 3.4 },
  { x: 55, y: 3.5 },
  { x: 60, y: 3.6 },
  { x: 65, y: 3.7 },
  { x: 70, y: 3.8 },
  { x: 75, y: 3.85 },
  { x: 80, y: 3.9 },
  { x: 85, y: 3.95 },
  { x: 90, y: 4.0 },
];

export const scatterDataPurple: ScatterPoint[] = [
  { x: 8, y: 0.8 },
  { x: 18, y: 1.8 },
  { x: 28, y: 2.5 },
  { x: 38, y: 3.1 },
  { x: 48, y: 3.5 },
  { x: 58, y: 3.7 },
  { x: 68, y: 3.9 },
  { x: 78, y: 4.1 },
  { x: 85, y: 4.2 },
  { x: 92, y: 4.4 },
];

// Parameter options for the scatter dropdown
export const scatterParamOptions = [
  { label: 'Param 1', value: 'param1' },
  { label: 'Param 2', value: 'param2' },
  { label: 'Param 3', value: 'param3' },
];

// ─── Coolant Pressure - ME Port ──────────────────────────────────────────────

export interface CoolantPressurePoint {
  date: string;
  temperature: number;
  upperLimit: number;
  lowerLimit: number;
}

export const coolantPressureData: CoolantPressurePoint[] = [
  // Normal values (within limits) - white color
  {
    date: '01.05.25\n11:00',
    temperature: 4.8,
    upperLimit: 5.0,
    lowerLimit: 0.5,
  },
  {
    date: '02.05.25\n11:00',
    temperature: 4.5,
    upperLimit: 5.0,
    lowerLimit: 0.5,
  },
  // Goes above upper limit (>= 5.0) - red color
  {
    date: '03.05.25\n11:00',
    temperature: 5.2,
    upperLimit: 5.0,
    lowerLimit: 0.5,
  },
  {
    date: '04.05.25\n11:00',
    temperature: 5.5,
    upperLimit: 5.0,
    lowerLimit: 0.5,
  },
  {
    date: '05.05.25\n11:00',
    temperature: 5.3,
    upperLimit: 5.0,
    lowerLimit: 0.5,
  },
  // Back to normal
  {
    date: '06.05.25\n11:00',
    temperature: 4.2,
    upperLimit: 5.0,
    lowerLimit: 0.5,
  },
  {
    date: '07.05.25\n11:00',
    temperature: 3.5,
    upperLimit: 5.0,
    lowerLimit: 0.5,
  },
  // Goes below lower limit (<= 0.5) - light blue color
  {
    date: '08.05.25\n11:00',
    temperature: 0.3,
    upperLimit: 5.0,
    lowerLimit: 0.5,
  },
  {
    date: '09.05.25\n11:00',
    temperature: 0.2,
    upperLimit: 5.0,
    lowerLimit: 0.5,
  },
  // Back to normal
  {
    date: '10.05.25\n11:00',
    temperature: 2.5,
    upperLimit: 5.0,
    lowerLimit: 0.5,
  },
];

// ─── Parameter vs Pcharge - iso ──────────────────────────────────────────────

export const pchargeScatterLine: ScatterPoint[] = [
  { x: 0.2, y: 50 },
  { x: 0.5, y: 80 },
  { x: 1.0, y: 120 },
  { x: 1.5, y: 160 },
  { x: 2.0, y: 200 },
  { x: 2.5, y: 230 },
  { x: 3.0, y: 270 },
  { x: 3.5, y: 310 },
  { x: 4.0, y: 340 },
  { x: 4.5, y: 370 },
  { x: 5.0, y: 400 },
];

export const pchargeScatterDots: ScatterPoint[] = [
  { x: 0.3, y: 60 },
  { x: 0.8, y: 110 },
  { x: 1.2, y: 140 },
  { x: 1.8, y: 185 },
  { x: 2.2, y: 215 },
  { x: 2.8, y: 260 },
  { x: 3.2, y: 290 },
  { x: 3.8, y: 330 },
  { x: 4.2, y: 355 },
  { x: 4.8, y: 390 },
];
