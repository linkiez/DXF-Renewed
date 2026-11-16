# metadataNumber

## Visão geral

Lê um valor numérico dos metadados de uma ação de corte, como `feed` e `dwell`. Compartilhado pelo custo e pelo risco.

## Responsabilidades

- Devolver o valor somente quando é um número finito, senão nulo.

## Entradas e saídas

```ts
export function metadataNumber(value: string | number | boolean | undefined): number | null
```

## Fluxo principal

```mermaid
flowchart LR
  A[valor] --> B[número ou nulo]
```

## Tratamento de erros e casos-limite

Textos, booleanos e números não finitos resultam em nulo.

## Exemplos

```ts
const feed = metadataNumber(action.metadata?.feed)
```

## Dependências e integrações

Nenhuma.
