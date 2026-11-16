# talviPreparation

## Visão geral

Bloco fixo de preparação de um programa Talvi. Interno.

## Responsabilidades

- Devolver as oito linhas de preparação observadas nos programas reais.

## Entradas e saídas

```ts
export function talviPreparation(): string[]
```

## Fluxo principal

```mermaid
flowchart LR
  A[constante] --> B[8 linhas]
```

## Tratamento de erros e casos-limite

Sem parâmetros: o bloco é fixo.

## Exemplos

```ts
talviPreparation()[0] // 'G21'
```

## Dependências e integrações

Nenhuma.
