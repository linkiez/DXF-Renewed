# partPrep/entry

## Visão geral
Preparação de peças: extract → units → repair → simplify → offset → classify.

## Responsabilidades
- `prepareParts`/`prepare`: extrai contornos, unifica unidade, repara, simplifica, aplica cut width e classifica; reporta issues com motivo explícito.

## Entradas / Saídas
- Entradas: DXF + `PrepareOptions` (inclui `signal?: AbortSignal`).
- Saídas: `Observable<PrepareResult>` — lazy/cold: nada roda antes do `subscribe`, cada assinatura reexecuta o pipeline, `unsubscribe` faz teardown silencioso (sem `next`/`complete`/`error`).

## Erros
- Entrada fora do contrato → `error` único. Problema esperado de preparação → `issues` com motivo explícito na emissão, nunca `error` (FR-006).

## Fluxo principal
1. Valida entrada.
2. Loop de contornos com `throwIfAborted`.
3. Emite `PrepareResult` uma vez e completa.

## Dependências
`../types`, `rxjs`, `../../async/observableFlow`, submódulos `extract/units/repair/simplify/offset/classify`.
