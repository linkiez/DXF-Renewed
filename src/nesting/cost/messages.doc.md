# Mensagens do custo

## Visão geral

Módulo interno que concentra todo texto de aviso produzido pelo cálculo de custo, em português do Brasil. Não é exportado pelo barrel.

## Responsabilidades

- Fornecer um construtor de mensagem para cada código de aviso.
- Nomear as categorias de custo em português.

## Entradas e saídas

Funções puras que recebem identificadores, nomes de campo ou valores e devolvem `string`.

## Fluxo principal

```mermaid
flowchart LR
  A[código e dados] --> B[mensagem pt-BR]
```

## Tratamento de erros e casos-limite

Mensagens vindas do artefato (por exemplo motivos de itens não alocados) não passam por aqui: são copiadas como recebidas.

## Exemplos

```ts
costMessages.missingRate('rates.cuttingPerHour')
```

## Dependências e integrações

Somente tipos de `./types`.
