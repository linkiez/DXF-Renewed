# buildBuffers (renderizador three.js)

## Visão geral

Achata a linha do tempo de uma chapa em buffers mesclados e ordenados, de modo que a trilha seja um prefixo de cada buffer. Módulo interno.

## Responsabilidades

- Gerar segmentos por tipo de ação e centros de marcadores de perfuração e ponte.
- Calcular contagens acumuladas por índice de ação (`segmentsBefore`, `before`).

## Entradas e saídas

```ts
export function buildBuffers(timeline: ReviewTimeline): TimelineBuffers
```

## Fluxo principal

```mermaid
flowchart LR
  T[ReviewTimeline] --> P[caminhos amostrados]
  P --> B[buffers por tipo + prefixos]
```

## Tratamento de erros e casos-limite

Tipos sem ações geram buffers vazios; o número de objetos da cena não depende do número de ações.

## Exemplos

```ts
const buffers = buildBuffers(sheet.timeline)
```

## Dependências e integrações

`../actionPath` e `../types`.
