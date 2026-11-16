# categoryStatus

## Visão geral

Deriva o estado de uma categoria (completo, estimado ou incompleto) somente a partir dos seus insumos. Módulo interno.

## Responsabilidades

- `incomplete` quando falta insumo ou plano de corte necessário, com um motivo por falta (`MISSING_RATE:<campo>`, `NO_CUT_PLAN`).
- `estimated` quando um insumo usado está marcado como estimativa (`ESTIMATED:<campo>`).
- `complete` nos demais casos.

## Entradas e saídas

```ts
export function categoryStatus(category: CategoryNeeds, planPresent: boolean): CategoryStatusInfo
```

## Fluxo principal

```mermaid
flowchart LR
  A[insumos] --> B[estado e motivos]
```

## Tratamento de erros e casos-limite

O estado nunca depende dos valores em dinheiro.

## Exemplos

```ts
categoryStatus(needs.cutting, usage.planPresent)
```

## Dependências e integrações

`./componentNeeds` e `./types`.
