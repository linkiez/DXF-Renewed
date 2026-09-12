# nesting/types

## Visão geral
Módulo `types.ts` da feature 002-true-shape-nesting.

## Responsabilidades
- Contratos públicos `StockItem`, `PartRequest`, `NestRequest`, `NestResponse`, `UnplacedPart`.

## Entradas / Saídas
- Entradas: parâmetros tipados das funções exportadas em `types.ts`.
- Saídas: valores tipados; sem I/O e sem dependência de relógio (FR-007).

## Fluxo principal
1. Recebe geometria já validada pelo chamador.
2. Aplica a verificação/cálculo descrito acima com `EPSILON` para todas as comparações.
3. Devolve o resultado; geometria degenerada resulta em ausência de candidato, nunca em exceção.

## Erros
- Entradas fora do contrato (ex.: `edgeClearance` negativo) são rejeitadas antes da busca; partes não posicionáveis são reportadas em `unplaced` com motivo explícito (FR-006).

## Exemplos
Cobertura em `test/unit/nesting/trueShape*.test.ts` e `test/integration/nesting/trueShapePipeline.test.ts`.

## Dependências
- `src/nesting/types.ts`, `src/nesting/polygonUtils.ts`, `src/nesting/collision.ts`, `src/nesting/config.ts`.
