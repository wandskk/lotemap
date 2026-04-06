# Estratégia da Planta Interativa

## Decisão do MVP
Não usar Google Maps como núcleo da visualização.  
Usar **SVG interativo** como representação oficial do loteamento.

## Motivos
- controle total sobre os lotes
- performance melhor
- implementação mais previsível
- sem dependência de APIs de mapa no núcleo
- ideal para plantas de loteamento

## Formato recomendado
- SVG exportado a partir da planta tratada
- cada lote como `path`, `polygon` ou `g`
- ids consistentes por lote

## Fluxo recomendado
1. Receber planta do loteamento
2. Converter/limpar em SVG
3. Garantir id único por lote
4. Subir SVG no sistema
5. Associar ids do SVG aos registros do banco

## Estratégia de vínculo
Campo sugerido no lote:
- `geometryRef`

Exemplo:
- `QD-A_LT-01`

O mesmo valor deve existir no SVG como `id` ou `data-lot-code`.

## Comportamentos do mapa
- zoom in/out
- arrastar
- hover no desktop
- tap no mobile
- destacar lote selecionado
- aplicar cor por status
- abrir drawer/modal

## Biblioteca sugerida
- `react-zoom-pan-pinch`

## Acessibilidade
- cada lote com label
- contraste adequado das cores
- legenda textual
- fallback de lista de lotes quando necessário
