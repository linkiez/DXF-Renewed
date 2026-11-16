# edit/applyEdit

## Visão geral

Aplica uma edição a um layout de trabalho sem alterá-lo, atualizando o índice de vizinhança e produzindo a entrada do registro.

## Responsabilidades

- Registrar a transformação antes e depois.
- Atualizar a caixa de cada peça movida no índice da chapa.

## Entradas e saídas

```ts
export function applyEdit(working: WorkingLayout, edit: CandidateEdit): { working: WorkingLayout; edit: PartEdit }
```

## Fluxo principal

```mermaid
flowchart LR
  A[layout] --> B[transformar membros]
  B --> C[novo layout e entrada do registro]
```

## Tratamento de erros e casos-limite

Lança `RangeError` para uma chave de peça desconhecida; o juiz já validou a edição.

## Exemplos

```ts
const { working: next, edit: logged } = applyEdit(working, edit)
```

## Dependências e integrações

`./transformMembers`.
