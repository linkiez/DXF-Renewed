# talvi-6000w

## Visão geral

Processador da laser Talvi 6000 W no dialeto de macros do controlador LaserAhead, revisão `laserahead-1`.

## Responsabilidades

- Escrever cabeçalho, preparação, um bloco por contorno e o encerramento fixo.
- Mapear as coordenadas para o referencial da máquina e rejeitar o que sai do envelope.
- Bloquear a liberação de valores críticos não aprovados e de seletores sem mapeamento.
- Não escrever nenhum valor de receita: ela pertence ao controlador.

## Entradas e saídas

```ts
export const talvi6000w: PostProcessor // id 'talvi-6000w', revisão 'laserahead-1'
```

## Fluxo principal

```mermaid
flowchart LR
  A[plano + perfil] --> B[splitContours]
  B --> C[cabeçalho + preparação]
  C --> D[contornos]
  D --> E[encerramento]
```

## Tratamento de erros e casos-limite

Sem `profile.configuration`, `emit` devolve texto vazio e `validate` acusa `CONFIG_FIELD_MISSING`. Sem mapeamento de processo o programa sai como rascunho.

## Exemplos

```ts
generateMachineProgram(plan, toMachineProfile(configuration, { sheet, expectedOutput }))
```

## Dependências e integrações

`../dialects/*`, `../machine/*`, `../gcode/writer`.
