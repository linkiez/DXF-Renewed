# actionPrefix

## Visão geral

Devolve a polilinha de uma ação do início até uma fração do seu comprimento. Módulo interno.

## Responsabilidades

- Calcular o trecho já executado da ação em curso.
- Fornecer o ponto da cabeça para `stateAt` e para os renderizadores.

## Entradas e saídas

```ts
export function actionPrefix(action: ReviewAction, fraction: number): Point2D[]
```

## Fluxo principal

```mermaid
flowchart LR
  A[ação + fração] --> B[sampleActionPath]
  B --> C[percorre segmentos até a fração]
  C --> D[Point2D[]]
```

## Tratamento de erros e casos-limite

Fração fora de [0, 1] é limitada. Ação sem comprimento devolve apenas o primeiro ponto.

## Exemplos

```ts
actionPrefix(action, 0.5) // metade do caminho
```

## Dependências e integrações

`./actionPath`, `../polygonUtils` e `../config`.
