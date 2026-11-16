# edit/transformMembers

## Visão geral

Transforma a peça editada junto com as peças internas aos seus furos, em torno do mesmo pivô.

## Responsabilidades

- Devolver as peças transformadas, as chaves do grupo e se o grupo é conhecido.

## Entradas e saídas

```ts
export function transformMembers(working: WorkingLayout, edit: CandidateEdit): TransformedMembers
```

## Fluxo principal

```mermaid
flowchart LR
  A[edição] --> B[grupo]
  B --> C[transformar todos no mesmo pivô]
```

## Tratamento de erros e casos-limite

Lança `RangeError` para uma chave de peça desconhecida.

## Exemplos

```ts
const { parts } = transformMembers(working, edit)
```

## Dependências e integrações

`./enclosedGroup`, `./pivotOf` e `./transformPlacement`.
