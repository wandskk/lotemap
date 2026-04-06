# Arquitetura Recomendada

## Visão geral

### Frontend
- Next.js App Router
- páginas públicas e administrativas no mesmo projeto

### Backend
- Route Handlers do Next.js para o MVP
- Prisma ORM
- PostgreSQL

### Infra
- Vercel para aplicação
- banco externo PostgreSQL
- storage externo para imagens e SVGs

## Motivos da escolha
- rapidez de entrega
- excelente integração com Vercel
- redução de complexidade operacional no MVP
- ótima experiência para SSR, ISR e páginas públicas

## Camadas

### Presentation
- páginas
- layout
- componentes visuais
- formulários

### Application
- services/use-cases
- validações
- políticas de autorização

### Domain
- entidades de negócio
- regras de status
- regras de visibilidade
- cálculo de valor estimado

### Infrastructure
- Prisma
- storage
- autenticação
- envio de links de WhatsApp

## Estratégia de crescimento
Se o produto crescer, é possível separar depois:
- frontend web
- backend API dedicado
- jobs assíncronos
- sistema de billing
