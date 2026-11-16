# dialectValue

## Visão geral

Lê um parâmetro de dialeto da configuração. Interno aos processadores.

## Responsabilidades

- Devolver o valor ou `undefined`, nunca um padrão de outra máquina.

## Entradas e saídas

```ts
export function dialectValue(configuration: MachineConfiguration, key: string): DialectValue | undefined
```

## Fluxo principal

```mermaid
flowchart LR
  A[chave] --> B[valor ou indefinido]
```

## Tratamento de erros e casos-limite

Parâmetro ausente é acusado por `releaseIssues`; os emissores devolvem texto vazio nesse caso.

## Exemplos

```ts
dialectValue(configuration, 'lastDistance') // -999
```

## Dependências e integrações

`./types`.
