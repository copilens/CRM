export function fmtKz(n: number | string | undefined | null): string {
  const v = Number(n) || 0;
  return v.toLocaleString('pt-PT', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' Kz';
}

export function fmtDate(d: string | undefined | null): string {
  if (!d) return '—';
  const parts = d.split('-');
  if (parts.length !== 3) return d;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // segunda-feira como início
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameMonth(dateStr: string, refDateStr: string): boolean {
  return Boolean(dateStr && refDateStr && dateStr.slice(0, 7) === refDateStr.slice(0, 7));
}

export function isSameYear(dateStr: string, refDateStr: string): boolean {
  return Boolean(dateStr && refDateStr && dateStr.slice(0, 4) === refDateStr.slice(0, 4));
}

export function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
