# optimization/objective

## Visão geral
Módulo `objective.ts` da feature 003-nesting-optimization-gpu.

## Responsabilidades
- Validar exatamente quatro pesos finitos (`materialUse`, `travel`, `sheetCount`, `remnant`), cada `>= 0` (FR-001).
- Normalizar os pesos para soma 1 usando `EPSILON` nas comparações.
- Rejeitar pesos negativos, `NaN`, não finitos ou todos zero com motivo explícito — nunca coagir.
- `scoreLayout` é a fonte única da pontuação ponderada: CPU e kernel de ponto fixo consomem a mesma função.

## Entradas / Saídas
- Entrada: `OptimizationObjective` opcional do chamador.
- Saída: `{ ok: true, normalized }` ou `{ ok: false, reason }`; sem I/O e sem dependência de relógio (FR-001, FR-007).

## Fluxo principal
1. `undefined` resolve para `DEFAULT_OBJECTIVE_WEIGHTS` (materialUse = 1), preservando o comportamento da feature 002.
2. Cada peso é checado quanto a finitude e não-negatividade.
3. A soma é comparada a zero com `EPSILON`; se positiva, cada peso é dividido pela soma.
4. `scoreLayout(metrics, weights)` combina métricas 0–100 (maior é melhor) numa pontuação comparável.

## Erros
- Qualquer peso inválido devolve `ok: false` com motivo; `nestTrueShape` converte isso em `unplaced` explícito, sem exceção.

## Exemplos
Cobertura em `test/unit/nesting/optimization/objectiveWeights.test.ts` e `test/unit/nesting/optimization/determinism.test.ts`.

## Dependências
- `src/nesting/types.ts`, `src/nesting/config.ts`.
