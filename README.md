# PlanoMeta

Aplicação web para planejamento financeiro pessoal: defina metas por categoria e prioridade, registre aportes mês a mês, acompanhe a evolução com indicadores e insights automáticos, e mantenha tudo sincronizado na nuvem entre dispositivos.

**[goal-hub.netlify.app](https://goal-hub.netlify.app/)**

![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-ffca28?logo=firebase&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8?logo=pwa&logoColor=white)
![Tests](https://img.shields.io/badge/tests-Jest%20%2B%20Playwright-2e8b57?logo=testing-library&logoColor=white)
![Netlify](https://img.shields.io/badge/deploy-Netlify-00c7b7?logo=netlify&logoColor=white)

## Índice

- [Visão geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Stack técnica](#stack-técnica)
- [Rodando localmente](#rodando-localmente)
- [Firebase](#firebase)
- [Sincronização e persistência](#sincronização-e-persistência)
- [Segurança e deploy](#segurança-e-deploy)
- [Scripts](#scripts)
- [Testes](#testes)

## Visão geral

O PlanoMeta ajuda a planejar e acompanhar metas financeiras ao longo do ano: quanto guardar por mês, em qual categoria, com qual prioridade, e o quanto já foi realizado. A conta do usuário é a fonte de dados (login Google + Firestore), então o planejamento acompanha a pessoa em qualquer dispositivo, sem depender de planilhas soltas.

## Funcionalidades

- **Login com Google** e conta pessoal isolada por usuário (regras do Firestore restringem cada documento ao próprio `uid`)
- **Metas por categoria, prioridade e status** (ativa, pausada, concluída), com valor-alvo e aporte mensal planejado
- **Tabela mensal de aportes**, com observações por mês e cálculo automático de totais, médias e progresso
- **Múltiplos anos** de planejamento, com criação, comparação e exclusão de ciclos
- **Painel de insights estratégicos**: comparação entre anos, tendência trimestral, projeção de conclusão do ciclo e histórico consolidado
- **Painel de inteligência de planejamento**: alertas automáticos sobre metas atrasadas, ritmo de aporte insuficiente e prioridades em risco
- **Governança de dados**: log de atividade, log de backups, lixeira com restauração de metas excluídas e de resets de ano
- **Exportação de relatórios** em CSV, XLSX, PDF e DOCX
- **Backup e restauração completa** via arquivo JSON gerado pelo próprio sistema
- **PWA instalável**, com prompt de instalação nativo e modo standalone
- **Tema claro/escuro**

## Stack técnica

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, Create React App (`react-scripts`), CSS modular por componente |
| Backend / dados | Firebase Authentication (Google), Cloud Firestore |
| Exportação | `xlsx`, `jspdf` + `jspdf-autotable`, `docx` |
| Testes | Jest + Testing Library (unidade), Playwright (E2E) |
| Deploy | Netlify, com `_headers` (CSP e hardening) e `_redirects` (fallback SPA) |

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha as variáveis do Firebase
npm start
```

A aplicação sobe em `http://localhost:3000`.

Para desenvolver sem depender de um projeto Firebase real, use os serviços mock:

```bash
npm run start:e2e
```

## Firebase

Para habilitar autenticação Google e Firestore:

1. Crie um projeto no Firebase.
2. Ative `Authentication` com provedor Google.
3. Ative `Cloud Firestore`.
4. Preencha as variáveis `REACT_APP_FIREBASE_*` no arquivo `.env`.
5. Adicione `localhost` e os domínios publicados em `Authorized domains`.
6. Publique as regras do Firestore (`firestore.rules`).
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

## Sincronização e persistência

O Firestore é a fonte de verdade da conta: contas novas começam sem metas para que cada usuário monte o próprio planejamento do zero. O app usa revisão de documento e tenta conciliar alterações concorrentes antes de sobrescrever a nuvem, reduzindo perda silenciosa de dados em uso multi-dispositivo.

Política recomendada de backup:

1. Exporte um backup JSON antes de resets ou mudanças grandes.
2. Use CSV, XLSX, PDF e DOCX como relatórios, não como restauração completa.
3. Restaure a conta apenas com arquivos JSON gerados pelo próprio sistema.

## Segurança e deploy

- Regras do Firestore restringem cada documento ao `uid` autenticado (`firestore.rules`)
- `App Check` opcional para endurecer o acesso ao Firebase
- Headers de segurança e CSP em `public/_headers`
- Fallback de SPA em `public/_redirects`
- Deploy contínuo na `main` via Netlify: **[goal-hub.netlify.app](https://goal-hub.netlify.app/)**

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run start` | Ambiente de desenvolvimento |
| `npm run start:e2e` | Desenvolvimento com serviços mock (sem Firebase real) |
| `npm run build` | Build de produção |
| `npm run test:ci` | Testes unitários (modo CI) |
| `npm run e2e` | Testes E2E com Playwright |
| `npm run e2e:headed` | Testes E2E com navegador visível |

## Testes

Além dos testes utilitários (cálculos, formatação, storage, insights), o projeto inclui testes E2E com Playwright cobrindo:

- Login
- Criação de meta
- Persistência após reload
- Exportação e restauração de backup JSON
