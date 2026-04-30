export const APP_ENV = {
  appVersion: '1.2.0',
  schemaVersion: 2,
  productionHosts: ['meu-financeiro-ec5be.web.app', 'meu-financeiro-ec5be.firebaseapp.com'],
  localHosts: ['localhost', '127.0.0.1', '::1']
};

export function getRuntimeEnvironment(locationLike = globalThis.location) {
  const hostname = locationLike?.hostname || '';
  if (APP_ENV.productionHosts.includes(hostname)) return 'production';
  if (APP_ENV.localHosts.includes(hostname) || locationLike?.protocol === 'file:') return 'dev';
  return 'staging';
}

export function isLocalAuthAllowed(locationLike = globalThis.location) {
  return getRuntimeEnvironment(locationLike) === 'dev';
}
