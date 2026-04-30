export function calculateReserveProgress(reserve) {
  const target = Number(reserve.target || 0);
  const saved = Number(reserve.saved || 0);
  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((saved / target) * 10000) / 100));
}
