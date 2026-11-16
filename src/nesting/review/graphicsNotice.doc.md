# graphicsNotice

## Visão geral

Cria o aviso que explica uma falha gráfica. Módulo interno.

## Responsabilidades

- Padronizar a mensagem de `GRAPHICS_UNAVAILABLE` e `GRAPHICS_LOST`.

## Entradas e saídas

```ts
export function graphicsNotice(code: ReviewRendererFailure): ReviewNotice
```

## Fluxo principal

```mermaid
flowchart LR
  C[código] --> N[ReviewNotice em pt-BR]
```

## Tratamento de erros e casos-limite

Sempre devolve severidade `warning` e origem `review`.

## Exemplos

```ts
graphicsNotice("GRAPHICS_LOST")
```

## Dependências e integrações

`./messages` e `./types`.
