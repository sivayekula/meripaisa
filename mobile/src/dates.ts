export type Filter = 'today' | 'month' | 'year' | 'custom';
export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
export const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export function rangeFor(f: Filter, custom?: { from: Date; to: Date }) {
  const n = new Date();
  let from: Date, to: Date;
  if (f === 'today') { from = startOfDay(n); to = endOfDay(n); }
  else if (f === 'month') { from = new Date(n.getFullYear(), n.getMonth(), 1); to = endOfDay(new Date(n.getFullYear(), n.getMonth() + 1, 0)); }
  else if (f === 'year') { from = new Date(n.getFullYear(), 0, 1); to = endOfDay(new Date(n.getFullYear(), 11, 31)); }
  else { from = startOfDay(custom!.from); to = endOfDay(custom!.to); }
  return { from: from.toISOString(), to: to.toISOString() };
}
export const fmtDate = (d: string | Date) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
export const money = (n: number, cur = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: cur, maximumFractionDigits: 2 }).format(n || 0);
