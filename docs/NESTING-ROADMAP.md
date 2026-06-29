# Roadmap: Nesting de Peças via DXF-Renewed + SVGnest

> Integra o algoritmo de nesting do [SVGnest](https://github.com/Jack000/SVGnest) como pipeline dentro do DXF-Renewed, permitindo que arquivos DXF de peças para corte a laser/CNC sejam automaticamente organizados em chapas para maximizar aproveitamento de material.

---

## Contexto

### O problema
Arquivos DXF de peças de metal (corte a laser, plasma, CNC) geralmente contêm peças espalhadas pelo desenho sem otimização de chapa. O operador precisa manualmente organizar as peças no material — processo lento e com desperdício.

### A solução
Adicionar ao DXF-Renewed um pipeline de nesting que:
1. **Parseia** o DXF e extrai as peças como polylines
2. **Alimenta** o algoritmo SVGnest (NFP + Genetic Algorithm)
3. **Retorna** um DXF/SVG com as peças organizadas na chapa
4. **Reporta** métricas de aproveitamento

### Por que SVGnest
- Algoritmo maduro (NFP orbital + GA) usado em produção
- Resultados comparáveis a software comercial (SigmaNest, AutoCAD Nest)
- Suporta containers não-retangulares, peças concavas, part-in-part
- MIT license — compatível
- Já roda no browser (WebWorker) e pode ser adaptado para Node

---

## Arquitetura do Pipeline

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  DXF Input  │ ──▶ │ DXF-Renewed  │ ──▶ │ Polyline    │
│  (peças)    │     │ parseString  │     │ Extraction  │
└─────────────┘     │ denormalise  │     └──────┬──────┘
                    └──────────────┘             │
                                                 ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  DXF/SVG    │ ◀── │ Polyline     │ ◀── │ Nested      │
│  Output     │     │ Reassembly   │     │ Polyline    │
│  (chapa)    │     │ + Transform  │     │ Positions   │
└─────────────┘     └──────────────┘     └──────┬──────┘
                                                 ▲
                                        ┌────────┴────────┐
                                        │  SVGnest Core   │
                                        │  (adaptado)     │
                                        │  NFP + GA      │
                                        └────────────────┘
```

---

## Fases de Implementação

### Fase 0 — Fundação & Adaptação do SVGnest (Semana 1-2)

**Objetivo:** Fazer o SVGnest rodar como módulo ESModule no ecossistema do DXF-Renewed.

#### Tarefas

- [ ] **0.1 — Clonar e analisar o SVGnest**
  - Baixar `svgnest.js` e `svgparser.js` do repositório
  - Mapear todas as dependências internas (ClipperLib, GeometryUtil)
  - Identificar o que precisa de adaptação (IIFE → ESM, browser APIs → Node)

- [ ] **0.2 — Criar wrapper ESM do SVGnest**
  - Converter o código IIFE do SVGnest para módulos ES
  - Isolar o núcleo do algoritmo (NFP calculation, GA, placement) da UI
  - Criar interface limpa: `nest(parts, bin, config) → placements`

- [ ] **0.3 — Adaptar ClipperLib**
  - SVGnest usa ClipperLib para operações booleanas de polígonos
  - Verificar compatibilidade com `vecks` (já dependência do DXF-Renewed)
  - Decisão: usar ClipperLib original ou substituir por vecks/polyclip
  - ⚠️ `vecks` já faz bounding box; avaliar se cobre NFP ou precisa de ClipperLib

- [ ] **0.4 — Testes de fumaça**
  - Criar fixture com 3-5 peças simples (quadrados, retângulos)
  - Validar que o nesting retorna posições válidas sem sobreposição
  - Benchmark básico: tempo para nesting de 10 peças

**Entregável:** Módulo `src/nest/svgNestCore.js` com API limpa testável.

---

### Fase 1 — Bridge DXF → SVGnest (Semana 3-4)

**Objetivo:** Converter polylines do DXF-Renewed em "parts" consumíveis pelo SVGnest.

#### Tarefas

- [ ] **1.1 — Definir formato intermediário**
  Criar tipo `NestPart` que serve de ponte:
  ```typescript
  interface NestPart {
    id: string;              // identificador único
    layer: string;           // camada original do DXF
    vertices: [number, number][]; // contorno principal
    holes: [number, number][][];  // buracos internos (se houver)
    color?: [number, number, number];
    bbox: { x: number; y: number; w: number; h: number };
    area: number;
  }
  ```

- [ ] **1.2 — Implementar `extractNestParts(parsed: ParsedDXF) → NestPart[]`**
  - Usar `toPolylines` existente como base
  - Agrupar polylines por peça (mesma camada + proximidade espacial)
  - Identificar contornos externos vs. buracos (point-in-polygon test)
  - Calcular área e bbox de cada peça
  - ⚠️ Desafio: DXF pode ter peças como múltiplas LINEs adjacentes — preciso unificar

- [ ] **1.3 — Normalização de coordenadas**
  - Centralizar peças na origem (0,0) antes do nesting
  - Normalizar escala se necessário
  - Preservar transformações originais para rollback

- [ ] **1.4 — Definição da chapa (bin)**
  - Permitir configurar chapa retangular (ex: 1250x2500mm para aço)
  - Permitir importar chapa do próprio DXF (peça maior = bin)
  - Suportar chapa customizada com recortes

- [ ] **1.5 — Testes com fixtures reais**
  - Usar DXFs de peças reais do JCM (se disponíveis em `test/resources/`)
  - Validar que peças são extraídas corretamente
  - Testar edge cases: peças com buracos, peças concavas, texto no DXF

**Entregável:** Função `extractNestParts()` com testes unitários + fixtures.

---

### Fase 2 — Core Nesting API (Semana 5-6)

**Objetivo:** API principal `nestDXF()` que orquestra todo o pipeline.

#### Tarefas

- [ ] **2.1 — Implementar `nestDXF()`**
  ```typescript
  interface NestOptions {
    binSize: { width: number; height: number };    // tamanho da chapa
    spacing: number;                                // kerf do laser (mm)
    curveTolerance: number;                         // precisão de curvas
    maxRotations: number;                           // rotações a avaliar (0, 90, 180, 270)
    allowRotation: boolean;                         // permitir rotação livre
    partInPart: boolean;                            // usar buracos de outras peças
    gaPopulation: number;                           // população do GA
    gaMutationRate: number;                         // taxa de mutação
    maxIterations: number;                          // limite de iterações
    exploreConcave: boolean;                        // explorar áreas côncavas
  }

  interface NestResult {
    placements: NestPlacement[];    // posição final de cada peça
    unplaced: NestPart[];           // peças que não caberam
    binsUsed: number;              // quantas chapas necessárias
    utilization: number;           // % de aproveitamento
    metrics: NestMetrics;          // estatísticas detalhadas
    svgOutput: string;            // SVG visual do nesting
    dxfOutput: string;            // DXF com peças reposicionadas
  }

  function nestDXF(dxfText: string, options?: Partial<NestOptions>): NestResult;
  ```

- [ ] **2.2 — Pipeline completo**
  - `parseString(dxfText)` → `extractNestParts()` → `svgNestCore.nest()` → resultados
  - Tratar erros em cada etapa com fallbacks
  - Logging progressivo (peças extraídas, iterações do GA, etc.)

- [ ] **2.3 — Configuração inteligente de defaults**
  - `spacing`: 0.2mm para laser, 1mm para plasma (detectar por contexto)
  - `maxRotations`: 4 (cardinal) como default para metal
  - `gaPopulation`: 10 para velocidade, 50+ para qualidade
  - Presets: `{ laser, plasma, waterjet }`

- [ ] **2.4 — Testes de integração**
  - Fixtures com 5, 20, 50 peças
  - Validar que nenhuma peça sobrepõe outra
  - Validar que todas cabem na chapa (ou reportar unplaced)
  - Benchmark: tempo vs. número de peças

**Entregável:** API `nestDXF()` funcional com testes de integração completos.

---

### Fase 3 — Output & Visualização (Semana 7-8)

**Objetivo:** Gerar DXF/SVG de saída e visualização do resultado.

#### Tarefas

- [ ] **3.1 — Gerar DXF de saída**
  - Criar um novo DXF com as peças nas posições nesting
  - Preservar camadas, cores e propriedades originais
  - Adicionar camada "BIN" com o contorno da chapa
  - Adicionar camada "METRICS" com texto de aproveitamento
  - ⚠️ DXF-Renewed faz parse → output; verificar se há writer ou precisa criar

- [ ] **3.2 — Gerar SVG de saída**
  - Reutilizar `toSVG()` existente com as entidades reposicionadas
  - Incluir contorno da chapa
  - Colorir peças por camada original
  - Adicionar legenda com métricas

- [ ] **3.3 — Métricas de aproveitamento**
  - Área total da chapa vs. área utilizada
  - % de waste por tipo (entre peças, bordas, buracos)
  - Número de peças por chapa
  - Se peças não cabem: sugerir chapa maior ou múltiplas chapas

- [ ] **3.4 — Visualizador web (test/functional)**
  - Usar o Vite dev server existente
  - Upload de DXF → preview das peças → configurar nesting → resultado
  - Slider para ajustar spacing/rotations em tempo real
  - Exportar resultado como DXF ou SVG

**Entregável:** Outputs DXF/SVG validados + visualizador web funcional.

---

### Fase 4 — Otimizações & Avançado (Semana 9-10)

**Objetivo:** Performance, multi-chapa, e features avançadas.

#### Tarefas

- [ ] **4.1 — Multi-bin (múltiplas chapas)**
  - Se peças não cabem em uma chapa, distribuir em múltiplas
  - Otimizar para minimizar número de chapas
  - Balancear área entre chapas

- [ ] **4.2 — Grain direction (direção do grão)**
  - Para laminados: permitir definir direção preferencial
  - Restringir rotações para alinhar com o grão
  - Config: `grainAngle: number`

- [ ] **4.3 — Piece priority (prioridade de peças)**
  - Algumas peças são mais críticas que outras
  - Garantir que peças prioritárias sejam sempre nested
  - Config: `priority: 'high' | 'medium' | 'low'` por peça/camada

- [ ] **4.4 — Performance optimizations**
  - Cache de NFPs (já suportado pelo SVGnest, garantir que funciona)
  - WebWorker para não bloquear UI no browser
  - Timeout configurável com resultado parcial
  - Progress callback para UI

- [ ] **4.5 — Memory management**
  - DXFs grandes podem ter centenas de peças
  - Limite de peças configurável
  - Warn se exceder limite razoável

**Entregável:** Multi-bin + grain + priority com testes.

---

### Fase 5 — CLI & Documentação (Semana 11-12)

**Objetivo:** Interface de linha de comando e documentação completa.

#### Tarefas

- [ ] **5.1 — CLI command `dxf-nest`**
  ```bash
  dxf-nest input.dxf --bin 1250x2500 --spacing 0.2 --output nested.dxf
  dxf-nest input.dxf --preset laser --rotations 4 --output nested.svg
  dxf-nest input.dxf --bin auto --multi-bin --output nested_*.dxf
  ```
  - Extender o CLI existente (`src/cli.ts`)
  - Flags para todas as opções de nesting
  - Presets pré-configurados
  - Output em DXF ou SVG

- [ ] **5.2 — Documentação da API**
  - JSDoc em todas as funções públicas
  - Exemplos no README
  - Guia de configuração por material/processo

- [ ] **5.3 — Exemplos práticos**
  - Incluir 3-5 fixtures reais com resultados de nesting
  - Screenshots do antes/depois
  - Comparativo de aproveitamento

- [ ] **5.4 — CHANGELOG & versão**
  - Documentar a nova feature
  - Breaking changes (se houver)
  - Migration guide se necessário

**Entregável:** CLI funcional + documentação completa + exemplos.

---

## Estrutura de Arquivos Proposta

```
src/
├── nest/                          # Novo módulo de nesting
│   ├── index.ts                   # Exporta API pública
│   ├── types.ts                   # NestPart, NestOptions, NestResult, etc.
│   ├── extractParts.ts            # DXF → NestPart[]
│   ├── nestCore.ts                # Wrapper do algoritmo SVGnest
│   ├── svgNestAdapter.js          # SVGnest adaptado para ESM
│   ├── clipperAdapter.js          # ClipperLib ou vecks adapter
│   ├── output.ts                  # Gera DXF/SVG de saída
│   ├── metrics.ts                 # Calcula métricas de aproveitamento
│   ├── presets.ts                 # Configurações pré-definidas (laser, plasma)
│   └── binDetection.ts            # Detecta chapa a partir do DXF
├── toSVG.ts                       # (modificar) aceitar entidades reposicionadas
├── toPolylines.ts                 # (estende) opções de nesting
└── cli.ts                         # (estende) novo comando dxf-nest

test/
├── unit/
│   └── nest/
│       ├── extractParts.test.ts
│       ├── nestCore.test.ts
│       ├── metrics.test.ts
│       └── output.test.ts
├── integration/
│   └── nest/
│       ├── basic-nest.test.ts
│       ├── multi-bin.test.ts
│       └── performance.test.ts
└── resources/
    └── nest-fixtures/
        ├── simple-parts.dxf
        ├── parts-with-holes.dxf
        ├── complex-nest.dxf
        └── jcm-real-parts.dxf
```

---

## Decisões Técnicas Pendentes

| Decisão | Opções | Recomendação |
|---------|--------|-------------|
| ClipperLib vs. vecks | Manter ClipperLib ou substituir por vecks | **Manter ClipperLib** — NFP precisa de boolean ops que vecks não cobre |
| SVGnest JS vs. reescrita TS | Adaptar JS existente ou reescrever em TS | **Adaptar JS** — algoritmo complexo, risco de bugs na reescrita |
| Nesting sync vs. async | Blocking ou com progress callbacks | **Async com callbacks** — GA é computacionalmente intensivo |
| DXF writer | Criar writer ou usar workaround | **Criar writer mínimo** — só precisa escrever LWPOLYLINE + HEADER |
| WebWorker no browser | Mesmo thread ou worker | **Worker** — não bloquear UI durante nesting |

---

## Riscos & Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| SVGnest tem bugs em edge cases | Peças sobrepostas no corte | Testes rigorosos + validação pós-nesting |
| ClipperLicense (MS-PL) conflita com MIT | Problema legal | Verificar licença do ClipperLib usado; alternativa: jsclipper |
| Performance com 100+ peças | Timeout / freeze | WebWorker + progress reporting + limite configurável |
| DXF com entidades complexas não convertem | Peças perdidas | Fallback gracioso + log de peças ignoradas |
| NFP incorreto para peças muito concavas | Aproveitamento ruim | `exploreConcave` flag + testes com peças concavas reais |

---

## Referências

- **SVGnest README:** https://github.com/Jack000/SVGnest
- **SVGnest Demo:** http://svgnest.com
- **Paper — Orbital Algorithm:** Burke et al. 2006 (referência no SVGnest)
- **DXF-Renewed Architecture:** `ARCHITECTURE.md` (este repo)
- **ClipperLib:** https://github.com/jtuckery_clipper/clipper_library_js

---

## Timeline Resumo

| Fase | Descrição | Duração | Dependências |
|------|-----------|---------|-------------|
| 0 | Fundação & Adaptação SVGnest | 2 sem | — |
| 1 | Bridge DXF → SVGnest | 2 sem | Fase 0 |
| 2 | Core Nesting API | 2 sem | Fase 0, 1 |
| 3 | Output & Visualização | 2 sem | Fase 2 |
| 4 | Otimizações & Avançado | 2 sem | Fase 2, 3 |
| 5 | CLI & Documentação | 2 sem | Todas |

**Total estimado: ~12 semanas** (paralelizando Fase 3 e 4 parcialmente: ~10 semanas)

---

## Success Criteria

Ao final do roadmap:

1. ✅ `nestDXF(dxfText, options)` funciona para DXFs com até 100 peças
2. ✅ Nenhuma peça sobrepõe outra no resultado
3. ✅ Aproveitamento ≥ 85% para fixtures de teste (comparado com nesting manual)
4. ✅ Output DXF válido importável em AutoCAD
5. ✅ Output SVG visualmente correto
6. ✅ CLI `dxf-nest` funcional com presets
7. ✅ Testes unitários + integração com ≥ 80% coverage no módulo nest
8. ✅ Documentação clara com exemplos
