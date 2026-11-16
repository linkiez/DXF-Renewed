# edit/redoEdit

## Visão geral

Avança uma edição no registro, reaplicando a próxima.

## Responsabilidades

- Reconstruir o layout reaplicando o registro a partir da base.
- Incrementar a revisão e recalcular o frescor.

## Entradas e saídas

```ts
export function redoEdit(state: EditState): EditState
```

## Fluxo principal

```mermaid
flowchart LR
  A[cursor] --> B[cursor + 1]
  B --> C[reaplicar o registro]
```

## Tratamento de erros e casos-limite

No fim do registro devolve o mesmo estado.

## Exemplos

```ts
const next = redoEdit(state)
```

## Dependências e integrações

`./moveCursor`.
