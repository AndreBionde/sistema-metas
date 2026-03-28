# PlanoMeta

Aplicação React para planejamento financeiro pessoal com:

- login Google
- sincronização exclusiva em nuvem com Firebase
- suporte a múltiplos anos
- metas por categoria, prioridade e status
- exportação de relatórios em CSV, XLSX, PDF e DOCX
- backup restaurável em JSON

## Fluxo do projeto

O projeto opera em fluxo único na branch `main`.

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
- `REACT_APP_USE_MOCK_SERVICES`

## Persistência e recuperação

O sistema usa autenticação Google com Firestore como fonte de verdade da conta.
Novas contas começam sem metas para que cada usuário monte o próprio planejamento.

Política recomendada de backup:

1. Exporte um backup JSON antes de resets ou mudanças grandes.
2. Use CSV, XLSX, PDF e DOCX como relatórios, não como restauração completa.
3. Restaure a conta apenas com arquivos JSON gerados pelo próprio sistema.

## Sincronização

O app usa revisão de documento no Firestore e tenta conciliar alterações concorrentes antes de sobrescrever a nuvem. Isso reduz perda silenciosa de dados em uso multi-dispositivo.

## Segurança e deploy

- `App Check` opcional para endurecer o acesso ao Firebase
- headers de segurança e CSP em `public/_headers`
- fallback SPA em `public/_redirects`
- regras do Firestore em `firestore.rules`

## Scripts

- `npm run start`
- `npm run start:e2e`
- `npm run build`
- `npm run test:ci`
- `npm run e2e`
- `npm run e2e:headed`

## Testes

Além dos testes utilitários, o projeto inclui testes E2E com Playwright cobrindo:

- login
- criação de meta
- persistência após reload
- exportação e restauração de backup JSON
