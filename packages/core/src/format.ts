export function fmtMoney(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export function fmtUnits(n: number): string {
  return (Math.round(n * 10) / 10).toLocaleString('en-IN');
}

export function initialsFor(email: string | null | undefined): string {
  return (email || '??').slice(0, 2).toUpperCase();
}
