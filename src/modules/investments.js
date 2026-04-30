export function projectInvestmentValue(investment, months) {
  const monthlyRate = Number(investment.monthlyRate || 0) / 100;
  let value = Number(investment.initialAmount || 0);
  for (let index = 0; index < months; index += 1) {
    value = value * (1 + monthlyRate) + Number(investment.monthlyContribution || 0);
  }
  return Math.round(value * 100) / 100;
}
