# types

## Visão geral

Tipos públicos do catálogo de receitas de corte da Talvi: receita, etapas de perfuração, lead, problemas de importação e consulta.

## Responsabilidades

- Definir `TalviRecipe` e os tipos de apoio como no modelo de dados.
- Declarar que a unidade da velocidade não é confirmada (`speedUnitConfirmed: false`).

## Entradas e saídas

```ts
interface TalviRecipe { id: string; thicknessMm: number; material: TalviMaterial | null; nozzle: string; cut: TalviCutParameters; /* ... */ }
```

## Fluxo principal

```mermaid
flowchart LR
  A[arquivo HSTool] --> B[TalviRecipe]
```

## Tratamento de erros e casos-limite

Tipos apenas. A receita pertence à interface do controlador; o programa Talvi não leva esses valores.

## Exemplos

```ts
const recipe: TalviRecipe | undefined = findTalviRecipe(recipes, { material: 'inox' as never, thicknessMm: 12 })
```

## Dependências e integrações

Nenhuma.
