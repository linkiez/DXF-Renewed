# talviEnding

## Visão geral

Bloco fixo de encerramento de um programa Talvi. Interno.

## Responsabilidades

- Devolver as cinco linhas finais observadas nos programas reais.

## Entradas e saídas

```ts
export function talviEnding(): string[]
```

## Fluxo principal

```mermaid
flowchart LR
  A[constante] --> B[5 linhas]
```

## Tratamento de erros e casos-limite

Sem parâmetros: o bloco é fixo.

## Exemplos

```ts
talviEnding()[4] // 'M2'
```

## Dependências e integrações

Nenhuma.
