# buildSheetObjects

## Visão geral

Constrói todos os objetos da cena de uma chapa: borda, peças, linhas de trilha e fantasma por tipo, marcadores, ação atual, destaque da seleção e cabeça.

## Responsabilidades

- Manter o número de objetos independente do tamanho do plano.
- Registrar tudo no registro de descarte do renderizador.

## Entradas e saídas

```ts
export function buildSheetObjects(context: BuildContext, sheet: ReviewSheet): SheetObjects
```

## Fluxo principal

```mermaid
flowchart LR
  A[ReviewSheet] --> B[SheetObjects]
```

## Tratamento de erros e casos-limite

Chapa sem linha do tempo gera buffers vazios.

## Exemplos

```ts
built = buildSheetObjects({ three, scene, own }, sheet)
```

## Dependências e integrações

`./buffers`, `./lineKinds`, `./palette` e `./threeNamespace`.
