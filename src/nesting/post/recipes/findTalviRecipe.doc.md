# findTalviRecipe

## Visão geral

Consulta exata de uma receita da Talvi por material, espessura e, opcionalmente, bico.

## Responsabilidades

- Devolver a receita ou `undefined`, nunca a espessura vizinha.

## Entradas e saídas

```ts
export function findTalviRecipe(recipes: readonly TalviRecipe[], query: RecipeQuery): TalviRecipe | undefined
```

## Fluxo principal

```mermaid
flowchart LR
  A[consulta] --> B[comparação exata]
  B --> C[receita ou indefinido]
```

## Tratamento de erros e casos-limite

A espessura usa `EPSILON`. Receitas sem material (padrão `双`) nunca casam com uma consulta por material.

## Exemplos

```ts
findTalviRecipe(recipes, { material: 'stainless-steel', thicknessMm: 12 })
```

## Dependências e integrações

`../../config`.
