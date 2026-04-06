# LoteMap - Guia Mestre de Execução (MVP)

Este README consolida os documentos do projeto em um plano unico, do inicio ate a conclusao do MVP, para implementarmos parte por parte com seguranca.

## Objetivo do projeto

Construir um SaaS multiempresa para loteamentos que permita:
- operacao interna (dashboard, cadastros, status, dados internos)
- exposicao publica (landing page por loteamento)
- interacao comercial (planta SVG clicavel + CTA WhatsApp)

## O que entra no MVP

- autenticacao e autorizacao no servidor
- multiempresa e multiloteamento
- CRUD de cidades, loteamentos, quadras e lotes
- landing page publica por loteamento
- planta SVG interativa com zoom/pan e selecao de lote
- dados publicos e internos segregados
- CTA de WhatsApp (flutuante + contextual por lote)

## Fora do MVP (pos-versao inicial)

- CRM completo e funil estruturado
- importacao automatica inteligente de DWG/DXF
- georreferenciamento avancado
- billing, white-label e subdominios
- reserva online, assinatura e portal de corretor

## Stack e decisoes definidas

- Frontend/Backend: `Next.js (App Router)` + `TypeScript`
- UI: `Tailwind CSS` + `shadcn/ui`
- Banco: `PostgreSQL` + `Prisma`
- Auth: `NextAuth` (v4, credentials + JWT) — variaveis `NEXTAUTH_URL`, `NEXTAUTH_SECRET` ou `AUTH_SECRET`
- Forms/validacao: `React Hook Form` + `Zod` (auth e regras pontuais; formularios admin ainda em HTML + server actions)
- Mapa: `SVG interativo` + `react-zoom-pan-pinch`
- Deploy: `Vercel`
- Storage: `Cloudinary` ou `S3`

Decisoes principais (ADRs):
- UI com `shadcn/ui + Tailwind` para velocidade e consistencia
- mapa baseado em `SVG`, sem GIS complexo no MVP
- modelagem multi-tenant desde o inicio
- WhatsApp por loteamento como canal comercial padrao

## Arquitetura de referencia

- Camada de apresentacao: paginas, layouts, componentes
- Camada de aplicacao: services/use-cases, politicas, validacoes
- Camada de dominio: regras de negocio (status, visibilidade, etc.)
- Camada de infraestrutura: Prisma, auth, storage, integracoes

Padroes obrigatorios:
- server-first quando possivel
- autorizacao no servidor
- validacao por schema
- paginas publicas com SSR/ISR (quando fizer sentido)

## Modelo de dados do MVP

Entidades nucleares:
- `Company`
- `User`
- `City`
- `Development`
- `Block`
- `Lot`
- `LotOwnerInfo`
- `LotHistory`

Convecoes importantes:
- `geometryRef` no lote para vinculo com elementos do SVG
- slugs unicos em cidade/loteamento
- enums de status publicos e internos
- dados internos nunca expostos em endpoints/public pages

## Rotas previstas

Publica:
- `/{city}/{development}` (equivalente a `/[city]/[development]`)

Admin:
- `/admin`
- `/admin/companies` (superadmin)
- `/admin/cities`
- `/admin/developments`
- `/admin/blocks`
- `/admin/lots` (e `/admin/lots/[lotId]` comprador/histórico)
- `/admin/users` (gestão de usuários, superadmin)
- `/admin/login`

## Plano de execucao ate a conclusao

### Fase 0 - Setup da fundacao
1. Criar projeto Next.js com TypeScript
2. Configurar Tailwind e base visual
3. Instalar e configurar shadcn/ui
4. Configurar Prisma e PostgreSQL
5. Configurar NextAuth (v4, credentials)
6. Organizar estrutura de pastas inicial

Entregavel da fase:
- projeto sobe localmente com auth e banco conectados

### Fase 1 - Base de dominio (schema e regras)
1. Criar schema inicial com entidades principais
2. Criar migrations pequenas e consistentes
3. Definir enums de status
4. Implementar relacoes e constraints essenciais
5. Preparar seeds minimos para desenvolvimento

Entregavel da fase:
- banco modelado e pronto para CRUDs

### Fase 2 - Dashboard inicial
1. Login e protecao das rotas admin
2. Layout base do painel
3. CRUD de cidades
4. CRUD de loteamentos
5. CRUD de quadras
6. CRUD de lotes (dados publicos + internos)

Entregavel da fase:
- operacao interna funcional para cadastro e manutencao

### Fase 3 - Planta interativa
1. Upload de SVG saneado
2. Estrategia de vinculo por `geometryRef`
3. Renderizacao da planta
4. Zoom/pan
5. Selecao do lote (desktop e mobile)
6. Colorizacao por status e legenda

Entregavel da fase:
- planta navegavel e integrada aos lotes

### Fase 4 - Landing page publica
1. Rota publica por loteamento
2. Hero e secoes institucionais
3. Planta interativa na pagina publica
4. Drawer/modal de detalhes do lote
5. Botao flutuante de WhatsApp
6. CTA contextual por lote com mensagem pre-preenchida

Entregavel da fase:
- pagina publica pronta para conversao comercial

### Fase 5 - Dados internos e historico
1. Edicao de dados de comprador
2. Observacoes internas
3. Historico de alteracoes por usuario/data
4. Garantia de segregacao publico x interno

Entregavel da fase:
- governanca operacional e rastreabilidade basica

### Fase 6 - Polimento e qualidade
1. Responsividade fina
2. Validacoes de ponta a ponta
3. Acessibilidade minima
4. Estados vazios e mensagens de erro
5. SEO basico da landing page
6. Revisao final com criterios de aceite

Entregavel da fase:
- MVP pronto para uso real com qualidade minima

## Criterios de conclusao do MVP

Consideramos o MVP concluido quando:
- empresa cadastra loteamento sem apoio tecnico
- gestor cadastra e atualiza lotes/quadras em poucos cliques
- landing page publica funciona e exibe planta interativa
- visitante clica em lote e abre WhatsApp com contexto
- dados internos permanecem protegidos no backend e no frontend publico

## Checklist mestre (acompanhamento)

**Ultima revisao do codigo:** 2026-04 — README + `specs/mvp-checklist.md` sincronizados com o repositorio; `docs/05*` descrevem visao alvo (alguns itens ainda nao implementados).

### Fases (macro)

| Fase | Nome | Status |
|------|------|--------|
| 0 | Setup da fundacao | **Concluida** (dev local, Prisma+PG, Tailwind, auth, proxy Next 16) |
| 1 | Base de dominio (Prisma) | **Concluida** (schema + migrations + seed) |
| 2 | Dashboard inicial | **Concluida** (CRUD + `/admin/users`; opcional: tela **Empresas** e métricas na home) |
| 3 | Planta interativa | **Quase concluida** (preview admin + URL pública; **upload** para storage opcional) |
| 4 | Landing publica | **Quase concluida** (hero, sobre, local, planta, WhatsApp; **drawer** opcional) |
| 5 | Dados internos e historico | **Concluida** (comprador + historico no admin; gravacao em edicao de lote e em dados do comprador) |
| 6 | Polimento | **Em andamento** |

### Fundacao
- [x] projeto Next.js + TypeScript (App Router)
- [x] Tailwind CSS (v4 + `@tailwindcss/postcss`)
- [x] **shadcn/ui** (`npx shadcn init`, estilo `base-nova`, `components.json`; tema em `globals.css`; componentes em `src/components/ui/`)
- [x] Prisma + PostgreSQL (`prisma.config.ts`, migrations)
- [x] Prisma Client com **`@prisma/adapter-pg` + `pg`** (requisito Prisma 7)
- [x] NextAuth v4 (credenciais: **bcrypt** em `User.passwordHash` + fallback bootstrap `ADMIN_EMAIL`/`ADMIN_PASSWORD` se usuário existir sem hash)
- [x] `NEXTAUTH_URL` configurado (evita erro de callback / CredentialsSignin)
- [x] Estrutura de pastas base (`src/app`, `src/lib`, `src/services`, etc.)
- [x] Convencao **`src/proxy.ts`** (substitui `middleware` no Next 16)

### Dominio — modelagem Prisma (todas as tabelas do MVP inicial)
- [x] `Company`
- [x] `User`
- [x] `City`
- [x] `Development`
- [x] `Block`
- [x] `Lot`
- [x] `LotOwnerInfo`
- [x] `LotHistory`
- [x] Seed de desenvolvimento (`npm run prisma:seed` + `package.json` → `prisma.seed`)

### Dominio — telas / fluxos admin (CRUD ou gestao)
- [x] **Empresas** (`/admin/companies`): CRUD superadmin; remoção bloqueada se houver loteamentos
- [x] **Usuarios** (`/admin/users`): listagem + CRUD (restrito a **Superadmin**); login do painel segue `ADMIN_EMAIL` no `.env`
- [x] **Cidades** (`/admin/cities`): CRUD
- [x] **Loteamentos** (`/admin/developments`): CRUD (empresa + cidade + slug unico por cidade)
- [x] **Quadras** (`/admin/blocks`): CRUD por loteamento (filtro via `?developmentId=`)
- [x] **Lotes** (`/admin/lots`): CRUD por loteamento + quadra (`?developmentId=` e `blockId=`)
- [x] **Dados internos do lote (comprador)**: pagina `/admin/lots/[lotId]` com `LotOwnerInfo`
- [x] **Historico** (`LotHistory`): listagem na pagina do lote; gravacao em salvar comprador (`LOT_OWNER_INFO_SAVE`) e ao salvar lote na lista (`LOT_UPDATE`)

### Dashboard (comportamento)
- [x] Login (`/admin/login`) + logout — feedback de erro (`signIn` sem redirect + `AdminCallout`), loading, tratamento de `?error=CredentialsSignin`, layout em cartão e link “Voltar ao site”
- [x] Protecao do painel: `getSession` no layout `(dashboard)` (rotas publicas de login fora do grupo)
- [x] Layout com navegacao (Visao geral, Cidades, Loteamentos, Quadras, Lotes, Usuarios)
- [x] Listagem / cadastro / edicao de loteamentos (na propria lista)

### Planta — preview no admin
- [x] Campo **URL da planta SVG** (`mapSvgUrl`) no CRUD de loteamentos
- [x] Pagina **`/admin/developments/[id]/map`**: carrega SVG (fetch servidor), zoom/pan (`react-zoom-pan-pinch`), cores por status publico, clique por `geometryRef` (id ou `data-lot-id` no SVG)
- [ ] Upload de SVG para storage (hoje apenas URL publica)
- [x] Mesmo componente de planta na landing (`DevelopmentMapPreview` `variant="public"`)

### Publico (`/{city}/{development}`)
- [x] Rota publica (`src/app/(public)/[city]/[development]/page.tsx`)
- [x] Hero (nome, cidade, descricao curta, CTAs)
- [x] Secao **Sobre** (`fullDescription`) e **Localizacao** (`address`) quando preenchidos
- [x] Planta SVG (mesmo componente de preview, `variant="public"`) + URL absoluta/relativa via `getRequestOrigin`
- [x] Painel do lote selecionado (dados publicos apenas) + **CTA WhatsApp** por lote
- [x] Botao flutuante WhatsApp (mensagem padrao)
- [x] `generateMetadata` basico (title / description / OG)
- [ ] Drawer/modal dedicado (hoje painel abaixo da planta; pode evoluir)
- [ ] Garantia extra: revisar qualquer nova API publica para nao vazar campos internos

### Qualidade
- [x] Responsividade revisada ponta a ponta (parcial: painel admin — padding mobile, menu com rolagem horizontal, selects de filtro em largura total no mobile)
- [x] Permissao basica (sessao obrigatoria no admin) — **escopo por empresa** para Admin/Gestor (`getAdminDataScope` em loteamentos/quadras/lotes/planta/detalhe do lote); login continua **uma credencial** `.env`; superadmin vê tudo
- [x] SEO basico na landing (canonical, OG/Twitter, `NEXT_PUBLIC_SITE_URL` / Vercel para URLs absolutas)
- [x] Mensagens de erro e estados vazios consistentes (componente `AdminCallout` + textos orientando próximo passo)
- [x] Acessibilidade parcial (skip link na landing publica, foco visivel global, menu admin com `aria-current`, regiao da planta com `aria-label`)
- [ ] Testes automatizados (nao previstos ainda)

### Itens fora do checklist original mas importantes
- [x] Instalar **shadcn/ui** (dependencias + `components.json`; botões em login e logout como referência)
- [ ] **Storage** de SVG/banner/logo (Cloudinary/S3) + campos so URL hoje
- [x] Navegação de docs: README e plano de fases usam **NextAuth v4** (não Auth.js v5); `docs/08` alinhado

## Como vamos executar parte por parte

Fluxo de trabalho sugerido para nossa execucao:
1. Selecionar uma fase (ou subfase) por vez
2. Quebrar em tarefas pequenas e testaveis
3. Implementar
4. Validar com criterios de aceite da etapa
5. Marcar checklist
6. Partir para a proxima parte

Regra pratica:
- nao avancar para a proxima fase sem validar a anterior

## Ordem de leitura e uso dos arquivos

1. `docs/00-product-overview.md`
2. `docs/01-mvp-scope.md`
3. `docs/02-architecture.md`
4. `docs/03-data-model.md`
5. `docs/04-public-pages.md`
6. `docs/05-dashboard.md`
7. `docs/06-map-strategy.md`
8. `docs/07-whatsapp-rules.md`
9. `docs/08-implementation-order.md`
10. `docs/10-best-practices.md`
11. `specs/product-spec.md`
12. `specs/technical-spec.md`
13. `specs/acceptance-criteria.md`
14. `specs/mvp-checklist.md`
15. `decisions/ADR-001-ui-stack.md`
16. `decisions/ADR-002-map-engine.md`
17. `decisions/ADR-003-hosting.md`

## Proximos passos recomendados (ordem sugerida)

1. **UI admin:** estender **shadcn** (`Input`, `Card`, `Dialog`, `Label`) e substituir formulários longos aos poucos
2. **Landing:** **drawer/modal** do lote (hoje painel fixo abaixo da planta); usar `bannerUrl` / `logoUrl` no hero quando existirem
3. **Mídia:** **upload** de SVG/banner/logo (Cloudinary/S3 ou Vercel Blob) em vez de só URL manual
4. **Qualidade:** **Zod** nos server actions dos CRUDs; mensagens de erro por campo; **testes** (e2e ou integração) nos fluxos críticos
5. **Segurança / produto:** auditoria de rotas públicas (garantir zero vazamento de dados internos); opcional **recuperação de senha** e política de senha
6. **Cidades (opcional):** escopo por empresa ou catálogo global documentado (hoje qualquer usuário com acesso ao admin edita cidades)

## Como rodar localmente (base atual)

1. Instalar dependencias:
   - `npm install`
2. Criar ambiente local:
   - copiar `.env.example` para `.env` (ou `.env.local`)
   - preencher `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   - definir **`NEXTAUTH_URL=http://localhost:3000`** e **`NEXTAUTH_SECRET` ou `AUTH_SECRET`**
3. Gerar client Prisma:
   - `npm run prisma:generate`
4. Rodar migracoes (se ainda nao aplicou):
   - `npm run prisma:migrate`
5. (Opcional) Seed:
   - `npm run prisma:seed`
6. Iniciar servidor:
   - `npm run dev`
