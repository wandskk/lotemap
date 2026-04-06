# Modelo de Dados

## Entidades principais

### Company
Representa a empresa cliente da plataforma.

Campos sugeridos:
- id
- name
- slug
- cnpj
- email
- phone
- logoUrl
- active
- createdAt
- updatedAt

### User
- id
- companyId
- name
- email
- passwordHash
- role
- active
- createdAt
- updatedAt

### City
- id
- name
- state
- slug
- createdAt
- updatedAt

### Development
Loteamento.

- id
- companyId
- cityId
- name
- slug
- shortDescription
- fullDescription
- status
- address
- whatsapp
- latitude
- longitude
- pricePerSquareMeter
- bannerUrl
- logoUrl
- mapSvgUrl
- published
- createdAt
- updatedAt

### Block
Quadra.

- id
- developmentId
- code
- sortOrder
- createdAt
- updatedAt

### Lot
- id
- developmentId
- blockId
- code
- number
- areaM2
- frontMeters
- backMeters
- leftMeters
- rightMeters
- publicStatus
- internalStatus
- estimatedValue
- manualValue
- valuationFactor
- publicNotes
- internalNotes
- isFeatured
- visiblePublicly
- geometryRef
- createdAt
- updatedAt

### LotOwnerInfo
Dados internos relacionados ao comprador atual ou pretendente principal.

- id
- lotId
- buyerName
- buyerDocument
- buyerPhone
- buyerEmail
- brokerName
- negotiatedValue
- reservationDate
- saleDate
- paymentMethod
- contractSigned
- notes
- createdAt
- updatedAt

### LotHistory
- id
- lotId
- userId
- action
- previousValue
- newValue
- createdAt

## Observações de modelagem
- `Company -> Development` é 1:N
- `City -> Development` é 1:N
- `Development -> Block` é 1:N
- `Development -> Lot` é 1:N
- `Block -> Lot` é 1:N
- `Lot -> LotOwnerInfo` inicialmente 1:1 no MVP
- histórico deve existir desde cedo

## Status públicos sugeridos
- AVAILABLE
- RESERVED
- SOLD
- UNAVAILABLE

## Status internos sugeridos
- NEW
- CONTACTED
- NEGOTIATION
- DOCUMENTATION
- CLOSED
- CANCELED
