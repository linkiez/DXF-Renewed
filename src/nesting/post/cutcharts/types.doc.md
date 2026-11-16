# types

## Visão geral

Tipos públicos da tabela de corte Phoenix da Hypertherm: linhas do workbook, entradas, regras de separação e resultados de consulta.

## Responsabilidades

- Definir a entrada (`CutChartInput`), a tabela importada e a entrada de corte.
- Definir os problemas de importação e os resultados de consulta (achado ou ausência).

## Entradas e saídas

```ts
interface CutChartEntry { rowNumber: number; material: string; thickness: number; class: string; chart: CutChartCodes; /* ... */ }
interface CutChartFound { entry: CutChartEntry; separation?: SeparationRule }
```

## Fluxo principal

```mermaid
flowchart LR
  A[linhas do workbook] --> B[CutChartTable]
  B --> C[CutChartFound / CutChartAbsence]
```

## Tratamento de erros e casos-limite

Tipos apenas. A biblioteca não lê o `.xlsx`: o chamador entrega as linhas.

## Exemplos

```ts
const found: CutChartFound | CutChartAbsence = findCutChartEntry(table, query, 'mm')
```

## Dependências e integrações

Nenhuma.
