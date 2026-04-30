# Painel Financeiro

Organizador financeiro pessoal em HTML, CSS e JavaScript puro, publicado como PWA pelo Firebase Hosting.

## Estrutura

- `public/`: arquivos publicados no Firebase Hosting.
- `public/dinheiro.html`: tela principal.
- `public/assets/css/styles.css`: estilos e responsividade.
- `public/assets/js/app.js`: aplicação atual.
- `public/sw.js`: service worker do PWA.
- `tests/year-audit.js`: teste automatizado de 12 meses de uso.
- `docs/`: documentação de arquitetura, deploy, segurança, testes e roadmap.
- `prototypes/`: protótipos fora da publicação.

## Rodar local

```bash
npm run serve
```

Ou execute:

```bat
iniciar-painel-local.bat
```

## Testar

```bash
npm run test:year
```

## Deploy

```bash
firebase deploy
```

Se o PowerShell não encontrar `firebase`:

```powershell
& "$env:APPDATA\npm\firebase.cmd" deploy
```

## URLs

- PC/Android: `https://meu-financeiro-ec5be.web.app/app-pc.html`
- iPhone: `https://meu-financeiro-ec5be.web.app/app-iphone.html`

## Segurança

O modo local `adm/adm` é permitido somente em ambiente local. Em produção, o app usa Firebase Authentication.
