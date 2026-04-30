# Modelo de Dados

## Profile

Preferências principais da pessoa usuária: nome, renda esperada, objetivo, dia de pagamento, meta de reserva, nível de reserva e limite de comprometimento.

## Transaction

Lançamento financeiro. Pode ser receita ou despesa.

Campos principais:

- `id`
- `desc`
- `amount`
- `type`
- `date`
- `category`
- `necessity`
- `paid`
- `cardId`
- `plannedBillId`
- `installmentGroupId`
- `recurringGroupId`

## Card

Cartão de crédito.

Campos principais:

- `id`
- `name`
- `limit`
- `closingDay`
- `dueDay`
- `color`

## PlannedBill

Conta prevista ou recorrente.

Campos principais:

- `id`
- `name`
- `amount`
- `dueDate`
- `day`
- `repeatMonthly`
- `category`
- `necessity`
- `cardId`
- `active`

## Reserve

Reserva financeira.

Campos principais:

- `id`
- `name`
- `target`
- `saved`
- `monthlyGoal`

## Investment

Investimento manual ou ativo acompanhado.

Campos principais:

- `id`
- `name`
- `type`
- `code`
- `quantity`
- `initialAmount`
- `monthlyContribution`
- `monthlyRate`
- `startDate`
- `notes`

## Backup

Formato atual:

```json
{
  "appVersion": "1.1.0",
  "schemaVersion": 2,
  "createdAt": "2026-04-30T00:00:00.000Z",
  "reason": "manual",
  "profile": {},
  "reserves": [],
  "plannedBills": [],
  "investments": [],
  "cards": [],
  "transactions": []
}
```

## Goal

Meta financeira simples.

Campos principais:

- `id`
- `name`
- `target`
- `saved`
- `createdAt`
- `updatedAt`

## Tags

Transações podem ter `tags`, uma lista curta de textos normalizados. Elas entram na busca global e na busca do histórico.

