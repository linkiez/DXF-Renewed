# linkParts

## Visão geral

Vincula as ações de corte de uma chapa às peças posicionadas nela. Módulo interno.

## Responsabilidades

- Resolver contorno para posição pelo `CutLayout`, e depois `partId` igual à chave da peça ou ao `shapeId`.
- Manter ações sem vínculo na sequência e gerar um aviso por referência distinta.
- Expor o mesmo resolvedor para os problemas de planejamento.

## Entradas e saídas

```ts
export function linkParts(args: LinkPartsArgs): LinkPartsResult
```

Entrada: `sheetId`, `partKeys`, `layout?`, `actions`. Saída: `partKeyByAction`, `resolve`, `notices`.

## Fluxo principal

```mermaid
flowchart TD
  A[ação com partId ou contourId] --> B{layout resolve?}
  B -- sim --> C[chave da peça]
  B -- não --> D{partId é chave ou shapeId?}
  D -- sim --> C
  D -- não --> E[aviso UNKNOWN_PART ou UNLINKED_ACTION]
```

## Tratamento de erros e casos-limite

Ação sem `partId` e sem `contourId` (por exemplo `end`) não gera aviso. Cada referência não
resolvida gera um único aviso, com a primeira ação em que apareceu.

## Exemplos

```ts
const { partKeyByAction } = linkParts({ sheetId: 'sheet-1', partKeys: ['part-1#0'], actions })
```

## Dependências e integrações

`../cutPath/types`, `./messages` e `./types`.
