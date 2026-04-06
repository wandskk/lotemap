# Dashboard Administrativo

## Estado da implementação (snapshot)

- **Implementado:** login, layout com navegação, CRUD de cidades, **empresas** (superadmin), loteamentos, quadras, lotes, preview de planta, página de lote com comprador/histórico, `/admin/users` (superadmin), **visão geral com KPIs** (loteamentos, lotes, disponíveis — respeitando escopo). **Escopo por empresa:** usuários **Admin/Gestor** com `companyId` só veem/editam loteamentos da própria empresa; **Superadmin** vê tudo. Login do painel continua por **uma credencial** em `.env`; usuários no banco para histórico e vínculo empresa/perfil.
- **Ainda não:** **abas** no detalhe do lote (campos na mesma página), login por senha **por usuário** no banco (multi-login), filtro adicional em **cidades** (hoje catálogo global).

## Módulos do painel (visão alvo)

### 1. Visão geral
- quantidade de loteamentos
- lotes disponíveis
- lotes reservados
- lotes vendidos
- atalhos

### 2. Empresas
- CRUD para superadmin

### 3. Usuários
- CRUD
- perfis
- ativação/desativação

### 4. Cidades
- CRUD

### 5. Loteamentos
- CRUD
- descrição
- banner
- logo
- WhatsApp
- publicação

### 6. Quadras
- CRUD
- ordenação

### 7. Lotes
- CRUD
- status público
- status interno
- valor
- observações
- destaque
- visibilidade pública

### 8. Mapa / Planta
- upload de SVG
- associação com lotes
- preview

## Tela de detalhe do lote
Separar por abas:

### Aba pública
- quadra
- lote
- área
- status
- valor estimado
- observação pública

### Aba interna
- comprador
- documento
- telefone
- corretor
- valor negociado
- status interno
- observação interna

### Aba histórico
- alterações por usuário e data

## Regras de permissão
- público não acessa dashboard
- empresa só vê os próprios dados
- gestor não vê dados de outras empresas
- superadmin vê tudo
