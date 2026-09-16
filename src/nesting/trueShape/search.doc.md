# trueShape/search

## Visão geral
Módulo `search.ts` da feature 002-true-shape-nesting.

## Responsabilidades
- Busca determinística com orçamento derivado da entrada (FR-005/FR-007) e melhor arranjo por objetivo ponderado.
- Expor um scorer assíncrono opcional para propostas WebGPU, mantendo seleção e validação no CPU.
- Rejeitar resultados de scorer com cardinalidade ou valores não finitos inválidos.

## Entradas / Saídas
- Entradas: parâmetros tipados das funções exportadas em `search.ts`.
- Saídas: valores tipados; o orçamento não depende do relógio (FR-007).

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
