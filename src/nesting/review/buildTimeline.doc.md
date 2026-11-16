# buildTimeline

## Visão geral

Achata as ações ordenadas de uma chapa em uma linha do tempo com comprimento acumulado.

## Responsabilidades

- Medir cada ação pela polilinha amostrada (arcos e beziers incluídos).
- Dar a cada ação uma extensão de reprodução positiva (`playStart`, `playSpan`); ações sem comprimento ganham uma permanência.
- Manter ações de comprimento zero na ordem original.
- Listar os índices das perfurações.

## Entradas e saídas

```ts
export function buildTimeline(actions: readonly CutAction[]): ReviewTimeline
```

## Fluxo principal

```mermaid
flowchart TD
  A[CutAction[]] --> B[comprimento por ação]
  B --> C[startLength acumulado]
  C --> D[ReviewTimeline]
```

## Tratamento de erros e casos-limite

Ação com menos de dois pontos tem comprimento `0`. Arco com início e fim coincidentes é tratado
como circunferência completa. A função é pura e determinística.

## Exemplos

```ts
const timeline = buildTimeline(plan.actions)
timeline.pierceIndices // [1, 4]
```

## Dependências e integrações

`../polygonUtils` (`distance`), `./actionPath` e `./types`.
