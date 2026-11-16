import type { ErpNestingArtifact } from '../erp/types'
import type { CompoundPlacement, Placement } from '../types'
import type { EditState, WorkingPart } from './types'

const placementOf = <T extends Placement | CompoundPlacement>(
  parts: ReadonlyMap<string, WorkingPart>,
  kind: WorkingPart['source']['kind'],
  index: number,
  fallback: T,
): T => {
  for (const part of parts.values()) {
    if (part.source.kind === kind && part.source.index === index) return part.placement as T
  }
  return fallback
}

/**
 * Materializes the layout at the cursor of a session: the artifact layout with the edited
 * placements and compound placements.
 *
 * @param state - Session state.
 * @returns The edited layout; the base artifact is never mutated.
 */
export function editedLayout(state: EditState): ErpNestingArtifact['layout'] {
  const base = state.input.artifact.layout
  if (!base) return base
  const parts = state.working.parts
  const placements = (base.placements as Placement[]).map((placement, index) => placementOf(parts, 'placement', index, placement))
  const layout = { ...base, placements }
  if (base.compoundPlacements) {
    layout.compoundPlacements = (base.compoundPlacements as CompoundPlacement[]).map((compound, index) =>
      placementOf(parts, 'compound', index, compound),
    )
  }
  return layout
}
