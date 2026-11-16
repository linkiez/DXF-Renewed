# validateCostModel

## Visão geral

Valida o modelo de custo além do schema e devolve todos os problemas encontrados, sem lançar exceção.

## Responsabilidades

- Taxas, preços, tempos de manuseio e custos de consumíveis finitos e maiores ou iguais a zero; velocidades, vidas e unidade de geometria maiores que zero.
- Código de moeda com três letras maiúsculas e zero a quatro dígitos menores; ids de consumíveis únicos.
- Valores com moeda diferente da do modelo viram `MIXED_CURRENCY`.

## Entradas e saídas

```ts
export function validateCostModel(model: CostModel): CostNotice[]
```

## Fluxo principal

```mermaid
flowchart LR
  A[modelo] --> B[avisos de erro]
```

## Tratamento de erros e casos-limite

Campo opcional ausente não é problema.

## Exemplos

```ts
validateCostModel(model).map((notice) => notice.code)
```

## Dependências e integrações

`./messages` e `./types`.
