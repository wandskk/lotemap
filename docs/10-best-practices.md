# Boas Práticas

## Produto
- começar pequeno e funcional
- evitar features avançadas antes da validação
- manter foco em operação + exposição comercial

## Código
- TypeScript estrito
- componentes pequenos
- services por domínio
- validação com Zod em input e output crítico
- nomes consistentes para lotes e quadras

## UI
- shadcn/ui como base
- Tailwind para composição
- sem excesso de customização no MVP
- mobile-first

## Banco
- migrations pequenas
- constraints para evitar duplicidade de lote
- soft-delete apenas quando necessário
- histórico para eventos importantes

## Segurança
- segregação por empresa
- checagem de autorização no servidor
- nunca confiar em role vindo do cliente
- dados internos nunca expostos na API pública

## Performance
- SSR/ISR para páginas públicas
- paginação no dashboard
- não carregar SVG gigantes sem necessidade
- normalizar o SVG antes do upload

## DX
- lint
- formatter
- aliases de import
- scripts padronizados
- documentação viva
