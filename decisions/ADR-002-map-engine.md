# ADR-002 — Motor da Planta

## Status
Aceito

## Contexto
É preciso renderizar o loteamento com lotes clicáveis, cores por status e zoom.

## Decisão
Usar **SVG interativo** como motor principal da planta no MVP.

## Consequências
### Positivas
- controle total
- boa performance
- sem acoplamento a provedores de mapa

### Negativas
- exige padronização do SVG
- processo de importação inicial pode ser manual
