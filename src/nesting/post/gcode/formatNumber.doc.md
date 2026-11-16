# formatNumber

## Visão geral

Formata números de G-code com precisão fixa. É o único formatador numérico do módulo de pós-processamento, compartilhado pelo escritor e pelos dialetos.

## Responsabilidades

- Escrever o número com a precisão pedida.
- Nunca escrever zero negativo, inclusive quando o valor arredonda para zero por baixo.
- Manter ou aparar os zeros finais conforme a opção.

## Entradas e saídas

```ts
export function formatNumber(value: number, precision: number, trailingZeros?: boolean): string
```

## Fluxo principal

```mermaid
flowchart LR
  A[valor] --> B[toFixed]
  B --> C[remove sinal de zero]
  C --> D[mantém ou apara zeros]
```

## Tratamento de erros e casos-limite

Valor não finito lança `Error`; chamadores validam a geometria antes (`GEOMETRY_INVALID`).

## Exemplos

```ts
formatNumber(-0.00004, 4, true) // '0.0000'
formatNumber(1.5, 4)            // '1.5'
```

## Dependências e integrações

Nenhuma.
