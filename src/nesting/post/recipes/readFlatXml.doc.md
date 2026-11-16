# readFlatXml

## Visão geral

Leitor mínimo do XML plano dos arquivos de ferramenta da Talvi, sem dependência nova. Interno.

## Responsabilidades

- Converter tags aninhadas em mapas aninhados e tags repetidas em listas, na ordem.
- Aparar o texto escalar e decodificar as entidades básicas.
- Rejeitar documento vazio, desbalanceado ou sem raiz.

## Entradas e saídas

```ts
export function readFlatXml(text: string): XmlNode
export class RecipeXmlError extends Error
```

## Fluxo principal

```mermaid
flowchart LR
  A[texto] --> B[tokens]
  B --> C[pilha de elementos]
  C --> D[mapa aninhado]
```

## Tratamento de erros e casos-limite

Lança `RecipeXmlError`; o importador a converte em `RECIPE_XML_INVALID`. Não usa `DOMParser` (não existe no Node) nem biblioteca.

## Exemplos

```ts
readFlatXml('<A><b>1</b></A>') // { b: '1' }
```

## Dependências e integrações

Nenhuma.
