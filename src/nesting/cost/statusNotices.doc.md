# statusNotices

## Visão geral

Gera um aviso por insumo ausente ou estimado, qualquer que seja o número de categorias que dependem dele. Módulo interno.

## Responsabilidades

- Avisos `warning` com os códigos `MISSING_RATE`, `MISSING_SPEED`, `MISSING_DWELL`, `MISSING_CONSUMABLE_LIFE` e `MISSING_SHEET_PRICE`.
- Avisos `info` `ESTIMATED_INPUT` para valores marcados como estimativa.

## Entradas e saídas

```ts
export function statusNotices(needs: Record<CostCategory, CategoryNeeds>): CostNotice[]
```

## Fluxo principal

```mermaid
flowchart LR
  A[insumos] --> B[avisos pt-BR]
```

## Tratamento de erros e casos-limite

Cada caminho de insumo gera no máximo um aviso.

## Exemplos

```ts
const notices = statusNotices(amounts.needs)
```

## Dependências e integrações

`./messages` e `./componentNeeds`.
