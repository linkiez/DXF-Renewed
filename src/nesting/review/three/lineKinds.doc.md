# LINE_KINDS

## Visão geral

Tipos de ação desenhados como segmentos de linha, na ordem de desenho. Módulo interno do renderizador acelerado.

## Responsabilidades

- Ser a única fonte da lista de tipos de linha.

## Entradas e saídas

```ts
export const LINE_KINDS: readonly LineKind[]
```

## Fluxo principal

```mermaid
flowchart LR
  A[tipo de ação] --> B[linha]
```

## Tratamento de erros e casos-limite

`pierce` e `end` não são linhas.

## Exemplos

```ts
for (const kind of LINE_KINDS) { /* ... */ }
```

## Dependências e integrações

`../../cutPath/types`.
