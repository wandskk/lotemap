# Product Spec — LoteMap MVP

## Contexto
O LoteMap é um sistema SaaS para empresas de loteamentos gerenciarem empreendimentos em várias cidades, com dashboard interno e landing page pública por loteamento.

## Objetivos do MVP
- expor loteamentos ao público
- mostrar lotes interativos
- permitir atualização rápida pelos gestores
- registrar dados internos sem expor ao público
- gerar contato comercial via WhatsApp

## Não objetivos do MVP
- CRM completo
- checkout
- contratos
- georreferenciamento avançado
- importação automática complexa

## Requisitos funcionais

### RF-01
O sistema deve permitir login de usuários autorizados.

### RF-02
O superadmin deve poder cadastrar empresas.

### RF-03
A empresa deve poder cadastrar loteamentos em cidades diferentes.

### RF-04
O gestor deve poder cadastrar quadras e lotes.

### RF-05
Cada lote deve ter status público e dados internos.

### RF-06
Cada loteamento deve possuir uma landing page pública.

### RF-07
A landing page deve exibir uma planta SVG interativa com zoom.

### RF-08
Ao clicar em um lote, o visitante deve ver detalhes públicos.

### RF-09
Ao clicar em um lote, o visitante deve conseguir abrir conversa no WhatsApp com mensagem contextual.

### RF-10
A landing page deve exibir um botão flutuante de WhatsApp.

### RF-11
Dados internos do lote não devem ser expostos publicamente.

### RF-12
A empresa só deve acessar seus próprios dados.

## Requisitos não funcionais

### RNF-01
A aplicação deve ser responsiva.

### RNF-02
A planta deve funcionar com mouse e toque.

### RNF-03
O sistema deve ser hospedável na Vercel.

### RNF-04
O dashboard deve exigir autorização no servidor.

### RNF-05
O carregamento público deve ser bom em redes móveis comuns.

## Métricas de sucesso do MVP
- gestor publica loteamento sem ajuda técnica
- visitante encontra lote e chama no WhatsApp
- atualização de status acontece em poucos cliques
