import { isLocalAuthAllowed } from '../config/env.js';

export function resolveAuthMode({ authParam, appMode, savedMode, locationLike }) {
  if (authParam === 'local' && !isLocalAuthAllowed(locationLike)) return 'firebase';
  if (authParam === 'local' || authParam === 'firebase') return authParam;
  if (appMode === 'pc' || appMode === 'iphone') return 'firebase';
  if (savedMode === 'local' && !isLocalAuthAllowed(locationLike)) return 'firebase';
  return savedMode === 'firebase' ? 'firebase' : 'local';
}

export function isDevCredential(email, password) {
  return email === 'adm' && password === 'adm';
}
