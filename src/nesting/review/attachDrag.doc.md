# review/attachDrag

## Visão geral

Arrasto de peças no modo de edição: pressionar seleciona, mover propõe uma posição a cada passo e soltar mantém a proposta pendente.

## Responsabilidades

- Usar o renderizador ativo para converter o ponteiro em coordenadas da chapa.
- Não confirmar nada: a confirmação é sempre explícita.

## Entradas e saídas

```ts
export function attachDrag(deps: DragDeps): void
```

## Fluxo principal

```mermaid
sequenceDiagram
  participant U as usuário
  participant D as arrasto
  participant H as handle
  U->>D: pointerdown na peça
  U->>D: pointermove
  D->>H: propose(move)
  U->>D: pointerup
```

## Tratamento de erros e casos-limite

Fora do modo de edição ou sem peça sob o ponteiro, nada acontece.

## Exemplos

```ts
attachDrag({ view, scene, controller, renderers, latest, handle, editing })
```

## Dependências e integrações

`./pick` e `./types`.
