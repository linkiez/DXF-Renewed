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
2. `acceleration !== false` adquire um dispositivo computável; a execução tenta o ramo `webgpu` e só mantém `accelerated: true` após dispatch, paridade com o baseline e aprovação do portão SC-004. Falhas retornam ao `cpu` com `fallbackReason` explícito (FR-004/FR-006/FR-007).
3. `meetsAccelerationGate(baselineMs, acceleratedMs)` exige `baselineMs >= 2 × acceleratedMs` e tempos válidos.
4. Nenhuma colocação já concluída é descartada em qualquer caminho (FR-006).

## Erros
- Adaptador ausente, perda no meio da execução ou ganho insuficiente resultam em `fallbackReason` populado, nunca em exceção.

## Exemplos
Cobertura em `test/unit/nesting/optimization/backendSelection.test.ts`, `test/unit/nesting/optimization/sc004Benchmark.test.ts` e `test/integration/nesting/gpuFallback.test.ts`.

## Dependências
- `src/nesting/types.ts`, `src/nesting/optimization/webgpu/device.ts`.
