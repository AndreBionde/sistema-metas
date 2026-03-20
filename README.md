# PlanoMeta

Aplicação React para planejamento financeiro com:

- login Google
- sincronização exclusiva em nuvem com Firebase
- suporte a múltiplos anos
- exportação de relatórios em CSV, XLSX e PDF
- backup restaurável em JSON
- monitoramento opcional com Sentry e analytics

## Fluxo do projeto

O projeto opera em um fluxo único na branch `main`.

## Firebase

Para habilitar autenticação Google e Firestore:

1. Crie um projeto no Firebase.
2. Ative `Authentication` com provedor Google.
3. Ative `Cloud Firestore`.
4. Preencha as variáveis `REACT_APP_FIREBASE_*` no arquivo `.env`.
5. Adicione `localhost` e os domínios publicados em `Authorized domains`.
6. Publique as regras do Firestore.
7. Se quiser endurecimento extra em produção, configure `App Check`.

Variáveis usadas:

- `REACT_APP_NAME`
- `REACT_APP_ENABLE_PWA`
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`
- `REACT_APP_FIREBASE_APP_CHECK_KEY`
- `REACT_APP_ANALYTICS_ID`
- `REACT_APP_SENTRY_DSN`
- `REACT_APP_USE_MOCK_SERVICES`

## Persistência e recuperação

O sistema usa autenticação Google com Firestore como única fonte de verdade.
Novas contas começam sem metas para que cada usuário monte o próprio planejamento.

Política recomendada de backup:

1. Exportar um backup JSON antes de resets ou mudanças grandes.
2. Usar CSV, XLSX e PDF como relatórios, não como restauração completa.
3. Restaurar a conta apenas com arquivos JSON gerados pelo próprio sistema.

## Sincronização

O app usa sincronização com controle de revisão no documento e tenta conciliar alterações concorrentes antes de sobrescrever a nuvem. Isso reduz perda silenciosa de dados em uso multi-dispositivo.

## Monitoramento e segurança

- `Sentry` opcional para erros em produção
- `GA4` opcional para analytics e web vitals
- `App Check` opcional para endurecer acesso ao Firebase
- headers de segurança e CSP em `public/_headers`
- fallback SPA em `public/_redirects`

## Scripts

- `npm run start`
- `npm run start:e2e`
- `npm run build`
- `npm run test:ci`
- `npm run e2e`
- `npm run e2e:headed`

## Testes

Além dos testes utilitários, o projeto agora inclui testes E2E com Playwright cobrindo:

- login
- criação de meta
- persistência após reload
- exportação e restauração de backup JSON
