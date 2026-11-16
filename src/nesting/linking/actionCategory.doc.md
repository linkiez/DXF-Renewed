# actionCategory

## Visão geral

Classifica o tipo de uma ação de corte em corte, deslocamento ou perfuração. Compartilhado pelo custo e pelo risco.

## Responsabilidades

- Ser a única tabela de categorias de ação para tempo e custo.
- Devolver nada para tipos que não consomem tempo, como `end`.

## Entradas e saídas

```ts
export type ActionCategory = 'cut' | 'travel' | 'pierce'
export function actionCategory(kind: CutActionKind): ActionCategory | undefined
```

## Fluxo principal

```mermaid
flowchart LR
  A[kind] --> B[categoria ou indefinido]
```

## Tratamento de erros e casos-limite

Um tipo sem categoria resulta em `undefined`; quem chama ignora a ação.

## Exemplos

```ts
actionCategory('lead-in') // 'cut'
```

## Dependências e integrações

`../cutPath/types`.
