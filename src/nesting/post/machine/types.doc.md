# types

## Visão geral

Tipos públicos da configuração de máquina: valores com fonte e classificação, referencial, envelope, mapeamento de processo e pré-condições do controlador.

## Responsabilidades

- Definir `MachineConfiguration` e os tipos de apoio exatamente como o modelo de dados.
- Manter a evidência de cada valor crítico junto do valor (`Sourced<T>`).
- Não conter lógica.

## Entradas e saídas

```ts
interface Sourced<T> { value: T; source: ValueSource }
interface MachineConfiguration { configurationId: string; processorId: string; envelope: Sourced<Envelope>; /* ... */ }
```

## Fluxo principal

```mermaid
flowchart LR
  A[MachineConfiguration] --> B[toMachineProfile]
  B --> C[MachineProfile]
```

## Tratamento de erros e casos-limite

Tipos apenas; a validação fica em `validateMachineConfiguration`.

## Exemplos

```ts
const rapid: Sourced<number> = { value: 26000, source: { classification: 'observed', reference: 'Talvi_6000W.pst:411' } }
```

## Dependências e integrações

`../types` (`MachineKind`, `Units`, `ValidationIssue`) e `../../cutPath` (`CutActionKind`).
