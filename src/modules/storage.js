export function loadJson(storage, key, fallback) {
  const saved = storage.getItem(key);
  if (!saved) return fallback;
  try {
    return JSON.parse(saved);
  } catch {
    return fallback;
  }
}

export function saveJson(storage, key, value) {
  storage.setItem(key, JSON.stringify(value));
}

export function removeKeys(storage, keys) {
  keys.forEach((key) => storage.removeItem(key));
}
