# listMachineConfigurations

## Visão geral

Lista as configurações de máquina embutidas em ordem determinística.

## Responsabilidades

- Devolver resumos ordenados por identificador.

## Entradas e saídas

```ts
export function listMachineConfigurations(): readonly MachineConfigurationSummary[]
```

## Fluxo principal

```mermaid
flowchart LR
  A[registro] --> B[resumos ordenados]
```

## Tratamento de erros e casos-limite

Lista vazia só se nenhuma configuração estiver registrada.

## Exemplos

```ts
listMachineConfigurations().map((c) => c.configurationId)
```

## Dependências e integrações

`./builtInConfigurations`.
