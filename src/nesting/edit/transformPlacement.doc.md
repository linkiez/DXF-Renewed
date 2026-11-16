# edit/transformPlacement

## Visão geral

Aplica deslocamento, rotação ou espelhamento a uma peça posicionada, ao seu contorno e aos furos, sem alterar a entrada.

## Responsabilidades

- Manter `(x, y)` como o canto mínimo da caixa do contorno, a convenção da busca de forma verdadeira.
- Girar e espelhar em torno do centro da caixa externa (ou de um pivô recebido) e somar a rotação módulo 360.
- Preservar o sentido de giro do contorno no espelhamento e tratar uma peça composta como uma unidade.

## Entradas e saídas

```ts
export function transformPart(part: WorkingPart, edit: CandidateEdit, pivot?: Point2D): WorkingPart
```

## Fluxo principal

```mermaid
flowchart LR
  A[peça e edição] --> B[mapear contornos]
  B --> C[recalcular caixa, x, y e rotação]
  C --> D[nova peça]
```

## Tratamento de erros e casos-limite

Uma peça aproximada (só a caixa) tem o retângulo transladado e não ganha `transformedVertices`; girar e espelhar ela é recusado antes, pelo juiz.

## Exemplos

```ts
const moved = transformPart(part, { partKey: part.key, kind: 'move', delta: { dx: 5, dy: 0 } })
```

## Dependências e integrações

`../polygonUtils`, `./pivotOf` e `./types`.
