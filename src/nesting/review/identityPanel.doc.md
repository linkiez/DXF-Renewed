# identityPanel

## Visão geral

Cabeçalho com a identificação do artefato revisado: situação, versão do contrato, correlação e resumos de entrada e saída.

## Responsabilidades

- Exibir os valores como recebidos, em uma lista de descrição.

## Entradas e saídas

```ts
export function identityPanel(doc: Document, identity: ReviewIdentity | null): HTMLElement
```

## Fluxo principal

```mermaid
flowchart LR
  A[ReviewIdentity] --> B[header + dl]
```

## Tratamento de erros e casos-limite

Identidade nula produz apenas o título.

## Exemplos

```ts
root.appendChild(identityPanel(doc, scene.identity))
```

## Dependências e integrações

`./messages`, `./panelText` e `./types`.
