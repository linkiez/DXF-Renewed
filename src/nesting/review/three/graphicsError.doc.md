# ReviewGraphicsError

## Visão geral

Erro lançado quando o renderizador acelerado não pode ser criado.

## Responsabilidades

- Carregar o código `GRAPHICS_UNAVAILABLE` ou `GRAPHICS_LOST` e a mensagem em pt-BR.

## Entradas e saídas

```ts
export class ReviewGraphicsError extends Error { readonly code: ReviewRendererFailure }
```

## Fluxo principal

```mermaid
flowchart LR
  A[falha] --> B[erro com código]
```

## Tratamento de erros e casos-limite

A montagem trata a rejeição e cai para a vista estática.

## Exemplos

```ts
throw new ReviewGraphicsError('GRAPHICS_UNAVAILABLE')
```

## Dependências e integrações

`../messages` e `../types`.
