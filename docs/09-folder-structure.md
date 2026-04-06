# Estrutura de Pastas Sugerida

```txt
src/
  app/
    (public)/
      [city]/
        [development]/
          page.tsx
          loading.tsx
          error.tsx
    (admin)/
      admin/
        login/
          page.tsx
        page.tsx
        developments/
        cities/
        blocks/
        lots/
        users/
  components/
    ui/
    shared/
    map/
    public/
    dashboard/
  lib/
    auth/
    prisma/
    utils/
    validations/
    permissions/
  services/
    company/
    city/
    development/
    lot/
    map/
  hooks/
  types/
  constants/
  server/
    actions/
    queries/
```

## Observações
- separar componentes visuais de regras
- centralizar validações Zod
- centralizar policies de autorização
- evitar lógica de banco diretamente em componentes
