# Contract: Edit and Cut Risk API

Public additions, re-exported from `src/nesting/index.ts`. All are additive. Names are final; shapes are
in `data-model.md`.

## Edit module

```ts
createEditState(input: EditInput): { state: EditState | null; notices: EditNotice[] }
judgePlacement(state: EditState, edit: CandidateEdit): PlacementVerdict
commitEdit(state: EditState, edit: CandidateEdit): { state: EditState; verdict: PlacementVerdict }
undoEdit(state: EditState): EditState
redoEdit(state: EditState): EditState
editedLayout(state: EditState): ErpNestingArtifact['layout']
editedCutLayout(state: EditState): CutLayout | null
buildEditedArtifact(state: EditState): Observable<EditedArtifact>
recomputeEdited(request: RecomputeRequest): Observable<RecomputeStep>
compareLayouts(request: CompareRequest): ComparisonSummary
markComputed(state: EditState, result: DerivedResult, revision: number): { state: EditState; discarded: boolean }
```

`CandidateEdit` is `{ partKey, kind, delta? }`. Rules:

- `commitEdit` returns the same state when the verdict is invalid; it never applies an invalid edit.
- `createEditState` returns `state: null` with an error notice for an invalid artifact, an unsupported
  contract version or an artifact without placements.
- `judgePlacement`, `commitEdit`, `undoEdit`, `redoEdit` and `editedLayout` are synchronous and pure.
- `buildEditedArtifact` and `recomputeEdited` are cold Observables like `calculateErpNesting`; they emit
  and complete, and reject only for a structurally invalid request.
- `editedCutLayout` returns `null` when the input had no `CutLayout`; otherwise every contour of an edited
  part carries the edited placement.
- `RecomputeRequest` is `{ state, processProfile, costModel?, riskProfile? }`. `RecomputeStep` is
  `{ step: 'plan' | 'cost' | 'risk', revision, status: 'current' | 'unavailable' | 'discarded', result?, notices }`, emitted in
  that order, one per requested step; a failed step does not stop the following ones that do not depend
  on it, and cost and risk depend on the plan.

## Risk module

```ts
assessCutRisk(request: RiskRequest): RiskResult              // sync core, no digest
calculateRiskReport(request: RiskRequest): Observable<RiskReport>
heatAt(request: HeatRequest): HeatView
validateRiskProfile(profile: CutRiskProfile): RiskNotice[]
```

`RiskRequest` is `{ artifact, layout, cutPlan, profile }`. `calculateRiskReport` validates the profile
with the Zod schema at the boundary (an invalid profile yields an `unavailable` report with notices; a
structurally invalid request rejects), runs `assessCutRisk` and adds the profile and report digests.
`heatAt` is pure and valid only for a report whose rules `heat` is assessable.

## Review integration

```ts
mountReview(host, input, options: ReviewMountOptions): Promise<ReviewMount>
```

- `ReviewMountOptions.edit?: ReviewEditOptions`: `{ constraints?, step?: { move; rotate }, onChange?(state), recompute?: { processProfile; costModel? } }`.
- `ReviewMountOptions.risk?: ReviewRiskOptions`: `{ profile, processProfile, costModel? }`.
- `ReviewMount.edit: ReviewEditHandle | null` is present when `edit` was supplied. The playback
  `ReviewController` is unchanged; the edit commands live in the handle:
  `edit$`, `enter()`, `leave()`, `selectPart(key)`, `propose(candidate)`, `confirm()`, `cancel()`,
  `undo()`, `redo()`, `recompute()`, `dispose()`.
- `EditPanelState` carries `mode`, `activePart`, `candidate`, `verdict`, `freshness`, `planVisible`,
  `canUndo`, `canRedo`, `riskStatus`, `notices`, `recomputing`, `comparison`, `risk` and `riskRequest`.
- `ReviewRenderer.overlay?(overlay: ReviewOverlay | null)` is optional; a renderer without it still
  works. `ReviewOverlay` carries `ghost`, `heat`, `freed` (key and outline) and `markers`.
- Going to a finding, showing the heat layer and the timeline markers are actions of the risk panel
  (`data-risk-marker` buttons and `data-risk-heat-toggle`), not methods of the controller.
- After a confirmed edit and until the plan step succeeds, the review is rebuilt without the cut
  plan (`planVisible: false`); a successful plan step rebuilds it with the new plan.

## Notices

Every gap is a notice with `severity`, a stable English `code`, a pt_BR `message` from the module's
messages file and the location when it has one. Codes are listed in `data-model.md`.

## Guarantees

- No input object is mutated; no storage and no network.
- Identical inputs and identical ordered edits give identical verdicts, artifacts, findings and digests.
- Every risk report states `indicative: true`.
- Every outdated result is reported as outdated until its recomputation succeeds.
