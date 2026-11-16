# ThreeNamespace

## Visão geral

Tipo do namespace `three` injetado, referenciado só em `review/three/`.

## Responsabilidades

- Evitar tipos soltos: o renderizador usa a API tipada de `three`.

## Entradas e saídas

```ts
export type ThreeNamespace = typeof ThreeModule
```

## Fluxo principal

```mermaid
flowchart LR
  A[three] --> B[tipo]
```

## Tratamento de erros e casos-limite

Consumidores precisam de `@types/three`.

## Exemplos

```ts
const three: ThreeNamespace = await import("three")
```

## Dependências e integrações

`three` (par opcional).
