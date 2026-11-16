# buildProductionReport

## Visão geral

Monta o resumo operacional do job: chapas usadas, aproveitamento e desperdício do artefato, tempo por categoria por chapa e para o job, e os itens não alocados.

## Responsabilidades

- Copiar aproveitamento, área de desperdício e área total do artefato, sem recalcular.
- Somar tempos de corte, deslocamento, perfuração e manuseio; devolver `null` onde o tempo não pode ser calculado (velocidade, tempo de perfuração ou manuseio ausentes, ou sem plano de corte).
- Listar os itens não alocados com os motivos recebidos.

## Entradas e saídas

```ts
export function buildProductionReport(request: CostRequest, usage: UsageResult): ProductionReport
```

## Fluxo principal

```mermaid
flowchart LR
  A[pedido + uso] --> B[ProductionReport]
```

## Tratamento de erros e casos-limite

Uma chapa sem peças não conta como usada e não tem manuseio.

## Exemplos

```ts
const production = buildProductionReport(request, collectUsage(request))
```

## Dependências e integrações

`./estimateTimes`, `./collectUsage` e `./types`.
