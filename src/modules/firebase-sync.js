export function buildUserStatePath(uid) {
  if (!uid) throw new Error('Usuário obrigatório para sincronização.');
  return ['users', uid, 'app', 'state'];
}

export function getPayloadUpdatedAtMs(payload) {
  const directValue = Number(payload?.updatedAtMs);
  if (Number.isFinite(directValue) && directValue > 0) return directValue;
  if (payload?.updatedAt && typeof payload.updatedAt.toMillis === 'function') {
    return payload.updatedAt.toMillis();
  }
  return 0;
}

