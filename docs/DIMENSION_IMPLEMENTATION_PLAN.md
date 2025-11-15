# Plano de Implementação para Renderização Completa de `DIMENSION`

O objetivo é renderizar a entidade `DIMENSION` de forma precisa, respeitando seus diferentes tipos e, crucialmente, os estilos definidos na tabela `DIMSTYLE`.

---

## **Fase 1: Análise e Armazenamento de Estilos (`DIMSTYLE`)** ✅ COMPLETA

Atualmente, a biblioteca lê a entidade `DIMENSION`, mas não sabe como estilizá-la. Esta fase foca em obter essa informação.

1. **Criar um Handler para a Tabela `DIMSTYLE`:**
    * **Objetivo:** Ler a tabela `TABLES` no arquivo DXF, encontrar a seção `DIMSTYLE` e analisar todas as suas variáveis.
    * **Ações:**
        * Criar um novo arquivo `src/handlers/tables/dimstyle.ts`.
        * Implementar uma função `process(tuples)` que mapeie os group codes do `DIMSTYLE` (ex: `41` para `DIMASZ` - tamanho da seta, `140` para `DIMTXT` - altura do texto, `176` para `DIMCLRD` - cor da linha) para uma interface.
        * Criar a interface `DimStyle` em `src/types/tables.ts` para armazenar essas propriedades.

2. **Integrar a Análise de `DIMSTYLE` no Fluxo Principal:**
    * **Objetivo:** Armazenar todos os estilos de dimensão lidos para que possam ser acessados posteriormente.
    * **Ações:**
        * No `parseString.ts`, modificar a lógica para chamar o novo handler de `DIMSTYLE` quando a tabela correspondente for encontrada.
        * Armazenar os estilos analisados em um mapa (ex: `dxf.tables.dimStyles: Map<string, DimStyle>`), onde a chave é o nome do estilo.

3. **Associar Entidade `DIMENSION` ao seu `DIMSTYLE`:**
    * **Objetivo:** Cada entidade `DIMENSION` precisa de uma referência direta ao seu objeto de estilo.
    * **Ações:**
        * Após a análise completa do DXF, executar um passo de "pós-processamento" que itera sobre todas as entidades `DIMENSION`.
        * Para cada `DIMENSION`, usar sua propriedade `styleName` para encontrar o objeto `DimStyle` correspondente no mapa `dxf.tables.dimStyles` e anexá-lo à entidade.

**Resultado da Fase 1:** A estrutura de dados da entidade `DIMENSION` conterá não apenas sua geometria, mas também um objeto completo com todas as suas propriedades de estilo.

---

## **Fase 2: Refatoração da Arquitetura de Renderização** ✅ COMPLETA

Com os dados de estilo disponíveis, a função de renderização precisa ser reestruturada para ser mais modular e lidar com a complexidade.

1. **Criar um Dispatcher de Renderização:**
    * **Objetivo:** A função `dimensionToSVG` em `src/toSVG.ts` deve se tornar um "dispatcher" que delega a renderização para funções especializadas com base no tipo de dimensão.
    * **Ações:**
        * Modificar `dimensionToSVG(entity, style)` para conter um `switch` no `entity.dimensionType`.
        * Cada `case` (0 para Rotated/Linear, 1 para Aligned, 2 para Angular, etc.) chamará uma função específica, como `renderLinearDimension(entity, style)`.

2. **Implementar a Renderização de Setas (`Arrowheads`):**
    * **Objetivo:** Criar uma função genérica para desenhar setas, que são usadas em quase todos os tipos de dimensão.
    * **Ações:**
        * Criar uma função `renderArrow(style)` que retorna um elemento `<marker>` SVG. Este marcador poderá ser referenciado pelas linhas de dimensão.
        * A função deve ler o `DIMBLK` (bloco da seta) e `DIMASZ` (tamanho da seta) do objeto `style`. Inicialmente, pode suportar apenas a seta padrão (triângulo preenchido).

**Resultado da Fase 2:** A arquitetura de renderização estará pronta para suportar diferentes tipos de dimensão de forma isolada e organizada.

#### Implementações da Fase 2

- ✅ Criado módulo `src/dimensionToSVG.ts` dedicado para renderização de DIMENSION
* ✅ Implementado dispatcher baseado em `dimensionType`
* ✅ Criadas funções especializadas para cada tipo:
  * `renderLinearDimension` (tipos 0 e 1)
  * `renderAngularDimension` (tipo 2)
  * `renderDiameterDimension` (tipo 3)
  * `renderRadialDimension` (tipo 4)
  * `renderOrdinateDimension` (tipo 6)
  * `renderFallbackDimension` (tipos não suportados)
* ✅ Integrado com `toSVG.ts` passando `dimStyles` do DXF parseado
* ✅ Suporte básico a propriedades de estilo (DIMASZ, DIMTXT, DIMGAP)
* ✅ Função `createArrowMarker` preparada para renderização de setas SVG

---

## **Fase 3: Implementação da Renderização por Tipo de Dimensão** ⏳ PRÓXIMA

Esta é a fase principal, onde a lógica de desenho para cada tipo de dimensão é implementada.

1. **`renderLinearDimension` e `renderAlignedDimension`:**
    * **Objetivo:** Renderizar dimensões lineares, horizontais, verticais, rotacionadas e alinhadas.
    * **Ações:**
        * Usar os pontos `measureStart` e `measureEnd` para desenhar as linhas de extensão.
        * Usar o `textMidpoint` para posicionar a linha de dimensão.
        * Aplicar as propriedades do `style` (cores, espessuras de linha).
        * Adicionar as setas (marcadores SVG) nas extremidades da linha de dimensão.
        * Posicionar e rotacionar o texto (`entity.text`) conforme o `style`.

2. **`renderAngularDimension`:**
    * **Objetivo:** Renderizar dimensões angulares (de 2 e 3 pontos).
    * **Ações:**
        * A geometria é diferente: envolve um centro e pontos nas linhas que formam o ângulo.
        * Desenhar um `path` SVG para o arco da linha de dimensão.
        * Desenhar as linhas de extensão.
        * Posicionar o texto ao longo do arco.

3. **`renderRadialDimension` e `renderDiameterDimension`:**
    * **Objetivo:** Renderizar dimensões de raio e diâmetro.
    * **Ações:**
        * A geometria envolve o centro do círculo/arco e um ponto na circunferência.
        * Desenhar uma linha do centro para a borda (raio) ou através do centro (diâmetro).
        * Adicionar a seta em uma das extremidades.
        * Posicionar o texto.

4. **`renderOrdinateDimension`:**
    * **Objetivo:** Renderizar dimensões de ordenada (coordenadas X ou Y).
    * **Ações:**
        * Este tipo é mais simples: geralmente uma linha de chamada curta e o valor da coordenada.

**Resultado da Fase 3:** A maioria dos tipos de dimensão comuns será renderizada visualmente de forma correta e estilizada.

---

#### **Fase 4: Refinamentos e Casos Especiais**

1. **Suporte a Blocos de Seta Personalizados:**
    * Se `DIMBLK` no `DIMSTYLE` for o nome de um `BLOCK`, a renderização deve inserir esse bloco como a seta, em vez de desenhar o triângulo padrão. Isso requer integração com o renderizador de `INSERT`.

2. **Tolerâncias e Unidades Alternativas:**
    * Analisar e renderizar os textos de tolerância (`DIMTOL`) e unidades alternativas (`DIMALT`) conforme definido no `DIMSTYLE`.

3. **Overrides de Estilo:**
    * Uma entidade `DIMENSION` pode ter XDATA que sobrescreve propriedades específicas do seu `DIMSTYLE`. A lógica de renderização deve aplicar essas sobreposições.
