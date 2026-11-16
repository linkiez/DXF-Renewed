# Quickstart: Validating Machine Configurations and Cutting Post-Processors

Runnable guide for the gates and scenarios. Types and rules are in [data-model.md](data-model.md) and
[contracts/machine-config-post-api.md](contracts/machine-config-post-api.md).

## Prerequisites

- Node.js >=18 and `yarn install`.
- The synthetic plans and the reviewed programs are in `test/resources/post-references/`.
- The real drawings of `test/resources/nest-fixtures` for the integration test.

## Gates

```bash
yarn type-check
yarn lint
yarn test:unit
npx mocha --require tsx --extensions .ts "test/integration/**/*.test.ts"
yarn quality:gate
```

All must pass with no warning. The commit hook runs `yarn test` and `yarn quality:gate`.

## Scenarios

1. **Talvi program (US1)**: generate the program of the reference plan with the Talvi configuration marked
   approved and compare it with the reviewed program; run the structure checker (preparation, ending,
   contour count, block order, distances, sentinel, arc radii) on it and on a 100-contour plan.
2. **Machine frame and envelope (US1)**: a plan of a 3000 x 1500 sheet maps to X in -1500..0 and Y in
   0..3000; a plan that does not fit is rejected naming the contour and the axis.
3. **Arcs (US1)**: an arc keeps its start and end radii within 0.01 mm; a full circle is one arc; an arc
   of 2 degrees or less is a line.
4. **Process mapping (US1)**: without an entry for a quality the program is a draft with the missing
   mapping named; with `omitQ: when-undefined` an entry without `q` writes no `Q`.
5. **Release gate (US2)**: change one critical value of the approved copy to `inferred`; the program is
   still produced and has `releasable: false` and one `UNAPPROVED_VALUE` for that path.
6. **Configuration catalog (US2)**: list the three configurations, validate each, break a field and read
   the failing path; modify a copy returned by `getMachineConfiguration` and confirm the built-in is
   unchanged.
7. **Hypertherm program (US3)**: generate the reference program and check the vendor order (`V502`, `V503`,
   `V504`, `V505`, `V507`, no `V506`), `G43 X` and `G41`/`G42` before `M07`, `M08` and `G40` closing each cut and the
   ending `M19`, `M02`; set an arc voltage of 350 and read `HEIGHT_CONTROL_OUT_OF_RANGE`; supply the settings
   by hand and read the `CUTCHART_UNVERIFIED` warning; remove one cut chart setting and read the
   `PROCESS_SETTING_REQUIRED` error that blocks release.
8. **GloryStar program (US5)**: generate the reference program with a short travel, a jump and a head-up
   travel and compare it with the reviewed program.
9. **Recipes (US6)**: import the 44 files (kept outside the repository in a local folder named by
   `TALVI_RECIPES_DIR`, read by `talviRecipesLocal.test.ts` only), look up three by material and thickness, and confirm that no Talvi program text contains
   a recipe value.
10. **Cut chart lookup (US4)**: import the hand-written excerpt of the Phoenix cut chart table, look up
    mild steel 6 mm 130 A O2/Air and read exactly its values (feedrate 4035, kerf 1.81, pierce time 0.3,
    cut height 2.8, arc voltage 127, pierce and transfer height factor 200, codes `V502` 34, `V503` 1, `V504` 130, `V505` 2, `V507` 29); ask for
    a thickness the excerpt lacks and read the absence; ask with inches against the metric table and read
    the unit mismatch; generate the Hypertherm reference program from the entry and compare its cut chart
    block with the row.
11. **No regression**: the whole existing post-processing suite passes unchanged.

## Measurements

- **SC-008**: in Node, generate the Talvi program of a 500-contour plan five times; the worst run is under
  2 s. Measured by `postMachinesPerformance.test.ts`.
- **SC-010**: in Node, import a generated table of 7,000 rows five times; the worst run is under 1 s.

## SC coverage

Filled when implemented, as in the 008 and 010 quickstarts.

| Criterion | Test | Result |
|---|---|---|
| SC-001 | `talvi6000w.test.ts`, `glorystar.test.ts`, `hypertherm.test.ts` | passes — `talvi6000w.test.ts`, `glorystar.test.ts`, `hypertherm.test.ts` (exact canonical match, five identical runs) |
| SC-002 | `talviStructure.test.ts` | passes — structure checker also validated against a real program locally; 100 contours |
| SC-003 | `mapToMachineFrame.test.ts`, `envelopeIssues.test.ts` | passes — envelope and frame tests; the real-drawings integration test |
| SC-004 | `releaseGate.test.ts`, `validateMachineConfiguration.test.ts` | passes — `builtIns.test.ts`, `releaseGate.test.ts` |
| SC-005 | `importTalviRecipes.test.ts`, `findTalviRecipe.test.ts`, `talviRecipesLocal.test.ts` (44 files, local) | passes — 44 of 44 real files import with no issue (`talviRecipesLocal.test.ts`, `TALVI_RECIPES_DIR`) |
| SC-006 | `talviNoRecipe.test.ts` | passes — `talviNoRecipe.test.ts` |
| SC-007 | the existing `test/unit/nesting/post/` suite | passes — the existing post suite, unchanged |
| SC-008 | `postMachinesPerformance.test.ts` | passes — worst of 5 runs 16 ms (limit 2000 ms) |
| SC-009 | `importCutChartTable.test.ts`, `findCutChartEntry.test.ts`, `hyperthermCutChart.test.ts` | passes — excerpt lookups and the Hypertherm program of the 6 mm 130 A entry |
| SC-010 | `postMachinesPerformance.test.ts` (7,000-row table import) | passes — worst of 5 runs 18 ms for 7,000 rows (limit 1000 ms) |
| SC-011 | `hypertherm.test.ts`, `hyperthermHeightControl.test.ts`, `hyperthermContour.test.ts` | passes — `hypertherm.test.ts` |
