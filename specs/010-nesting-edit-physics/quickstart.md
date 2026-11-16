# Quickstart: Validating Edit and Cut Risk

Runnable guide for the gates and scenarios of this feature. Types and rules are in
[data-model.md](data-model.md) and [contracts/edit-risk-api.md](contracts/edit-risk-api.md).

## Prerequisites

- Node.js >=18 and `yarn install`.
- Browser specs need Playwright browsers (`npx playwright install chromium`) and a built bundle
  (`yarn dist`), which also builds the optional three renderer bundle.
- The real drawings are in `test/resources/nest-fixtures`.

## Gates

```bash
yarn type-check
yarn lint
yarn test:unit
npx mocha --require tsx --extensions .ts "test/integration/**/*.test.ts"
yarn dist && npx playwright test review.edit
yarn quality:gate
git checkout -- test/rendered   # Playwright regenerates these images
```

All must pass with no warning. The commit hook runs `yarn test` and `yarn quality:gate`.

## Scenarios

1. **Validity feedback (US1)**: load the reference job, drag one part over a neighbour, past the edge,
   into a stock hole and closer than the spacing; each step must list its violations and the confirm
   action must stay disabled. Unit: `judgePlacement.test.ts`; browser: `review.edit.browser.spec.ts`.
2. **Rotation and mirror rules (US1)**: with constraints that allow 0 and 90 degrees and no mirror,
   rotating 45 degrees and mirroring are refused with their codes; without constraints both are refused
   with `CONSTRAINTS_UNKNOWN`.
3. **Undo and redo (US1, SC-003)**: apply 100 edits, undo all, redo all, compare layout and digest at
   each step with the recorded ones.
4. **Freshness and recomputation (US2, SC-005)**: confirm one edit, check plan, cost and risk are
   `outdated`, run `recomputeEdited`, check each becomes `current` and a forced planner failure leaves the
   edited layout with the plan `unavailable`.
5. **Edited result (US2, SC-004)**: build the result twice from the same edits and compare byte for byte;
   with no edits compare `outputDigest` with the original.
6. **Risk reference jobs (US3, SC-007)**: assess the planted jobs (dense cluster, thin web, small part
   freed early, head path over a freed part) and the safe job; every planted risk appears under its
   category with measured value and limit, the safe job has no critical finding, a profile without
   `web.minimum` reports `thin-web` as not assessable.
7. **Playback and markers (US4)**: play the planted job in both renderers; the heat view, freed parts and
   timeline markers appear, a marker seeks and selects, and no cue depends on colour alone.
8. **Keyboard and announcements (SC-008)**: complete a move, a rotation, an undo, a recompute and a
   finding jump with the keyboard only; every verdict and finding change is announced in pt-BR.
9. **Comparison (US2/AC5, US4/AC4, SC-009)**: remove the planted risk in five interactions or fewer
   (select the part, one drag or entry, confirm, recompute, replay), then read the comparison.
10. **Stale plan (FR-006)**: after a confirmed edit the cut path is hidden and the plan is marked
    outdated until the plan step succeeds; an edit during a recomputation discards that run.

## Measurements

- **SC-001**: in the reference browser, mount the 500-part reference sheet, drag one part across the
  sheet in 60 steps through the verdict path and record each step; the worst step of five runs is under
  100 ms. Measured by `review.edit.browser.spec.ts`.
- **SC-006**: in Node, run `assessCutRisk` on the reference job with a profile that makes every rule
  assessable five times; the worst run is under 2 s. Measured by `riskPerformance.test.ts`.

## SC coverage

Measured on 2026-11-16 on Linux 7.0, Intel Core i9-12900K (24 threads), Node.js 24.20, Chromium of
Playwright 1.63 with WebGL2. Worst case of five runs where a time is stated.

| Criterion | Test | Result |
|---|---|---|
| SC-001 | `review.edit.browser.spec.ts` (60 drag steps on the 500-part sheet, `propose` to drawn verdict, accelerated renderer) | worst step 5.4 ms (limit 100 ms) |
| SC-002 | `judgePlacement.test.ts`, `editRealParts.test.ts` | every violation type reported with its reason; a zero move of every part is valid on the edit fixture, the 500-part sheet and the real drawings; no invalid position can be confirmed |
| SC-003 | `undoRedo.test.ts` | 100 edits undone and redone return the layout to each recorded step |
| SC-004 | `buildEditedArtifact.test.ts`, `review.edit.browser.spec.ts` (browser leg) | five identical builds; browser digests equal the Node digests; no edits give the original output digest |
| SC-005 | `freshness.test.ts`, `recomputeEdited.test.ts`, `editCommands.test.ts` | a confirmed edit marks plan, cost, validation and risk outdated; a step from an older revision is discarded and never marks a result current |
| SC-006 | `riskPerformance.test.ts` (500-part reference job, every rule assessable) | worst 48 ms (limit 2 s) |
| SC-007 | `assessCutRisk.test.ts` and the planted jobs | each planted risk under its category with measured value, limit and unit; the safe job has no finding |
| SC-008 | `review.edit.browser.spec.ts` | edit, risk and comparison functions work with the keyboard; verdicts, confirmations and finding counts are announced in pt-BR; cues are text and patterns |
| SC-009 | `review.edit.browser.spec.ts` (resolved finding) | the finding is removed in five interactions (toggle, choose part, propose, confirm, recompute) and the comparison reports it |
