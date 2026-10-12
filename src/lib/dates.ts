const pad = (n: number) => String(n).padStart(2, '0');
export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayKey = () => dateKey(new Date());
export function dayOffset(key: string, days: number): string {
  const d = new Date(`${key}T12:00:00`);
  d.setDate(d.getDate() + days);
  return dateKey(d);
}
export const fmtDay = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('en-NZ', o);
