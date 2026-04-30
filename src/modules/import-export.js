export function createBackupPayload({ appVersion, schemaVersion, state, reason = 'manual' }) {
  return {
    appVersion,
    schemaVersion,
    createdAt: new Date().toISOString(),
    reason,
    profile: state.profile,
    reserves: state.reserves,
    plannedBills: state.plannedBills,
    investments: state.investments,
    cards: state.cards,
    transactions: state.transactions
  };
}

export function assertSupportedBackup(payload, currentSchemaVersion) {
  if (!payload || typeof payload !== 'object') throw new Error('Backup inválido.');
  if (payload.schemaVersion && Number(payload.schemaVersion) > currentSchemaVersion) {
    throw new Error('Backup de versão futura.');
  }
}

