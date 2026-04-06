# Landing Page Pública por Loteamento

## Estado da implementação (snapshot)

- **Implementado:** rota dinâmica, hero, sobre, localização, planta (`DevelopmentMapPreview`), painel do lote abaixo da planta, WhatsApp flutuante + CTA por lote, metadados SEO básicos.
- **Pendente / opcional:** modal ou **drawer** dedicado (hoje o detalhe do lote é um bloco sob a planta); seções extras (ex.: diferenciais); imagens banner/logo se os campos forem preenchidos.

## Estrutura recomendada

1. Hero
2. Sobre o loteamento
3. Diferenciais
4. Localização geral
5. Planta interativa
6. Legenda dos status
7. CTA comercial
8. Rodapé com contatos

## Hero
Conteúdo:
- nome do loteamento
- cidade/estado
- frase curta
- CTA para ver lotes
- CTA para WhatsApp

## Planta interativa
Requisitos:
- zoom
- pan
- clique/tap no lote
- cores por status
- legenda
- modal ou drawer com detalhes

## Informações públicas do lote
- quadra
- número
- área
- status público
- valor estimado
- observação pública

## CTA no lote
Ao clicar no lote, exibir botão:
- "Tirar dúvidas no WhatsApp"
- "Tenho interesse neste lote"

Mensagem sugerida:
`Olá! Tenho interesse no lote {quadra}-{numero} do loteamento {nome}. Pode me passar mais informações?`

## Botão flutuante do WhatsApp
Exibir em toda a landing page.

Comportamento:
- fixo no canto inferior
- abre link do WhatsApp com número do loteamento
- mensagem padrão:
`Olá! Vim pelo site do {nome do loteamento} e gostaria de mais informações.`

## SEO mínimo do MVP
- title único por loteamento
- meta description
- Open Graph
- URL amigável
- schema básico de negócio/local se fizer sentido
