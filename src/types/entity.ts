// Union type for all entity types

import type { ArcEntity } from './arc-entity'
import type { BaseEntity } from './base-entity'
import type { CircleEntity } from './circle-entity'
import type { DimensionEntity } from './dimension-entity'
import type { EllipseEntity } from './ellipse-entity'
import type { HatchEntity } from './hatch-entity'
import type { ImageEntity } from './image-entity'
import type { InsertEntity } from './insert-entity'
import type { LeaderEntity } from './leader-entity'
import type { LineEntity } from './line-entity'
import type { MLeaderEntity } from './mleader-entity'
import type { MLineEntity } from './mline-entity'
import type { MTextEntity } from './mtext-entity'
import type { Ole2FrameEntity } from './ole2frame-entity'
import type { OleFrameEntity } from './oleframe-entity'
import type { PointEntity } from './point-entity'
import type { PolylineEntity } from './polyline-entity'
import type { RayEntity } from './ray-entity'
import type { RegionEntity } from './region-entity'
import type { ShapeEntity } from './shape-entity'
import type { SolidEntity } from './solid-entity'
import type { SplineEntity } from './spline-entity'
import type { TableEntity } from './table-entity'
import type { TextEntity } from './text-entity'
import type { ToleranceEntity } from './tolerance-entity'
import type { TraceEntity } from './trace-entity'
import type { DgnUnderlayEntity, DwfUnderlayEntity, PdfUnderlayEntity } from './underlay-entity'
import type { WipeoutEntity } from './wipeout-entity'
import type { XLineEntity } from './xline-entity'

export type Entity =
  | LineEntity
  | CircleEntity
  | ArcEntity
  | EllipseEntity
  | TextEntity
  | MTextEntity
  | PointEntity
  | PolylineEntity
  | SplineEntity
  | TableEntity
  | DimensionEntity
  | SolidEntity
  | TraceEntity
  | InsertEntity
  | ImageEntity
  | LeaderEntity
  | MLineEntity
  | MLeaderEntity
  | ToleranceEntity
  | DwfUnderlayEntity
  | DgnUnderlayEntity
  | PdfUnderlayEntity
  | HatchEntity
  | BaseEntity
  | OleFrameEntity
  | Ole2FrameEntity
  | RayEntity
  | RegionEntity
  | ShapeEntity
  | WipeoutEntity
  | XLineEntity
