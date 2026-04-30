# Plano de Testes

## Comandos

```bash
npm run serve
npm run test:year
```

## Cobertura atual

`tests/smoke.spec.js`:

- abre o app;
- login local;
- receita;
- despesa;
- cartão;
- compra no cartão;
- compra parcelada;
- conta prevista mensal;
- marcar conta como paga;
- reserva financeira;
- investimento manual;
- exportar backup;
- importar JSON;
- restaurar backup local;
- limpar dados com confirmação forte;
- tema claro/escuro;
- filtro do histórico;
- PWA/service worker básico.
- metas financeiras;
- tags;
- busca global;
- exportação CSV;
- fechamento mensal inicial.

`tests/year-audit.js`:

- entra com a conta de teste;
- importa 12 meses de dados;
- valida salvamento local;
- recarrega o app;
- confere dados em abril de 2026;
- audita desktop e mobile;
- verifica rolagem horizontal e erros de console.

## Próximos testes

- Importação inválida.
- Backup de versão futura.
- Integridade com dados corrompidos.
- Fluxos Firebase reais com conta de teste.
- Responsividade por screenshot.

