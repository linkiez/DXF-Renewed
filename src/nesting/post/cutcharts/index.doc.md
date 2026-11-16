# index

## Visão geral

Barrel da tabela de corte Phoenix da Hypertherm.

## Responsabilidades

- Reexportar importação, consulta, conversão em ajustes e tipos.

## Entradas e saídas

```ts
export { importCutChartTable, findCutChartEntry, cutChartSettings }
export type { CutChartTable, CutChartEntry, /* ... */ }
```

## Fluxo principal

```mermaid
flowchart LR
  A[post/index] --> B[cutcharts/index]
```

## Tratamento de erros e casos-limite

Os auxiliares (`rowToEntry`, `codeLists`, `rowReader`) não são exportados.

## Exemplos

```ts
import { importCutChartTable } from 'dxf/nesting'
```

## Dependências e integrações

`./importCutChartTable`, `./findCutChartEntry`, `./cutChartSettings`, `./types`.
