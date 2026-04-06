# Technical Spec — LoteMap MVP

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma
- PostgreSQL
- NextAuth v4 (credentials + JWT)
- Zod
- React Hook Form
- react-zoom-pan-pinch

## Padrões
- server-first when possible
- validação em schema
- segregação de domínios
- checagem de permissão no servidor
- páginas públicas preferencialmente SSR/ISR

## Rotas públicas
- `/[city]/[development]`

## Rotas admin
- `/admin`
- `/admin/login`
- `/admin/cities`
- `/admin/developments`
- `/admin/blocks`
- `/admin/lots` e `/admin/lots/[lotId]`
- `/admin/users`

## Convenções
- slugs únicos
- códigos de lote consistentes
- enums para status
- `geometryRef` para vínculo com SVG

## Storage
- banner/logo/svg em storage externo
- guardar URL no banco

## Estratégia de WhatsApp
Gerar URL:
`https://wa.me/{numero}?text={mensagem}`

## Estratégia de mapa
- carregar SVG saneado
- aplicar cor por status
- lookup por `geometryRef`
- abrir drawer ao selecionar lote
