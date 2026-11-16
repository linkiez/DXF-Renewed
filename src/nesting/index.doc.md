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

## Revisão de nesting (somente leitura)

O barrel expõe, de forma aditiva, `buildReviewScene`, `renderReviewSvg`, `mountReview`,
`createReviewController`, `stateAt`, `nextPierce`, `pickAt`, `inspect`, `summarize`,
`createAnimationClock` e os tipos públicos de
`src/nesting/review/types.ts`. A revisão consome um `ErpNestingArtifact` com
`CutLayout` e `CutPlanResult` opcionais e nunca altera esses objetos. O renderizador acelerado
fica no subcaminho `review/three` e não é importado por este barrel.

## Custo e relatório de nesting

O barrel expõe, de forma aditiva, `calculateCostReport`, `buildCostBreakdown`, `validateCostModel`, `costReportTables`,
`costReportToCsv` e os tipos públicos de
`src/nesting/cost/types.ts` (modelo de custo, pedido, relatório de custo e avisos). O cálculo não guarda nada e não altera o artefato, o plano de
corte nem o modelo de custo. O vínculo ação→peça e a resolução de placements usados pela revisão e
pelo custo ficam em `src/nesting/linking/`.

## Edição de layout e risco de corte

O barrel expõe, de forma aditiva, a edição de posição das peças de um artefato revisado
(`createEditState`, `judgePlacement`, `commitEdit`, `undoEdit`, `redoEdit`, `editedLayout`,
`editedCutLayout`, `markComputed` e os tipos de `src/nesting/edit/types.ts`) e os tipos de
`src/nesting/risk/types.ts`. A edição nunca altera o artefato de entrada, não guarda nada e só confirma
posições válidas; cada confirmação, desfazer e refazer incrementa a revisão do estado e torna
desatualizados os resultados derivados até serem recalculados.

A avaliação indicativa de risco de corte (`assessCutRisk`, `calculateRiskReport`, `heatAt`,
`validateRiskProfile` e o esquema `riskProfileSchema`) usa um perfil de limites do chamador, nunca
valores embutidos, e todo resultado afirma que é indicativo e não substitui um corte de teste.

## Configurações de máquina e pós-processadores de corte

O barrel expõe, de forma aditiva, `getMachineConfiguration`, `listMachineConfigurations`, `toMachineProfile`,
`validateMachineConfiguration`, `mapToMachineFrame`, os processadores `talvi6000w`, `gloryStarGs3015` e
`hyperthermEdgeProHpr400xda`, a tabela de corte Hypertherm (`importCutChartTable`, `findCutChartEntry`,
`cutChartSettings`), o catálogo de receitas da Talvi (`importTalviRecipes`, `findTalviRecipe`) e os tipos de
`src/nesting/post/machine`, `src/nesting/post/cutcharts` e `src/nesting/post/recipes`. A biblioteca não lê arquivos,
rede nem credenciais: configurações, linhas da tabela e textos das receitas chegam como dado. Um programa só é liberável
quando todo valor crítico da configuração está `approved`.
