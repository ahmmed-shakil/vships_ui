/**
 * Machinery Condition Score — per-vessel scoring data.
 * Based on the old project's machinery-table.tsx.
 */

export interface MachineryScoreEntry {
  id: string;
  name: string;
  value: string; // e.g. "37/100"
  status: 'active' | 'inactive';
}

/** Map of vessel ID → machinery condition scores */
export const vesselMachineryScores: Record<number, MachineryScoreEntry[]> = {
  1: [
    { id: 'ms-1-1', name: 'Port Engine',   value: '37/100', status: 'active' },
    { id: 'ms-1-2', name: 'Center Engine', value: '35/100', status: 'inactive' },
    { id: 'ms-1-3', name: 'Strbd Engine',  value: '31/100', status: 'active' },
    { id: 'ms-1-4', name: 'Genset 1',      value: '37/100', status: 'active' },
    { id: 'ms-1-5', name: 'Genset 2',      value: '37/100', status: 'inactive' },
  ],
  2: [
    { id: 'ms-2-1', name: 'Port Engine',   value: '42/100', status: 'active' },
    { id: 'ms-2-2', name: 'Strbd Engine',  value: '39/100', status: 'active' },
    { id: 'ms-2-3', name: 'Genset 1',      value: '35/100', status: 'active' },
    { id: 'ms-2-4', name: 'Genset 2',      value: '33/100', status: 'inactive' },
  ],
  3: [
    { id: 'ms-3-1', name: 'Port Engine',   value: '55/100', status: 'active' },
    { id: 'ms-3-2', name: 'Strbd Engine',  value: '52/100', status: 'active' },
    { id: 'ms-3-3', name: 'Center Engine', value: '48/100', status: 'active' },
    { id: 'ms-3-4', name: 'Genset 1',      value: '40/100', status: 'active' },
  ],
  4: [
    { id: 'ms-4-1', name: 'Port Engine',   value: '30/100', status: 'active' },
    { id: 'ms-4-2', name: 'Strbd Engine',  value: '28/100', status: 'active' },
    { id: 'ms-4-3', name: 'Center Engine', value: '29/100', status: 'inactive' },
    { id: 'ms-4-4', name: 'Genset 1',      value: '25/100', status: 'active' },
    { id: 'ms-4-5', name: 'Genset 2',      value: '24/100', status: 'active' },
  ],
  5: [
    { id: 'ms-5-1', name: 'Port Engine',   value: '65/100', status: 'active' },
    { id: 'ms-5-2', name: 'Strbd Engine',  value: '62/100', status: 'active' },
  ],
  6: [
    { id: 'ms-6-1', name: 'Port Engine',   value: '38/100', status: 'active' },
    { id: 'ms-6-2', name: 'Strbd Engine',  value: '36/100', status: 'active' },
    { id: 'ms-6-3', name: 'Center Engine', value: '0/100',  status: 'inactive' },
    { id: 'ms-6-4', name: 'Genset 1',      value: '32/100', status: 'active' },
  ],
  7: [
    { id: 'ms-7-1', name: 'Port Engine',   value: '72/100', status: 'active' },
    { id: 'ms-7-2', name: 'Strbd Engine',  value: '70/100', status: 'active' },
    { id: 'ms-7-3', name: 'Center Engine', value: '68/100', status: 'active' },
    { id: 'ms-7-4', name: 'Genset 1',      value: '55/100', status: 'active' },
    { id: 'ms-7-5', name: 'Genset 2',      value: '53/100', status: 'active' },
  ],
  8: [
    { id: 'ms-8-1', name: 'Port Engine',   value: '18/100', status: 'active' },
    { id: 'ms-8-2', name: 'Strbd Engine',  value: '17/100', status: 'inactive' },
  ],
  9: [
    { id: 'ms-9-1', name: 'Port Engine',   value: '50/100', status: 'active' },
    { id: 'ms-9-2', name: 'Strbd Engine',  value: '48/100', status: 'active' },
    { id: 'ms-9-3', name: 'Center Engine', value: '45/100', status: 'active' },
    { id: 'ms-9-4', name: 'Genset 1',      value: '38/100', status: 'active' },
    { id: 'ms-9-5', name: 'Genset 2',      value: '36/100', status: 'inactive' },
  ],
  10: [
    { id: 'ms-10-1', name: 'Port Engine',  value: '12/100', status: 'active' },
    { id: 'ms-10-2', name: 'Strbd Engine', value: '10/100', status: 'inactive' },
    { id: 'ms-10-3', name: 'Genset 1',     value: '15/100', status: 'active' },
  ],
};
