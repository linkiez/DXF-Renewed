# builtInConfigurations

## Visão geral

Registro interno das configurações de máquina embutidas, por identificador.

## Responsabilidades

- Reunir as configurações embutidas em um só lugar.
- Ser lido apenas por `getMachineConfiguration` e `listMachineConfigurations`.

## Entradas e saídas

```ts
export const BUILT_IN_CONFIGURATIONS: ReadonlyMap<string, MachineConfiguration>
```

## Fluxo principal

```mermaid
flowchart LR
  A[talvi6000w] --> B[registro]
  B --> C[get / list]
```

## Tratamento de erros e casos-limite

Quem lê recebe cópias profundas, nunca o objeto do registro.

## Exemplos

```ts
BUILT_IN_CONFIGURATIONS.get('talvi-6000w')
```

## Dependências e integrações

`./talvi6000w`.
