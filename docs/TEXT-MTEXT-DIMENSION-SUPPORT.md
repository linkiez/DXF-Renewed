# TEXT, MTEXT and DIMENSION - SVG Rendering Support# TEXT, MTEXT e DIMENSION - Suporte de Renderização SVG

## Summary of Changes## Resumo das Mudanças

Added complete support for rendering TEXT, MTEXT, and DIMENSION entities in SVG.Adicionado suporte completo para renderização de entidades TEXT, MTEXT e DIMENSION em SVG.

## Supported Entities## Entidades Suportadas

### TEXT### TEXT

- Basic text rendering- Renderização básica de texto

- Rotation support (code 50)- Suporte para rotação (código 50)

- Positioning support (codes 10, 20, 30)- Suporte para posicionamento (códigos 10, 20, 30)

- Text height support (code 40)- Suporte para altura do texto (código 40)

- Horizontal and vertical alignment (codes 72, 73)- Alinhamento horizontal e vertical (códigos 72, 73)

### MTEXT### MTEXT

- Multi-line text rendering- Renderização de texto multilinha

- Rotation support via X-axis direction (codes 11, 21)- Suporte para rotação via direção do eixo X (códigos 11, 21)

- Reference rectangle width support (code 41)- Suporte para largura do retângulo de referência (código 41)

- Nominal text height (code 40)- Altura nominal do texto (código 40)

- Attachment point (code 71)- Ponto de fixação (código 71)

### DIMENSION### DIMENSION

Support for all dimension types:Suporte para todos os tipos de dimensão:

#### Type 0 - Rotated, horizontal or vertical#### Tipo 0 - Rotated, horizontal ou vertical

- Extension lines- Linhas de extensão

- Dimension line- Linha de dimensão

- Dimension text- Texto de dimensão

#### Type 1 - Aligned#### Tipo 1 - Aligned (alinhada)

- Dimension line aligned with measured points- Linha de dimensão alinhada com os pontos medidos

- Perpendicular extension lines- Linhas de extensão perpendiculares

#### Type 2 - Angular#### Tipo 2 - Angular (angular)

- Angle dimension between two lines- Dimensão de ângulo entre duas linhas

#### Type 3 - Diameter#### Tipo 3 - Diameter (diâmetro)

- Radial dimension line for diameters- Linha de dimensão radial para diâmetros

- Text with diameter symbol- Texto com símbolo de diâmetro

#### Type 4 - Radius#### Tipo 4 - Radius (raio)

- Radial dimension line- Linha de dimensão radial

- Text with R prefix- Texto com prefixo R

#### Type 5 - Angular 3 point#### Tipo 5 - Angular 3 point (angular 3 pontos)

- Angular dimension defined by 3 points- Dimensão angular definida por 3 pontos

#### Type 6 - Ordinate#### Tipo 6 - Ordinate (ordenada)

- X or Y coordinate dimension- Dimensão de coordenada X ou Y

- Simple extension line- Linha de extensão simples

## Implemented DXF Codes## Códigos DXF Implementados

### TEXT

| Code | Description || Código | Descrição |

|------|-------------||--------|-----------|

| 1 | Text content || 1 | Conteúdo do texto |

| 10, 20, 30 | Insertion point (x, y, z) || 10, 20, 30 | Ponto de inserção (x, y, z) |

| 11, 21, 31 | Second alignment point || 11, 21, 31 | Segundo ponto de alinhamento |

| 40 | Text height || 40 | Altura do texto |

| 41 | Relative X scale || 41 | Escala relativa X |

| 50 | Rotation in degrees || 50 | Rotação em graus |

| 51 | Oblique angle || 51 | Ângulo oblíquo |

| 72 | Horizontal alignment || 72 | Alinhamento horizontal |

| 73 | Vertical alignment || 73 | Alinhamento vertical |

### MTEXT### MTEXT

| Code | Description || Código | Descrição |

|------|-------------||--------|-----------|

| 1, 3 | Text content || 1, 3 | Conteúdo do texto |

| 10, 20, 30 | Insertion point || 10, 20, 30 | Ponto de inserção |

| 11, 21, 31 | X-axis direction || 11, 21, 31 | Direção do eixo X |

| 40 | Nominal text height || 40 | Altura nominal do texto |

| 41 | Reference rectangle width || 41 | Largura do retângulo de referência |

| 71 | Attachment point || 71 | Ponto de fixação |

| 72 | Drawing direction || 72 | Direção do desenho |

### DIMENSION### DIMENSION

| Code | Description || Código | Descrição |

|------|-------------||--------|-----------|

| 2 | Block name || 2 | Nome do bloco |

| 10, 20, 30 | Definition point || 10, 20, 30 | Ponto de definição |

| 11, 21, 31 | Text midpoint || 11, 21, 31 | Ponto médio do texto |

| 13, 23, 33 | Measurement start point || 13, 23, 33 | Ponto inicial da medida |

| 14, 24, 34 | Measurement end point || 14, 24, 34 | Ponto final da medida |

| 50 | Rotation angle || 50 | Ângulo de rotação |

| 70 | Dimension type || 70 | Tipo de dimensão |

## Usage Example## Exemplo de Uso

```javascript```javascript

import { Helper } from '@linkiez/dxf-renew'

const dxfString = `... DXF content ...`const dxfString = `... conteúdo DXF ...`

const helper = new Helper(dxfString)const helper = new Helper(dxfString)

// Convert to SVG (now includes TEXT, MTEXT and DIMENSION)// Converter para SVG (agora inclui TEXT, MTEXT e DIMENSION)

const svg = helper.toSVG()const svg = helper.toSVG()

```



## Tests## Testes



Unit tests have been added in `test/unit/text-mtext-dimension-rendering.js` that verify:Foram adicionados testes unitários em `test/unit/text-mtext-dimension-rendering.js` que verificam:



- Basic TEXT rendering- Renderização básica de TEXT

- Basic MTEXT rendering- Renderização básica de MTEXT

- DIMENSION rendering- Renderização de DIMENSION

- TEXT rotation- Rotação de TEXT

- MTEXT rotation via X-axis direction- Rotação de MTEXT via direção do eixo X

- Different DIMENSION types- Diferentes tipos de DIMENSION



Run tests with:Execute os testes com:



```bash```bash

npm testnpm test

``````

## Visual Example## Exemplo Visual

An interactive visual example is available at `examples/text-dimension-viewer.html`.Um exemplo visual interativo está disponível em `examples/text-dimension-viewer.html`.

To view:Para visualizar:

1. Run `npm run build` to generate the bundle1. Execute `npm run build` para gerar o bundle

2. Open `examples/text-dimension-viewer.html` in a browser2. Abra `examples/text-dimension-viewer.html` em um navegador

3. Load a DXF file or use the provided test files3. Carregue um arquivo DXF ou use os arquivos de teste fornecidos

## Known Limitations## Limitações Conhecidas

1. **TEXT and MTEXT**:1. **TEXT e MTEXT**:

   - Font is not respected (uses browser default font)   - Fonte não é respeitada (usa fonte padrão do navegador)

   - Complex MTEXT formatting is not fully supported   - Formatação complexa de MTEXT não é totalmente suportada

   - Bounding box calculation is approximate   - Cálculo de bounding box é aproximado

2. **DIMENSION**:2. **DIMENSION**:

   - Custom dimension blocks are not rendered   - Blocos de dimensão personalizados não são renderizados

   - Only basic dimension lines are drawn   - Apenas linhas básicas de dimensão são desenhadas

   - Dimension text is not displayed (needs to be extracted from block)   - Texto de dimensão não é exibido (precisa ser extraído do bloco)

   - Arrows are not rendered   - Setas não são renderizadas

## Modified Files## Arquivos Modificados

- `src/toSVG.js`: Added `text()`, `mtext()`, `dimension()` and `createDimensionPaths()` functions- `src/toSVG.js`: Adicionadas funções `text()`, `mtext()`, `dimension()` e `createDimensionPaths()`

- `test/unit/text-mtext-dimension-rendering.js`: New unit tests- `test/unit/text-mtext-dimension-rendering.js`: Novos testes unitários

- `examples/text-dimension-viewer.html`: Interactive visual example

## Next Steps

To further improve support:

1. Implement dimension arrow rendering
2. Extract and render dimension text from blocks
3. Support custom text styles
4. Improve bounding box calculation for text
5. Support advanced MTEXT formatting (colors, bold, etc.)
