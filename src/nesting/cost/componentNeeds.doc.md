# componentNeeds

## Visão geral

Lista, para cada categoria de custo, os insumos de que ela depende, conforme o que o uso realmente exige. Módulo interno.

## Responsabilidades

- Exigir velocidade do modelo só quando alguma ação não traz `feed`, tempo de perfuração só quando alguma perfuração não traz `dwell`, e assim por diante.
- Indicar quais categorias dependem de plano de corte.
- Ser independente dos valores calculados.

## Entradas e saídas

```ts
export function componentNeeds(usage: UsageResult, model: CostModel): Record<CostCategory, CategoryNeeds>
```

## Fluxo principal

```mermaid
flowchart LR
  A[uso + modelo] --> B[insumos por categoria]
```

## Tratamento de erros e casos-limite

Um insumo ausente é diferente de zero: só vira zero se o ERP informar zero.

## Exemplos

```ts
const needs = componentNeeds(usage, model)
```

## Dependências e integrações

`./collectUsage` e `./types`.
