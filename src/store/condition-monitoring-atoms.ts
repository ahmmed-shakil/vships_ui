'use client';

import { engineData, type Ship } from '@/data/nura/ships';
import { atom } from 'jotai';

/**
 * Condition Monitoring page — shared atoms.
 * Used by both the header selectors and the page content.
 */

/** Selected vessel — starts null, set to first API vessel on load */
export const selectedShipAtom = atom<Ship>(null as unknown as Ship);

/** Selected engine option */
export const selectedEngineAtom = atom(engineData[0]);

/** Selected time range preset */
export const selectedTimeAtom = atom<string>('7d');

/** Custom date range (only used when selectedTime === 'Custom Time') */
export const dateRangeAtom = atom<[Date | null, Date | null]>([null, null]);
