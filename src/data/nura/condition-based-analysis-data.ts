/**
 * Condition Based Analysis — dummy data matching the reference screenshot.
 */

export interface ConditionAnalysisEntry {
  id: string;
  spare: string;
  lifeHrs: number;
  effectiveLife: number;
  hoursSinceOh: number;
  remainingLife: number;
  condition: number;   // 0-100 percentage
  pmsLink: string;
  status: 'critical' | 'urgent' | 'caution' | 'ok';
  remarks: string;
}

export const conditionAnalysisData: ConditionAnalysisEntry[] = [
  { id: 'cba-01', spare: 'Cylinder Head Assembly', lifeHrs: 15000, effectiveLife: 13500, hoursSinceOh: 5100, remainingLife: 8400, condition: 62, pmsLink: 'PMS-01', status: 'ok', remarks: 'Replaced at overhaul' },
  { id: 'cba-02', spare: 'Piston & Ring Set (12 cyl)', lifeHrs: 15000, effectiveLife: 13000, hoursSinceOh: 5100, remainingLife: 7900, condition: 61, pmsLink: 'PMS-02', status: 'ok', remarks: 'New at overhaul - DP2 accelerated wear' },
  { id: 'cba-03', spare: 'Cylinder Liner Set (12)', lifeHrs: 25000, effectiveLife: 22000, hoursSinceOh: 5100, remainingLife: 16900, condition: 77, pmsLink: 'PMS-03', status: 'ok', remarks: 'Replaced - monitor bore wear' },
  { id: 'cba-04', spare: 'Fuel Injector Set (12)', lifeHrs: 12000, effectiveLife: 10000, hoursSinceOh: 5100, remainingLife: 4900, condition: 49, pmsLink: 'PMS-04', status: 'caution', remarks: 'New MEUI injectors' },
  { id: 'cba-05', spare: 'Valve Train Assembly', lifeHrs: 20000, effectiveLife: 17000, hoursSinceOh: 5100, remainingLife: 11900, condition: 70, pmsLink: 'PMS-05', status: 'ok', remarks: 'Reconditioned - DP2 thermal stress' },
  { id: 'cba-06', spare: 'Turbocharger (Port)', lifeHrs: 18000, effectiveLife: 15000, hoursSinceOh: 5100, remainingLife: 9900, condition: 66, pmsLink: 'PMS-06', status: 'ok', remarks: 'Rebuilt - high load duty' },
  { id: 'cba-07', spare: 'Turbocharger (Stbd)', lifeHrs: 18000, effectiveLife: 14800, hoursSinceOh: 5100, remainingLife: 9700, condition: 66, pmsLink: 'PMS-07', status: 'ok', remarks: 'Rebuilt - slight imbalance noted' },
  { id: 'cba-08', spare: 'Sea Water Pump', lifeHrs: 8000, effectiveLife: 6500, hoursSinceOh: 9200, remainingLife: -2700, condition: 0, pmsLink: 'PMS-08', status: 'critical', remarks: 'Inspect impeller - cavitation risk' },
  { id: 'cba-09', spare: 'Jacket Water Pump', lifeHrs: 10000, effectiveLife: 8500, hoursSinceOh: 9800, remainingLife: -1300, condition: 0, pmsLink: 'PMS-09', status: 'critical', remarks: 'Monitor seal leakage' },
  { id: 'cba-10', spare: 'Heat Exchanger', lifeHrs: 20000, effectiveLife: 17000, hoursSinceOh: 12400, remainingLife: 4600, condition: 27, pmsLink: 'PMS-10', status: 'caution', remarks: 'Tube fouling from rough seas' },
  { id: 'cba-11', spare: 'Aftercooler Core', lifeHrs: 15000, effectiveLife: 13000, hoursSinceOh: 11900, remainingLife: 1100, condition: 8, pmsLink: 'PMS-11', status: 'critical', remarks: 'Salt water corrosion present' },
  { id: 'cba-12', spare: 'Crankshaft Main Bearings', lifeHrs: 22000, effectiveLife: 18500, hoursSinceOh: 17500, remainingLife: 1000, condition: 5, pmsLink: 'PMS-12', status: 'critical', remarks: 'Oil analysis - elevated copper' },
  { id: 'cba-13', spare: 'Connecting Rod Bearings', lifeHrs: 22000, effectiveLife: 18000, hoursSinceOh: 17500, remainingLife: 500, condition: 3, pmsLink: 'PMS-13', status: 'critical', remarks: 'DP2 cycling stress' },
  { id: 'cba-14', spare: 'Camshaft & Bearings', lifeHrs: 25000, effectiveLife: 21000, hoursSinceOh: 17500, remainingLife: 3500, condition: 17, pmsLink: 'PMS-14', status: 'urgent', remarks: 'Inspect at next service' },
  { id: 'cba-15', spare: 'Timing Gear Set', lifeHrs: 30000, effectiveLife: 26000, hoursSinceOh: 17500, remainingLife: 8500, condition: 33, pmsLink: 'PMS-15', status: 'caution', remarks: 'Monitor backlash' },
  { id: 'cba-16', spare: 'Fuel Filter/Water Sep', lifeHrs: 2000, effectiveLife: 1600, hoursSinceOh: 850, remainingLife: 750, condition: 47, pmsLink: 'PMS-16', status: 'caution', remarks: 'Replace per schedule' },
  { id: 'cba-17', spare: 'Lube Oil Filter (Primary)', lifeHrs: 500, effectiveLife: 400, hoursSinceOh: 250, remainingLife: 150, condition: 38, pmsLink: 'PMS-17', status: 'caution', remarks: 'Standard interval' },
  { id: 'cba-18', spare: 'Air Filter Element', lifeHrs: 2000, effectiveLife: 1500, hoursSinceOh: 1100, remainingLife: 400, condition: 27, pmsLink: 'PMS-18', status: 'caution', remarks: 'High restriction - rough weather' },
  { id: 'cba-19', spare: 'ECM (ADEM A4)', lifeHrs: 40000, effectiveLife: 36000, hoursSinceOh: 17500, remainingLife: 18500, condition: 51, pmsLink: 'PMS-19', status: 'ok', remarks: 'Monitor error codes' },
  { id: 'cba-20', spare: 'Alternator', lifeHrs: 12000, effectiveLife: 10000, hoursSinceOh: 9500, remainingLife: 500, condition: 5, pmsLink: 'PMS-20', status: 'critical', remarks: 'Bearings showing wear' },
  { id: 'cba-21', spare: 'Starting Motor', lifeHrs: 15000, effectiveLife: 13000, hoursSinceOh: 9500, remainingLife: 3500, condition: 27, pmsLink: 'PMS-21', status: 'caution', remarks: 'DP2 frequent starts' },
  { id: 'cba-22', spare: 'Exhaust Manifold', lifeHrs: 18000, effectiveLife: 15000, hoursSinceOh: 12800, remainingLife: 2200, condition: 15, pmsLink: 'PMS-22', status: 'urgent', remarks: 'Thermal cycling cracks' },
  { id: 'cba-23', spare: 'Exhaust Elbow/Riser', lifeHrs: 10000, effectiveLife: 8000, hoursSinceOh: 7200, remainingLife: 800, condition: 10, pmsLink: 'PMS-23', status: 'urgent', remarks: 'Corrosion accelerated' },
];
