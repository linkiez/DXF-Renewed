# summarize

## Visão geral

Escreve o resumo textual da cena (chapas, peças, não alocadas, aproveitamento, comprimentos e perfurações), sempre exibido ao lado da vista.

## Responsabilidades

- Usar somente valores já presentes no artefato e no plano de corte, sem recalcular.
- Produzir texto em pt-BR por meio do módulo de mensagens.

## Entradas e saídas

```ts
export function summarize(scene: ReviewScene): string
```

## Fluxo principal

```mermaid
flowchart LR
  S[ReviewScene.summary] --> M[messages.summaryText]
  M --> T[texto]
```

## Tratamento de erros e casos-limite

Cena indisponível produz o resumo com zeros e a quantidade de itens não alocados do artefato.

## Exemplos

```ts
summarize(scene) // "Chapas: 2. Peças: 4. ..."
```

## Dependências e integrações

`./messages` e `./types`.
