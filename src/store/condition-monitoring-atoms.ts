'use client';

import { engineData, shipData, type Ship } from '@/data/nura/ships';
import { atom } from 'jotai';

/**
 * Condition Monitoring page — shared atoms.
 * Used by both the header selectors and the page content.
 */

/** Selected vessel */
export const selectedShipAtom = atom<Ship>(shipData[0]);

/** Selected engine option */
export const selectedEngineAtom = atom(engineData[0]);

/** Selected time range preset */
export const selectedTimeAtom = atom<string>('7d');

/** Custom date range (only used when selectedTime === 'Custom Time') */
export const dateRangeAtom = atom<[Date | null, Date | null]>([null, null]);
