# optimization/webgpu/score

## Visão geral
Módulo `score.ts` da feature 003-nesting-optimization-gpu.

## Responsabilidades
- Kernel de pontuação em ponto fixo que consome os mesmos pesos normalizados de `objective.ts` (FR-001).
- Dispatch compute WebGPU e readback dos scores dos candidatos.
- Devolver propostas ordenadas; CPU mantém autoridade de seleção, desempate e validação (Constitution IV).

## Entradas / Saídas
- Entradas: pesos normalizados e métricas de layout.
- Saída: pontuação inteira determinística, ordem proposta ou scores lidos do dispositivo.

## Fluxo principal
1. `FIXED_POINT_SCALE` converte pesos fracionários em inteiros.
2. `fixedPointScore` soma os produtos inteiros arredondados.
3. `dispatchGpuScores` executa o shader fixo, lê os scores e libera os buffers.
4. `proposeOrder` devolve a ordem proposta com desempate por índice; a CPU revalida cada colocação antes de emiti-la.

## Erros
- Métricas degeneradas resultam em pontuação zero; nenhum caminho lança.

## Exemplos
Cobertura em `test/unit/nesting/optimization/determinism.test.ts` e `test/unit/nesting/optimization/backendSelection.test.ts`.

## Dependências
- `src/nesting/optimization/objective.ts`.
