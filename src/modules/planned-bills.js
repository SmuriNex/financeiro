export function getBillDueDateForMonth(bill, monthKey) {
  const day = Math.max(1, Math.min(31, Number(bill.day || String(bill.dueDate || '').slice(8, 10) || 1)));
  const date = new Date(`${monthKey}-01T00:00:00`);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return `${monthKey}-${String(Math.min(day, lastDay)).padStart(2, '0')}`;
}
