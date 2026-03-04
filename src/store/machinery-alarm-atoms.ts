'use client';

import { shipData, engineData, type Ship } from '@/data/nura/ships';
import { atomWithStorage } from 'jotai/utils';

/**
 * Machinery-Alarm shared atoms
 * Used by both machinery-overview and alarm-overview pages
 * to keep ship and engine selections in sync.
 */

/** Selected vessel (shared between machinery-overview and alarm-overview) */
export const selectedMachineryShipAtom = atomWithStorage<Ship>(
  'machineryShip',
  shipData[0]
);

/** Selected engine option (set when clicking "View All" on a machinery card) */
export const selectedMachineryEngineAtom = atomWithStorage(
  'machineryEngine',
  engineData[0] // Default: "All Engine"
);
