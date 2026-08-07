/**
 * Wave size formatting. The API stores and the UI displays `waveSize` in
 * METERS — no conversion needed.
 */

/** Round to `decimals` places (default 1) for display. */
export function roundTo(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Format a meters value as a pt-BR meter label, e.g. `1,4 m`. */
export function formatWaveSize(meters: number, decimals = 1): string {
  const rounded = roundTo(meters, decimals);
  return `${rounded.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} m`;
}
