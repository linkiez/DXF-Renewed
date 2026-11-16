# glorystarEnding

## Visão geral

Encerramento de um programa GloryStar. Interno.

## Responsabilidades

- Recolher a cabeça, fechar a trilha e encerrar o programa.

## Entradas e saídas

```ts
export function glorystarEnding(): string[]
```

## Fluxo principal

```mermaid
flowchart LR
  A[fim] --> B[G840 L0 + G153]
  B --> C[G169 + M498 + fine.cfs + M30]
```

## Tratamento de erros e casos-limite

Sem parâmetros.

## Exemplos

```ts
glorystarEnding()[5] // 'M30'
```

## Dependências e integrações

Nenhuma.
