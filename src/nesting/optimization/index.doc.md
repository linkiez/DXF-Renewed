# optimization

## Visão geral
Barrel do módulo `optimization` da feature 003-nesting-optimization-gpu.

## Responsabilidades
- Reexportar `normalizeObjective`, `selectBackend`, `createBackendReport`, `meetsAccelerationGate` e `scoreLayout`.
- Reexportar a superfície de sondagem, dispatch e pontuação WebGPU (`probeGpu`, `requestGpuDevice`,
  `dispatchGpuScores`, `fixedPointScore`, `proposeOrder`).

## Entradas / Saídas
- Entradas: parâmetros tipados das funções reexportadas.
- Saídas: valores tipados; sem I/O bloqueante e sem dependência de relógio no orçamento de busca (FR-007).

## Fluxo principal
1. `trueShape/index.ts` resolve o objetivo por `normalizeObjective`.
2. `selectBackend`/`selectBackendAsync` escolhem o candidato de backend.
3. `searchBestArrangement` pontua com `scoreLayout`; `dispatchGpuScores` executa a proposta WebGPU.
4. `createBackendReport` fecha o relatório ecoado na resposta.

## Erros
- Objetivos inválidos e falhas de aceleração são reportados explicitamente; nenhuma condição lança em `nestTrueShape`.

## Exemplos
Cobertura em `test/unit/nesting/optimization/*.test.ts` e `test/integration/nesting/gpuFallback.test.ts`.

## Dependências
- `src/nesting/types.ts`, `src/nesting/config.ts`, `src/nesting/optimization/objective.ts`, `src/nesting/optimization/backend.ts`, `src/nesting/optimization/webgpu/*`.
