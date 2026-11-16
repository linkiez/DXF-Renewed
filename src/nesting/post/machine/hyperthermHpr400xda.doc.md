# hyperthermHpr400xda

## Visão geral

Dados da configuração embutida da plasma Hypertherm EDGE Pro HPR400XDa, cada valor com sua fonte e classificação. Nenhum valor é aprovado.

## Responsabilidades

- Registrar o dialeto confirmado pelo Programmer Reference 809550 e o que vem só do pós do SigmaNEST.
- Registrar os conflitos entre fontes (tamanho da mesa, avanço rápido, ordem dos códigos V5xx).
- Listar as pré-condições do controlador.

## Entradas e saídas

```ts
export const hyperthermHpr400xdaConfiguration: MachineConfiguration
```

## Fluxo principal

```mermaid
flowchart LR
  A[Programmer Reference + pós do SigmaNEST] --> B[configuração embutida]
```

## Tratamento de erros e casos-limite

O referencial e o envelope ficam inferidos: a orientação dos eixos é definida no setup do CNC. A aplicabilidade do manual do EDGE Connect ao HyPath com Phoenix 9.761 é confirmação de uma pessoa.

## Exemplos

```ts
const copy = getMachineConfiguration('hypertherm-edge-pro-hpr400xda')
```

## Dependências e integrações

`./types`.
