# importTalviRecipes

## Visão geral

Importa as receitas da Talvi a partir do texto dos arquivos de ferramenta. A biblioteca não lê arquivos.

## Responsabilidades

- Converter cada arquivo em uma receita, na ordem de entrada.
- Relatar uma vez cada arquivo ilegível (nome, XML ou campo) e manter os demais.

## Entradas e saídas

```ts
export function importTalviRecipes(files: readonly RecipeFile[]): { recipes: readonly TalviRecipe[]; issues: readonly RecipeIssue[] }
```

## Fluxo principal

```mermaid
flowchart LR
  A[arquivo] --> B[nome]
  B --> C[XML]
  C --> D[receita ou problema]
```

## Tratamento de erros e casos-limite

Nome fora dos padrões: `RECIPE_NAME_UNRECOGNIZED`. XML inválido: `RECIPE_XML_INVALID`. Campo obrigatório ausente: `RECIPE_FIELD_MISSING`.

## Exemplos

```ts
const { recipes, issues } = importTalviRecipes([{ name: '12mm inox s3.5.HSTool', text }])
```

## Dependências e integrações

`./parseTalviRecipeName`, `./readFlatXml`, `./recipeFromTree`, `../machine/messages`.
