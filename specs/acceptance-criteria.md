# Acceptance Criteria

## Cadastro de loteamento
Dado um usuário admin autenticado  
Quando ele cria um loteamento com nome, cidade, slug e WhatsApp  
Então o sistema deve salvar os dados e permitir publicação futura.

## Publicação de landing page
Dado um loteamento publicado  
Quando um visitante acessa a rota pública  
Então deve visualizar a landing page correspondente.

## Seleção de lote
Dado um lote público visível na planta  
Quando o visitante clica no lote  
Então deve ver área, status, valor estimado e CTA de WhatsApp.

## CTA de WhatsApp do lote
Dado um lote selecionado  
Quando o visitante clica em "Tenho interesse"  
Então o sistema deve abrir o WhatsApp com mensagem contextual do lote.

## Botão flutuante
Dado qualquer ponto da landing page  
Quando o visitante clica no botão flutuante  
Então o sistema deve abrir o WhatsApp do loteamento com mensagem padrão.

## Dados internos
Dado um lote com informações de comprador  
Quando um visitante acessa a landing page  
Então essas informações não devem aparecer em nenhum endpoint público nem na interface pública.
