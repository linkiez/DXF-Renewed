# TEXT, MTEXT e DIMENSION - Suporte de Renderização SVG

## Resumo das Mudanças

Adicionado suporte completo para renderização de entidades TEXT, MTEXT e DIMENSION em SVG.

## Entidades Suportadas

### TEXT

- Renderização básica de texto
- Suporte para rotação (código 50)
- Suporte para posicionamento (códigos 10, 20, 30)
- Suporte para altura do texto (código 40)
- Alinhamento horizontal e vertical (códigos 72, 73)

### MTEXT

- Renderização de texto multilinha
- Suporte para rotação via direção do eixo X (códigos 11, 21)
- Suporte para largura do retângulo de referência (código 41)
- Altura nominal do texto (código 40)
- Ponto de fixação (código 71)

### DIMENSION

Suporte para todos os tipos de dimensão:

#### Tipo 0 - Rotated, horizontal ou vertical

- Linhas de extensão
- Linha de dimensão
- Texto de dimensão

#### Tipo 1 - Aligned (alinhada)

- Linha de dimensão alinhada com os pontos medidos
- Linhas de extensão perpendiculares

#### Tipo 2 - Angular (angular)

- Dimensão de ângulo entre duas linhas

#### Tipo 3 - Diameter (diâmetro)

- Linha de dimensão radial para diâmetros
- Texto com símbolo de diâmetro

#### Tipo 4 - Radius (raio)

- Linha de dimensão radial
- Texto com prefixo R

#### Tipo 5 - Angular 3 point (angular 3 pontos)

- Dimensão angular definida por 3 pontos

#### Tipo 6 - Ordinate (ordenada)

- Dimensão de coordenada X ou Y
- Linha de extensão simples

## Códigos DXF Implementados

### TEXT

| Código | Descrição |
|--------|-----------|
| 1 | Conteúdo do texto |
| 10, 20, 30 | Ponto de inserção (x, y, z) |
| 11, 21, 31 | Segundo ponto de alinhamento |
| 40 | Altura do texto |
| 41 | Escala relativa X |
| 50 | Rotação em graus |
| 51 | Ângulo oblíquo |
| 72 | Alinhamento horizontal |
| 73 | Alinhamento vertical |

### MTEXT

| Código | Descrição |
|--------|-----------|
| 1, 3 | Conteúdo do texto |
| 10, 20, 30 | Ponto de inserção |
| 11, 21, 31 | Direção do eixo X |
| 40 | Altura nominal do texto |
| 41 | Largura do retângulo de referência |
| 71 | Ponto de fixação |
| 72 | Direção do desenho |

### DIMENSION

| Código | Descrição |
|--------|-----------|
| 2 | Nome do bloco |
| 10, 20, 30 | Ponto de definição |
| 11, 21, 31 | Ponto médio do texto |
| 13, 23, 33 | Ponto inicial da medida |
| 14, 24, 34 | Ponto final da medida |
| 50 | Ângulo de rotação |
| 70 | Tipo de dimensão |

## Exemplo de Uso

```javascript
import { Helper } from 'dxf'

const dxfString = `... conteúdo DXF ...`
const helper = new Helper(dxfString)

// Converter para SVG (agora inclui TEXT, MTEXT e DIMENSION)
const svg = helper.toSVG()
```

## Testes

Foram adicionados testes unitários em `test/unit/text-mtext-dimension-rendering.js` que verificam:

- Renderização básica de TEXT
- Renderização básica de MTEXT
- Renderização de DIMENSION
- Rotação de TEXT
- Rotação de MTEXT via direção do eixo X
- Diferentes tipos de DIMENSION

Execute os testes com:

```bash
npm test
```

## Exemplo Visual

Um exemplo visual interativo está disponível em `examples/text-dimension-viewer.html`.

Para visualizar:

1. Execute `npm run build` para gerar o bundle
2. Abra `examples/text-dimension-viewer.html` em um navegador
3. Carregue um arquivo DXF ou use os arquivos de teste fornecidos

## Limitações Conhecidas

1. **TEXT e MTEXT**:
   - Fonte não é respeitada (usa fonte padrão do navegador)
   - Formatação complexa de MTEXT não é totalmente suportada
   - Cálculo de bounding box é aproximado

2. **DIMENSION**:
   - Blocos de dimensão personalizados não são renderizados
   - Apenas linhas básicas de dimensão são desenhadas
   - Texto de dimensão não é exibido (precisa ser extraído do bloco)
   - Setas não são renderizadas

## Arquivos Modificados

- `src/toSVG.js`: Adicionadas funções `text()`, `mtext()`, `dimension()` e `createDimensionPaths()`
- `test/unit/text-mtext-dimension-rendering.js`: Novos testes unitários
- `examples/text-dimension-viewer.html`: Exemplo visual interativo

## Próximos Passos

Para melhorar ainda mais o suporte:

1. Implementar renderização de setas de dimensão
2. Extrair e renderizar texto de dimensão dos blocos
3. Suportar estilos de texto personalizados
4. Melhorar cálculo de bounding box para texto
5. Suportar formatação avançada de MTEXT (cores, negrito, etc.)
