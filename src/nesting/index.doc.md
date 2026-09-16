# nesting/barrel

## Visão geral
Módulo `index.ts` da feature 002-true-shape-nesting.

## Responsabilidades
- Reexporta `nestTrueShape`, helpers e tipos da feature (aditivo, sem alterar exports existentes).
- Reexporta objetivo ponderado, seleção de backend e dispatch WebGPU da feature 003.

## Entradas / Saídas
- Entradas: parâmetros tipados das funções exportadas em `index.ts`.
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

## Feature 004 — Cut-path planning

O barrel também expõe, de forma aditiva, os tipos públicos de layout, perfil de processo, ações,
planos, métricas e problemas estruturados em `src/nesting/cutPath/types.ts`, além dos helpers
puros de geometria transformada e validação estrutural/processual de `src/nesting/cutPath`.

`planCutPath` composes deterministic inner-before-outer sequencing, process entry candidates and
machine-independent actions for every referenced sheet. Verified common-line candidates produce
explicit common-line actions. Invalid geometry is returned as structured `CutPathProblem` data;
only malformed structural input raises an exception.
