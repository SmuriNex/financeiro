# Arquitetura

## Estado atual

O app roda como PWA estático publicado pelo Firebase Hosting. Os arquivos publicados ficam em `public/`.

Principais partes:

- `public/dinheiro.html`: tela principal.
- `public/assets/css/styles.css`: estilos e responsividade.
- `public/assets/js/app.js`: aplicação atual.
- `public/sw.js`: cache PWA.
- `firestore.rules`: regra de acesso por usuário.
- `serve_local.py`: servidor local com proxy da AwesomeAPI.
- `tests/year-audit.js`: teste de carga funcional com 12 meses de dados.

## Próxima modularização

O arquivo `public/assets/js/app.js` ainda concentra responsabilidades demais. A extração deve ser incremental, sempre com teste antes e depois. A pasta `src/` já contém os módulos de destino e seus contratos iniciais.

Ordem sugerida:

1. `validators.js`: normalização de valores, datas, dinheiro e entidades.
2. `finance-calculations.js`: cálculos mensais, diagnósticos e previsões.
3. `storage.js`: localStorage, backup e migrações.
4. `firebase-sync.js`: leitura/escrita no Firestore.
5. `auth.js`: login Firebase e modo local.
6. Módulos de domínio: cartões, contas previstas, reservas e investimentos.
7. `ui-render.js` e `dom-cache.js`: renderização e cache de elementos.

## Regra de segurança

Não mover várias áreas ao mesmo tempo. Cada extração precisa preservar comportamento e passar nos testes Playwright.

## Módulos criados

- `src/config/env.js`
- `src/modules/storage.js`
- `src/modules/auth.js`
- `src/modules/firebase-sync.js`
- `src/modules/finance-calculations.js`
- `src/modules/cards.js`
- `src/modules/planned-bills.js`
- `src/modules/reserves.js`
- `src/modules/investments.js`
- `src/modules/import-export.js`
- `src/modules/validators.js`
- `src/modules/ui-render.js`
- `src/modules/dom-cache.js`

