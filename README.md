# PlanoMeta

Aplicacao React para planejamento financeiro com:

- login Google
- sincronizacao exclusiva em nuvem com Firebase
- suporte a multiplos anos
- exportacao de relatorios em CSV, XLSX e PDF

## Fluxo do projeto

O projeto opera em um fluxo unico na branch `main`.

## Firebase

Para habilitar autenticacao Google e Firestore:

1. Crie um projeto no Firebase
2. Ative Authentication com provedor Google
3. Ative Cloud Firestore
4. Preencha as variaveis `REACT_APP_FIREBASE_*` no arquivo `.env` usado no projeto
5. Adicione `localhost` e os dominios publicados em `Authorized domains`

Variaveis usadas:

- `REACT_APP_NAME`
- `REACT_APP_ENABLE_PWA`
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`

## Scripts

- `npm run start`
- `npm run build`
- `npm run test:ci`

## Persistencia

O sistema usa autenticacao Google com Firestore como unica fonte de verdade.
Novas contas comecam sem metas para que cada usuario monte o proprio planejamento.

## Exportacoes

- CSV do ano selecionado
- XLSX com abas por ano
- PDF detalhado com metas, progresso, aportes mensais e observacoes
