# Deploy

## Publicação

O Firebase Hosting publica apenas a pasta `public/`.

```bash
firebase deploy
```

No PowerShell deste PC, se `firebase` não estiver no PATH:

```powershell
& "$env:APPDATA\npm\firebase.cmd" deploy
```

## URLs

- PC/Android: `https://meu-financeiro-ec5be.web.app/app-pc.html`
- iPhone: `https://meu-financeiro-ec5be.web.app/app-iphone.html`

## Cache PWA

Ao alterar CSS, JS ou HTML, atualizar:

- query string em `public/dinheiro.html`
- `CACHE_NAME` em `public/sw.js`
- paths cacheados em `public/sw.js`

Exemplo: `financeiro-v1.0.1`.

