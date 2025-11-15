# Guia de Migração para TypeScript - Projeto DXF

## Status da Migração

✅ **Concluído:**
- Instalação das dependências TypeScript
- Configuração do tsconfig.json
- Configuração do Babel para suportar TypeScript
- Criação dos tipos base em `src/types.ts`
- Conversão de `src/constants.ts`

🔄 **Em Progresso:**
- Conversão gradual dos arquivos para TypeScript

## Estratégia de Migração Gradual

Este projeto suporta migração gradual JavaScript → TypeScript. Ambos os tipos de arquivo podem coexistir.

### Fase 1: Infraestrutura (✅ Completa)

1. ✅ Instalar dependências TypeScript
2. ✅ Configurar `tsconfig.json`
3. ✅ Atualizar `babel.config.js`
4. ✅ Criar tipos base em `src/types.ts`

### Fase 2: Conversão de Utilitários (Próxima)

Arquivos a converter em `/src/util/`:

1. `logger.ts` - Mais simples, sem dependências
2. `round10.ts` - Funções matemáticas simples
3. `rotate.ts` - Transformações geométricas
4. `rgbToColorAttribute.ts` - Conversão de cores
5. `colors.ts` - Tabela de cores DXF
6. `createArcForLWPolyline.ts` - Geometria de arcos
7. `bSpline.ts` - Interpolação de splines
8. `insertKnot.ts` - Manipulação de nós
9. `toPiecewiseBezier.ts` - Conversão Bézier
10. `transformBoundingBoxAndElement.ts` - Transformações SVG

### Fase 3: Handlers de Entidades

Arquivos em `/src/handlers/entity/`:

1. `common.ts` - Base para todos os handlers
2. Entidades simples: `point.ts`, `line.ts`, `circle.ts`
3. Entidades complexas: `polyline.ts`, `spline.ts`, `ellipse.ts`
4. Entidades de texto: `text.ts`, `mtext.ts`
5. Dimensões: `dimension.ts`
6. Outros: `insert.ts`, `hatch.ts`, etc.

### Fase 4: Arquivos Principais

1. `parseString.ts` - Parser principal
2. `denormalise.ts` - Desnormalização
3. `entityToPolyline.ts` - Conversão para polylines
4. `toPolylines.ts` - API de polylines
5. `toSVG.ts` - Renderização SVG
6. `Helper.ts` - Classe helper principal
7. `index.ts` - Entry point

### Fase 5: Handlers de Seções

1. `handlers/entities.ts`
2. `handlers/blocks.ts`
3. `handlers/tables.ts`
4. `handlers/header.ts`
5. `handlers/objects.ts`

### Fase 6: Testes

1. Converter testes unitários para TypeScript
2. Adicionar testes de tipo
3. Atualizar scripts de teste

## Como Converter um Arquivo

### 1. Renomear .js → .ts

```bash
mv src/arquivo.js src/arquivo.ts
```

### 2. Adicionar Tipos aos Parâmetros

**Antes:**
```javascript
export function processTuple(type, value) {
  // ...
}
```

**Depois:**
```typescript
export function processTuple(type: number, value: any): Entity {
  // ...
}
```

### 3. Adicionar Interfaces para Objetos

**Antes:**
```javascript
const entity = {
  type: 'LINE',
  start: { x: 0, y: 0 },
  end: { x: 10, y: 10 }
}
```

**Depois:**
```typescript
import { LineEntity, Point2D } from './types'

const entity: LineEntity = {
  type: 'LINE',
  start: { x: 0, y: 0, z: 0 },
  end: { x: 10, y: 10, z: 0 }
}
```

### 4. Importar Tipos Necessários

```typescript
import {
  Entity,
  Point2D,
  Point3D,
  ParsedDXF,
  EntityHandler
} from './types'
```

### 5. Usar Type Guards quando Necessário

```typescript
function isLineEntity(entity: Entity): entity is LineEntity {
  return entity.type === 'LINE'
}
```

## Scripts Atualizados

### Build

```bash
# Compilar TypeScript
npm run compile:ts   # tsc

# Compilar com Babel (suporta .js e .ts)
npm run compile      # babel -d lib/ src/

# Build completo
npm run build        # compile + dist
```

### Desenvolvimento

```bash
# Watch mode
npm run watch        # tsc --watch

# Testes (suportam .ts via @babel/register)
npm test
```

## package.json - Scripts Sugeridos

Adicione ao `package.json`:

```json
{
  "scripts": {
    "compile:ts": "tsc",
    "compile:babel": "babel -d lib/ src/",
    "compile": "npm run compile:ts && npm run compile:babel",
    "watch": "tsc --watch",
    "type-check": "tsc --noEmit",
    "dist": "browserify lib/index.js --standalone dxf -o dist/dxf.js",
    "build": "rimraf lib/ dist/ && npm run compile && npm run dist",
    "prepublishOnly": "npm run lint && npm run type-check && npm run test && npm run build"
  }
}
```

## Verificação de Tipos

```bash
# Verificar tipos sem emitir arquivos
npm run type-check

# Verificar arquivo específico
npx tsc --noEmit src/toSVG.ts
```

## Benefícios da Migração

1. **Type Safety**: Catch de erros em tempo de compilação
2. **IntelliSense**: Autocomplete melhorado nas IDEs
3. **Refatoração**: Renomeações e mudanças mais seguras
4. **Documentação**: Tipos servem como documentação
5. **Manutenibilidade**: Código mais fácil de entender e manter

## Limitações Conhecidas

1. **Strict Mode**: Algumas conversões requerem tipos `any` temporariamente
2. **Bibliotecas Externas**: Algumas dependências não têm tipos
3. **Build Time**: Compilação TypeScript adiciona tempo ao build
4. **Learning Curve**: Equipe precisa conhecer TypeScript

## Próximos Passos

1. Converter arquivos util um por vez
2. Testar após cada conversão
3. Adicionar tipos mais específicos conforme necessário
4. Documentar padrões de tipo encontrados
5. Converter handlers de entidades
6. Converter arquivos principais
7. Atualizar testes

## Recursos

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Migrating from JavaScript](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)

## Status Atual dos Arquivos

- ✅ `src/types.ts` - Tipos base criados
- ✅ `src/constants.ts` - Convertido
- ⏳ `src/util/*` - A fazer
- ⏳ `src/handlers/entity/*` - A fazer
- ⏳ `src/*.ts` - A fazer
