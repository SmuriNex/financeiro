# Backup e Restauração

## Exportar backup

Use o botão de escudo na barra superior.

O app baixa um arquivo com data:

```text
backup-financeiro-2026-04-30.json
```

O mesmo backup também fica guardado no histórico local do navegador. O histórico local mantém os 5 backups mais recentes.

## Importar dados

Ao importar JSON, o app:

1. valida o formato;
2. verifica versão de schema;
3. cria um backup local antes de alterar os dados atuais;
4. pergunta se deve substituir ou mesclar;
5. sincroniza com a nuvem quando há conta Firebase conectada.

## Restaurar último backup local

Use o botão de relógio na barra superior.

A restauração exige digitar:

```text
RESTAURAR
```

Antes de restaurar, o app cria outro backup local do estado atual.

## Migração

Backups sem `schemaVersion` são tratados como schema `1` e migrados para schema `2`.

