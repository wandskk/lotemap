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
- Auth: `Auth.js`
- Forms/validacao: `React Hook Form` + `Zod`
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
- `/admin/developments`
- `/admin/lots`
- `/admin/blocks`
- `/admin/users`

## Plano de execucao ate a conclusao

### Fase 0 - Setup da fundacao
1. Criar projeto Next.js com TypeScript
2. Configurar Tailwind e base visual
3. Instalar e configurar shadcn/ui
4. Configurar Prisma e PostgreSQL
5. Configurar Auth.js
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

Status atual:
- [x] Fase 0 iniciada
- [ ] Fase 0 validada em execucao local com dependencias instaladas

### Fundacao
- [ ] projeto criado
- [ ] Tailwind configurado
- [ ] shadcn instalado
- [ ] Prisma configurado
- [ ] banco conectado
- [ ] Auth.js funcionando

### Dominio
- [ ] Company
- [ ] User
- [ ] City
- [ ] Development
- [ ] Block
- [ ] Lot
- [ ] LotOwnerInfo
- [ ] LotHistory

### Dashboard
- [ ] login
- [ ] listagem de loteamentos
- [ ] cadastro de loteamento
- [ ] cadastro de quadras
- [ ] cadastro de lotes
- [ ] edicao de dados internos

### Publico
- [ ] rota publica por loteamento
- [ ] hero e blocos institucionais
- [ ] planta SVG interativa
- [ ] drawer/modal do lote
- [ ] botao flutuante de WhatsApp
- [ ] CTA contextual por lote

### Qualidade
- [ ] responsivo
- [ ] permissoes funcionando
- [ ] SEO basico
- [ ] mensagens de erro
- [ ] estados vazios

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

## Proximo passo recomendado

Iniciar imediatamente a **Fase 0 - Setup da fundacao** e fechar o primeiro bloco com:
- projeto criado
- stack base configurada
- auth e banco operacionais

## Como rodar localmente (base atual)

1. Instalar dependencias:
   - `npm install`
2. Criar ambiente local:
   - copiar `.env.example` para `.env.local`
   - preencher `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `DATABASE_URL`
3. Gerar client Prisma:
   - `npm run prisma:generate`
4. Rodar migracao inicial:
   - `npm run prisma:migrate -- --name init`
5. Iniciar servidor:
   - `npm run dev`
