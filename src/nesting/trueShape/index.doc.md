# trueShape/entry

## Visão geral
Módulo `index.ts` da feature 002-true-shape-nesting.

## Responsabilidades
- Entrada `nestTrueShape`: clearances, filtro de remanescente (FR-008), orçamento, colocações e não colocadas.
- Executar o baseline CPU e, quando disponível, o scorer WebGPU.
- Validar paridade e o portão SC-004 antes de publicar um resultado acelerado.

## Entradas / Saídas
- Entradas: parâmetros tipados das funções exportadas em `index.ts`.
- Saídas: valores tipados; aquisição WebGPU opcional e sem I/O de rede.

## Fluxo principal
1. Recebe geometria já validada pelo chamador.
2. Executa o baseline determinístico e tenta o scorer WebGPU quando há dispositivo compatível.
3. Aceita aceleração somente com paridade de layout/métricas e ganho mínimo de 2×; caso contrário retorna ao CPU com motivo explícito.
4. Devolve o resultado; geometria degenerada resulta em ausência de candidato, nunca em exceção.

## Erros
- Entradas fora do contrato (ex.: `edgeClearance` negativo) são rejeitadas antes da busca; partes não posicionáveis são reportadas em `unplaced` com motivo explícito (FR-006).

## Exemplos
Cobertura em `test/unit/nesting/trueShape*.test.ts` e `test/integration/nesting/trueShapePipeline.test.ts`.

## Dependências
- `src/nesting/types.ts`, `src/nesting/polygonUtils.ts`, `src/nesting/collision.ts`, `src/nesting/config.ts`.
