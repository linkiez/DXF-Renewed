# glorystar-gs3015

## Visão geral

Processador da laser GloryStar GS3015 no dialeto do pós do SigmaNEST, revisão `sigmanest-23.2-1`.

## Responsabilidades

- Escrever cabeçalho, um bloco por contorno com o desligamento da chama escolhido pela distância ao próximo, e o encerramento.
- Mapear as coordenadas (rotação de 90 graus) e rejeitar o que sai do envelope.
- Exigir avanço, tipo de perfuração, espessura e qualidade de cada contorno.
- Bloquear a liberação de valores críticos não aprovados.

## Entradas e saídas

```ts
export const gloryStarGs3015: PostProcessor // id 'glorystar-gs3015', revisão 'sigmanest-23.2-1'
```

## Fluxo principal

```mermaid
flowchart LR
  A[plano + perfil] --> B[cabeçalho]
  B --> C[contorno + flame-off]
  C --> D[encerramento]
```

## Tratamento de erros e casos-limite

Sem configuração válida ou sem os ajustes obrigatórios, `emit` devolve texto vazio. Não há programa real da máquina para comparar: a referência é revisada à mão.

## Exemplos

```ts
generateMachineProgram(plan, toMachineProfile(configuration, { sheet, processSettings: { feed: 3000, piercingType: 1, thickness: 6 }, expectedOutput }))
```

## Dependências e integrações

`../dialects/glorystar/*`, `../machine/*`, `../gcode/*`.
