# PALETTE

## Visão geral

Cores, padrões de traço e opacidade da vista acelerada. Módulo interno.

## Responsabilidades

- Ser a única fonte visual do renderizador acelerado.

## Entradas e saídas

```ts
export const PALETTE
```

## Fluxo principal

```mermaid
flowchart LR
  A[tipo de linha] --> B[cor e traço]
```

## Tratamento de erros e casos-limite

Tipos sem traço tracejado usam linha contínua.

## Exemplos

```ts
PALETTE.colors.cut
```

## Dependências e integrações

`./lineKinds`.
