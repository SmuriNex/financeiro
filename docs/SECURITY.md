# Segurança

## Firebase

A chave web do Firebase pode ficar no front-end. A proteção real vem de:

- Authentication habilitado.
- Firestore rules por `uid`.
- Domínios autorizados no Firebase Auth.

## Modo local

O login `adm/adm` é apenas para desenvolvimento local.

Ele só deve funcionar em:

- `localhost`
- `127.0.0.1`
- arquivo local

Em produção, `?auth=local` deve ser ignorado e o app deve usar Firebase.

## Ações destrutivas

Limpar dados exige confirmação digitando `APAGAR`.

