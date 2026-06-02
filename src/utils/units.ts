/**
 * Wave size unit conversion. The API stores `waveSize` in FEET; the UI shows
 * and inputs METERS. Convert only at the API boundary — never scatter 0.3048.
 * See SPEC_FRONTEND_StyleGuide.md §8.
 */
export const FEET_PER_METER = 0.3048;

export function metersToFeet(meters: number): number {
  return meters / FEET_PER_METER;
}

export function feetToMeters(feet: number): number {
  return feet * FEET_PER_METER;
}

/** Round to `decimals` places (default 1) for display. */
export function roundTo(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Convert feet (API) → meters for display, rounded to 1 decimal. */
export function feetToMetersDisplay(feet: number, decimals = 1): number {
  return roundTo(feetToMeters(feet), decimals);
}

/** Format a feet value as a pt-BR meter label, e.g. `1,4 m`. */
export function formatWaveSize(feet: number, decimals = 1): string {
  const meters = feetToMetersDisplay(feet, decimals);
  return `${meters.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} m`;
}
