export function sumBy(rows, predicate = () => true) {
  return rows.filter(predicate).reduce((sum, row) => sum + Number(row.amount || 0), 0);
}

export function calculateBalance(transactions) {
  const income = sumBy(transactions, (row) => row.type === 'income');
  const expense = sumBy(transactions, (row) => row.type === 'expense');
  return { income, expense, balance: income - expense };
}

export function calculateCommitmentRate(expense, expectedIncome) {
  if (!expectedIncome || expectedIncome <= 0) return 0;
  return Math.round((expense / expectedIncome) * 10000) / 100;
}
