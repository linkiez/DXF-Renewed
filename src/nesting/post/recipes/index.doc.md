# index

## Visão geral

Barrel do catálogo de receitas de corte da Talvi.

## Responsabilidades

- Reexportar importação, consulta e tipos.

## Entradas e saídas

```ts
export { importTalviRecipes, findTalviRecipe }
export type { TalviRecipe, RecipeIssue, /* ... */ }
```

## Fluxo principal

```mermaid
flowchart LR
  A[post/index] --> B[recipes/index]
```

## Tratamento de erros e casos-limite

Os auxiliares (`readFlatXml`, `parseTalviRecipeName`, `recipeFromTree`) não são exportados.

## Exemplos

```ts
import { importTalviRecipes } from 'dxf/nesting'
```

## Dependências e integrações

`./importTalviRecipes`, `./findTalviRecipe`, `./types`.
