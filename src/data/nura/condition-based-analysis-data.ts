/**
 * Condition Based Analysis — dummy data matching the reference screenshot.
 */

export interface ConditionAnalysisEntry {
  id: string;
  spare: string;
  lifeHrs: number;
  effectiveLife: number;
  remainingLife: number;
  confidence: number;   // 0-100 percentage
  pmsLink: string;
  status: 'critical' | 'warning' | 'ok';
}

export const conditionAnalysisData: ConditionAnalysisEntry[] = [
  { id: 'cba-1', spare: 'Exh Gas Turbine',       lifeHrs: 5000, effectiveLife: 4500, remainingLife: 2500, confidence: 70, pmsLink: 'link 1', status: 'critical' },
  { id: 'cba-2', spare: 'Exh Gas Turbine',       lifeHrs: 5000, effectiveLife: 4500, remainingLife: 2500, confidence: 70, pmsLink: 'link 1', status: 'critical' },
  { id: 'cba-3', spare: 'Exh Gas Turbine',       lifeHrs: 5000, effectiveLife: 4500, remainingLife: 2500, confidence: 70, pmsLink: 'link 1', status: 'critical' },
  { id: 'cba-4', spare: 'Exh Gas Turbine',       lifeHrs: 5000, effectiveLife: 4500, remainingLife: 2500, confidence: 70, pmsLink: 'link 1', status: 'critical' },
  { id: 'cba-5', spare: 'Cylinder Liner',         lifeHrs: 8000, effectiveLife: 7200, remainingLife: 5500, confidence: 85, pmsLink: 'link 2', status: 'warning' },
  { id: 'cba-6', spare: 'Piston Ring Set',        lifeHrs: 6000, effectiveLife: 5500, remainingLife: 4000, confidence: 78, pmsLink: 'link 3', status: 'ok' },
  { id: 'cba-7', spare: 'Fuel Injection Valve',   lifeHrs: 3000, effectiveLife: 2800, remainingLife: 1200, confidence: 65, pmsLink: 'link 4', status: 'critical' },
  { id: 'cba-8', spare: 'Main Bearing',           lifeHrs: 12000, effectiveLife: 11000, remainingLife: 9500, confidence: 92, pmsLink: 'link 5', status: 'ok' },
];
