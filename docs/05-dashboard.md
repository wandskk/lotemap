# Dashboard Administrativo

## Módulos do painel

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
