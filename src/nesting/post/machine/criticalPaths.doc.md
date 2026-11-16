# criticalPaths

## Visão geral

Lista, por processador, os valores da configuração cuja classificação decide se o programa pode ser liberado. Interno.

## Responsabilidades

- Ter a lista comum a todas as máquinas.
- Acrescentar os parâmetros críticos de cada dialeto.

## Entradas e saídas

```ts
export function criticalPaths(processorId: string): readonly string[]
```

## Fluxo principal

```mermaid
flowchart LR
  A[processador] --> B[comuns + do dialeto]
```

## Tratamento de erros e casos-limite

Um processador sem configuração devolve lista vazia.

## Exemplos

```ts
criticalPaths('talvi-6000w') // ['units', 'envelope', ..., 'processMapping', ...]
```

## Dependências e integrações

Nenhuma.
