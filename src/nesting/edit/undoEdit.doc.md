# edit/undoEdit

## Visão geral

Volta uma edição no registro, restaurando exatamente o layout anterior.

## Responsabilidades

- Reconstruir o layout reaplicando o registro a partir da base.
- Incrementar a revisão e recalcular o frescor.

## Entradas e saídas

```ts
export function undoEdit(state: EditState): EditState
```

## Fluxo principal

```mermaid
flowchart LR
  A[cursor] --> B[cursor - 1]
  B --> C[reaplicar o registro]
```

## Tratamento de erros e casos-limite

Com cursor 0 devolve o mesmo estado.

## Exemplos

```ts
const previous = undoEdit(state)
```

## Dependências e integrações

`./moveCursor`.
