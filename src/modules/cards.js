export function calculateCardUsage(card, transactions, monthKey) {
  const cardTransactions = transactions.filter((transaction) => transaction.type === 'expense' && transaction.cardId === card.id);
  const currentBill = cardTransactions
    .filter((transaction) => String(transaction.date || '').startsWith(monthKey))
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const limitUsed = cardTransactions
    .filter((transaction) => !transaction.paid)
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  return { currentBill, limitUsed, available: Math.max(0, Number(card.limit || 0) - limitUsed) };
}
