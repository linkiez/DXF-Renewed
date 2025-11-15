# Lista de Entidades DXF 2D

Esta lista foi gerada com base na documentação de referência do AutoCAD 2012 DXF. Ela cataloga as entidades 2D, indicando se já foram implementadas neste projeto.

| Entidade | Implementado | Descrição |
| :--- | :---: | :--- |
| **ARC** | ✅ | Um arco circular. |
| **CIRCLE** | ✅ | Um círculo. |
| **ELLIPSE** | ✅ | Uma elipse ou um arco elíptico. |
| **HATCH** | ✅ | Preenche uma área delimitada com um padrão, cor sólida ou gradiente. |
| **LINE** | ✅ | Um segmento de linha reta. |
| **LWPOLYLINE** | ✅ | Uma polilinha 2D leve (lightweight). |
| **MTEXT** | ✅ | Texto de múltiplas linhas com formatação avançada. |
| **POINT** | ✅ | Uma entidade de ponto. |
| **POLYLINE** | ✅ | Uma polilinha 2D ou 3D (com vértices). |
| **SOLID** | ✅ | Uma área 2D preenchida com cor sólida. |
| **SPLINE** | ✅ | Uma curva spline. |
| **TEXT** | ✅ | Uma única linha de texto. |
| **DIMENSION** | ✅ | Entidade de dimensão (linear, angular, radial, etc.). |
| **INSERT** | ✅ | Uma inserção de bloco (block reference). |
| **ATTDEF** | ✅ | Definição de atributo para um bloco. |
| **ATTRIB** | ✅ | Uma instância de atributo anexada a um bloco. |
| **OLE2FRAME** | ✅ | Um objeto OLE (Object Linking and Embedding). |
| **LEADER** | ❌ | Uma linha de chamada, usada para anotações. Cria uma linha que conecta a anotação a um recurso em um desenho. |
| **MLINE** | ❌ | Uma entidade de múltiplas linhas paralelas. |
| **RAY** | ❌ | Uma linha semi-infinita que se estende infinitamente em uma direção a partir de seu ponto inicial. |
| **SHAPE** | ❌ | Uma forma de um arquivo de formas (.shx). Insere uma forma nomeada a partir de um arquivo de forma que já tenha sido carregado usando o comando LOAD. |
| **TOLERANCE** | ❌ | Uma tolerância geométrica. Cria tolerâncias geométricas contidas em um quadro de controle de recurso. |
| **TRACE** | ❌ | Uma linha 2D sólida com espessura. |
| **WIPEOUT** | ❌ | Uma área que mascara outros objetos com a cor de fundo. |
| **XLINE** | ❌ | Uma linha de construção infinita. |

---

## Entidades 3D (Para Referência)

| Entidade | Implementado | Descrição |
| :--- | :---: | :--- |
| **3DFACE** | ✅ | Uma face tridimensional. |
| **3DSOLID** | ❌ | Um objeto sólido ACIS 3D. Exibe sólidos 3D como objetos de arame ou sombreados. |
| **BODY** | ❌ | Um objeto de corpo ACIS 3D. |
| **HELIX** | ❌ | Uma hélice 3D. |
| **IMAGE** | ❌ | Uma imagem raster. |
| **LIGHT** | ❌ | Uma fonte de luz. |
| **MESH** | ❌ | Uma malha 3D. |
| **REGION** | ❌ | Uma área 2D fechada (região). |
| **SECTION** | ❌ | Um objeto de seção. |
| **SUN** | ❌ | Um objeto de luz solar. |
| **SURFACE** | ❌ | Uma superfície 3D (extrudada, loft, etc.). |
| **TABLE** | ❌ | Uma entidade de tabela. |
| **UNDERLAY** | ❌ | Uma subjacência (ex: DWF, DGN, PDF). |
| **VIEWPORT** | ✅ | Uma viewport em paper space. |

*Observação: A implementação de `POLYLINE` pode incluir vértices 3D, mas a entidade em si é frequentemente usada para formas 2D.*
