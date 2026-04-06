# MVP Checklist (sincronizado com o repositório)

> Atualização: 2026-04. O README mestre (`README.md`) é a fonte de detalhes; esta lista é um resumo binário.

## Fundação
- [x] projeto Next.js (App Router) + TypeScript
- [x] Tailwind v4 + `@tailwindcss/postcss`
- [x] shadcn/ui (`components.json`, tema em `globals.css`)
- [x] Prisma + PostgreSQL (`prisma.config.ts`, migrations)
- [x] NextAuth v4 + senha no banco (`bcryptjs`) + seed com hash de `ADMIN_PASSWORD`

## Domínio (Prisma)
- [x] Company, User, City, Development, Block, Lot, LotOwnerInfo, LotHistory
- [x] Seed (`npm run prisma:seed`)

## Dashboard
- [x] login `/admin/login` + logout
- [x] CRUD cidades, **empresas** (superadmin), loteamentos, quadras, lotes
- [x] `/admin/users` (superadmin)
- [x] `/admin/lots/[lotId]` comprador + histórico
- [x] home `/admin` com KPIs + escopo por empresa (Admin/Gestor)

## Público
- [x] rota `/[city]/[development]`
- [x] hero, sobre, localização, planta, WhatsApp
- [ ] drawer/modal dedicado ao lote (hoje painel abaixo da planta)

## Qualidade / MVP
- [x] SEO básico landing; a11y parcial; estados vazios (`AdminCallout`)
- [x] escopo multi-tenant no admin (loteamentos/quadras/lotes/planta; superadmin = tudo)
- [ ] upload SVG/banner/logo em storage (hoje URLs)
- [ ] testes automatizados (opcional)
