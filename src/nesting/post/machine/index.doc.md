# index

## Visão geral

Barrel da API de configuração de máquina do pós-processamento modular.

## Responsabilidades

- Reexportar os tipos e as funções públicas da configuração.
- Não exportar os auxiliares internos.

## Entradas e saídas

```ts
export { mapToMachineFrame, toMachineProfile, validateMachineConfiguration }
export type { MachineConfiguration, MachineFrame, ProfileRequest, /* ... */ }
```

## Fluxo principal

```mermaid
flowchart LR
  A[post/index] --> B[machine/index]
```

## Tratamento de erros e casos-limite

Nada novo é registrado aqui; o registro de processadores fica em `post/index.ts`.

## Exemplos

```ts
import { toMachineProfile } from 'dxf/nesting'
```

## Dependências e integrações

`./types`, `./mapToMachineFrame`, `./toMachineProfile`, `./validateMachineConfiguration`.
