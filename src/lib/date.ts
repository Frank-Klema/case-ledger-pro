import { format, parseISO, isValid } from 'date-fns';

/** Single source of truth for displaying dates across the app: dd/MM/yyyy. */
export const formatDate = (value?: string | Date | null): string => {
  if (!value) return '-';
  try {
    const d = typeof value === 'string' ? parseISO(value) : value;
    if (!isValid(d)) return '-';
    return format(d, 'dd/MM/yyyy');
  } catch {
    return '-';
  }
};

/** Includes time after the date, still dd/MM/yyyy. */
export const formatDateTime = (value?: string | Date | null): string => {
  if (!value) return '-';
  try {
    const d = typeof value === 'string' ? parseISO(value) : value;
    if (!isValid(d)) return '-';
    return format(d, 'dd/MM/yyyy HH:mm');
  } catch {
    return '-';
  }
};