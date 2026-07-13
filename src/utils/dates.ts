import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/** `2026-05-25` → `25 mai`. */
export function formatShortDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'dd MMM', { locale: ptBR }).replace('.', '');
  } catch {
    return isoDate;
  }
}

/** `2026-05-25` → `25 mai 2026`. */
export function formatLongDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), "dd MMM yyyy", { locale: ptBR }).replace('.', '');
  } catch {
    return isoDate;
  }
}

/** Today as `YYYY-MM-DD` for form defaults. */
export function todayISODate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
