# optimization/backend

## Visão geral
Módulo `backend.ts` da feature 003-nesting-optimization-gpu.

## Responsabilidades
- Selecionar o caminho de cálculo (`cpu` ou `webgpu`) a partir do campo `acceleration` (FR-004).
- Construir o `ExecutionBackendReport` com `backend`, `requested`, `accelerated`, `fallbackReason?` e `timings` (FR-007).
- Aplicar o portão SC-004: abandonar aceleração que não atinja >= 2× a linha de base.

## Entradas / Saídas
- Entrada: `acceleration` efetivo (default `true`) e tempos medidos.
- Saída: `ExecutionBackendReport`; tempos são medição apenas, nunca orçamento de busca (FR-007).

## Fluxo principal
1. `acceleration === false` fixa `cpu` com `requested: false` sem sondar adaptador (FR-004).
2. `acceleration !== false` sonda o adaptador; como nenhum executor acelerado está ligado à busca, a execução permanece em `cpu` e registra `fallbackReason` explícito (falha silenciosa proibida; FR-004/FR-007). O ramo `webgpu` só deve retornar `accelerated: true` após o dispatch real em `webgpu/score.ts` passar no portão SC-004 (T024).
3. `meetsAccelerationGate(baselineMs, acceleratedMs)` exige `baselineMs >= 2 × acceleratedMs` e tempos válidos.
4. Nenhuma colocação já concluída é descartada em qualquer caminho (FR-006).

## Erros
- Adaptador ausente, perda no meio da execução ou ganho insuficiente resultam em `fallbackReason` populado, nunca em exceção.

## Exemplos
Cobertura em `test/unit/nesting/optimization/backendSelection.test.ts`, `test/unit/nesting/optimization/sc004Benchmark.test.ts` e `test/integration/nesting/gpuFallback.test.ts`.

## Dependências
- `src/nesting/types.ts`, `src/nesting/optimization/webgpu/device.ts`.
