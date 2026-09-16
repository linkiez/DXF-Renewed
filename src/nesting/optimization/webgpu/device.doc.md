# optimization/webgpu/device

## Visão geral
Módulo `device.ts` da feature 003-nesting-optimization-gpu.

## Responsabilidades
- Sondar `globalThis.navigator?.gpu` em tempo de execução (FR-004).
- Adquirir um dispositivo com suporte ao pipeline compute.
- Fornecer a superfície estrutural necessária para buffers, dispatch e readback.
- Usar apenas interfaces estruturais locais; sem `any`/`unknown` no domínio (Constitution V).

## Entradas / Saídas
- Entrada: ambiente global do runtime.
- Saída: `GpuProbeResult`/`GpuDeviceResult`, sem I/O de rede.

## Fluxo principal
1. Lê `globalThis.navigator` por meio de um tipo estrutural local.
2. Ausência de `navigator` ou de `gpu` devolve `available: false` com motivo explícito.
3. `requestGpuDevice` valida a presença das operações compute antes de entregar o dispositivo.
4. Falhas de aquisição ou dispositivos incompatíveis devolvem motivo explícito.

## Erros
- Nenhum caminho lança; indisponibilidade é dado de retorno, não exceção.

## Exemplos
Cobertura indireta em `test/unit/nesting/optimization/backendSelection.test.ts` e `test/integration/nesting/gpuFallback.test.ts`.

## Dependências
- `src/nesting/types.ts`.
