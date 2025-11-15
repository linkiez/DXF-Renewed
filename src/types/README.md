# DXF Types

Tipos TypeScript organizados para o parser DXF.

## Estrutura

### Tipos Comuns (`common.ts`)
- `Point2D` - Ponto 2D (x, y)
- `Point3D` - Ponto 3D (x, y, z)
- `RGB` - Cor RGB
- `ColorRGB` - Tupla de cor [r, g, b]
- `Transform` - Transformação geométrica
- `ZeroTransform` - Transformação zero completa

### Entidade Base (`base-entity.ts`)
- `BaseEntity` - Interface base que todas as entidades DXF estendem

### Entidades DXF
Cada tipo de entidade em seu próprio arquivo:

- `line-entity.ts` - `LineEntity` (LINE)
- `circle-entity.ts` - `CircleEntity` (CIRCLE)
- `arc-entity.ts` - `ArcEntity` (ARC)
- `ellipse-entity.ts` - `EllipseEntity` (ELLIPSE)
- `text-entity.ts` - `TextEntity` (TEXT)
- `mtext-entity.ts` - `MTextEntity` (MTEXT)
- `point-entity.ts` - `PointEntity` (POINT)
- `polyline-entity.ts` - `PolylineEntity`, `Vertex` (POLYLINE/LWPOLYLINE)
- `spline-entity.ts` - `SplineEntity` (SPLINE)
- `dimension-entity.ts` - `DimensionEntity` (DIMENSION)
- `solid-entity.ts` - `SolidEntity` (SOLID/3DFACE)
- `insert-entity.ts` - `InsertEntity` (INSERT)
- `hatch-entity.ts` - `HatchEntity` (HATCH)

### Tipos Estruturais
- `entity.ts` - Union type `Entity` de todas as entidades
- `dxf.ts` - Estruturas DXF principais
  - `LayerTable`
  - `Tables`
  - `Block`
  - `Blocks`
  - `BlockArray`
  - `ParsedDXF`
  - `DXFTuple`

### Tipos Utilitários
- `handler.ts` - `EntityHandler` - Interface para handlers de entidades
- `options.ts` - Opções de configuração
  - `ToPolylinesOptions`
  - `ToSVGOptions`
  - `Config`
- `helper.ts` - `HelperInterface` - Interface da classe Helper

## Uso

### Import Barrel (Recomendado)
```typescript
import type { LineEntity, Point3D, ParsedDXF } from './types'
```

### Import Específico
```typescript
import type { LineEntity } from './types/line-entity'
import type { Point3D } from './types/common'
```

### Backward Compatibility
O arquivo `types.ts` na raiz re-exporta todos os tipos para compatibilidade:
```typescript
import type { LineEntity } from './types' // Funciona
```

## Organização

Cada arquivo segue o padrão:
1. Comentário descritivo do tipo
2. Imports de tipos dependentes
3. Definição da interface/type
4. Exports

O arquivo `index.ts` faz barrel export de todos os tipos.
