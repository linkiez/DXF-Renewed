
# DXF Parser Migration Plan (AutoCAD 2024) + Full 2D Coverage

This document describes a phased plan to align this project’s DXF parsing behavior with the AutoCAD 2024 DXF reference and to reach “complete 2D” feature coverage.

## Goals

- Parse AutoCAD 2024-era DXF files reliably and deterministically.
- Provide complete 2D coverage for geometry + annotation features typically found in 2D drawings.
- Keep backwards compatibility with existing API outputs (`parseString`, `toSVG`, `toPolylines`) where feasible.
- Grow test coverage using real DXF fixtures and regression tests.
- Run final SVG rendering integration tests in a real browser and save PNG artifacts for manual review.

## Non-goals

- Full 3D solids/meshes rendering.
- Full ObjectARX/.NET API parity (this is a DXF parser, not a CAD kernel).
- Perfect fidelity for every proprietary/extension object (fallback behavior is acceptable).

## References

### Primary (ezdxf stable docs)

Primary reference used for day-to-day implementation details (entities/objects/tables and their attributes):

- ezdxf Reference: <https://ezdxf.readthedocs.io/en/stable/reference.html>
- Curated sitemap for this repo: [docs/EZDXF_REFERENCE_SITEMAP.md](docs/EZDXF_REFERENCE_SITEMAP.md)
- Setup / extras install: <https://ezdxf.readthedocs.io/en/stable/setup.html#installation-with-extras>

### Authoritative (Autodesk / ObjectARX)

When behavior is ambiguous or disputed, treat Autodesk’s DXF reference as authoritative:

- Root: <https://help.autodesk.com/view/OARX/2024/ENU/>
- DXF Format entry point (guid): <https://help.autodesk.com/view/OARX/2024/ENU/?guid=GUID-235B22E0-A567-4CF6-92D3-38A2306D73F3>

Project documentation index:

- `docs/README.md`

## “Sitemap” / Checklist Source

- Primary navigation for implementation work: [docs/EZDXF_REFERENCE_SITEMAP.md](docs/EZDXF_REFERENCE_SITEMAP.md)

Note: do not embed large copies of Autodesk TOCs/spec text in this plan. Keep external links instead so this file stays maintainable.

## Current State (Repository Snapshot)

This section is intentionally short; it highlights gaps relevant to the migration.

### Entities

Entity parsers currently exist for (see `src/handlers/entities.ts` and `src/handlers/entity/*`):

- Implemented: ARC, ATTDEF, ATTRIB, CIRCLE, DIMENSION, ELLIPSE, HATCH, INSERT, LINE, LWPOLYLINE, MTEXT, OLE2FRAME, POINT, POLYLINE, SOLID, SPLINE, TEXT, 3DFACE, VERTEX, VIEWPORT.
- Missing (not exhaustive): IMAGE, LEADER, MLEADER, MLINE, OLEFRAME, RAY, REGION, SEQEND handling robustness, TRACE, UNDERLAY, WIPEOUT, XLINE, SHAPE, TABLE (entity), TOLERANCE.

### Tables

`src/handlers/tables.ts` parses:

- Implemented: LAYER, LTYPE, STYLE, VPORT, DIMSTYLE.
- Missing from Autodesk TOC: APPID, BLOCK_RECORD, UCS, VIEW.

### Objects

`src/handlers/objects.ts` currently parses:

- Implemented: LAYOUT (partial), DICTIONARY, XRECORD.
- Missing from Autodesk TOC subset above: DIMASSOC, IMAGEDEF (+ reactor), FIELD, TABLESTYLE, GROUP, etc.

## Project Analysis (Code-Backed)

This section grounds the roadmap in the current implementation so the plan is executable as a sequence of small PRs.

### Public API surface

Main exports are in `src/index.ts`:

- `parseString` (core parser)
- `denormalise` (INSERT expansion + transform stacking)
- `toPolylines` (rendering-friendly geometry output)
- `toSVG` (SVG renderer)

CLI entry point: `src/cli.ts` (built as `dxf-to-svg`).

### Parsing pipeline

- `src/parseString.ts` splits input into tuples and sections, then routes sections to:
  - `src/handlers/header.ts`
  - `src/handlers/tables.ts`
  - `src/handlers/blocks.ts`
  - `src/handlers/entities.ts`
  - `src/handlers/objects.ts`

### Entity parsing coverage (file-backed)

Entity handlers are in `src/handlers/entity/*.ts` and registered in `src/handlers/entities.ts`.

**Currently parsed (ENTITIES section):**

- ARC (`src/handlers/entity/arc.ts`)
- ATTDEF (`src/handlers/entity/attdef.ts`)
- ATTRIB (`src/handlers/entity/attrib.ts`)
- CIRCLE (`src/handlers/entity/circle.ts`)
- DIMENSION (`src/handlers/entity/dimension.ts`)
- ELLIPSE (`src/handlers/entity/ellipse.ts`)
- HATCH (`src/handlers/entity/hatch.ts`)
- INSERT (`src/handlers/entity/insert.ts`)
- LINE (`src/handlers/entity/line.ts`)
- LWPOLYLINE (`src/handlers/entity/lwpolyline.ts`)
- MTEXT (`src/handlers/entity/mtext.ts`)
- OLE2FRAME (`src/handlers/entity/ole2Frame.ts`)
- POINT (`src/handlers/entity/point.ts`)
- POLYLINE (`src/handlers/entity/polyline.ts`)
- SOLID (`src/handlers/entity/solid.ts`)
- SPLINE (`src/handlers/entity/spline.ts`)
- TEXT (`src/handlers/entity/text.ts`)
- 3DFACE (`src/handlers/entity/threeDFace.ts`)
- VERTEX (`src/handlers/entity/vertex.ts`)
- VIEWPORT (`src/handlers/entity/viewport.ts`)

**Special case (no dedicated handler file yet):**

- `SEQEND` is used as a sentinel in `src/handlers/entities.ts` to terminate a running `POLYLINE`.

### Rendering coverage matrix (what is parsed vs what is renderable)

The project has two rendering outputs:

- `toPolylines` → depends on `src/entityToPolyline.ts`
- `toSVG` → depends on `src/toSVG.ts` (native SVG for arc/circle/ellipse + polyline approximations)

| Entity type | Parsed | Block INSERT basepoint handled in `denormalise` | `toPolylines` support | `toSVG` support |
| --- | --- | --- | --- | --- |
| LINE | Yes | Yes | Yes | Yes |
| LWPOLYLINE | Yes | Yes | Yes | Yes |
| POLYLINE | Yes | Yes | Yes | Yes |
| VERTEX | Yes | N/A | N/A | N/A |
| SEQEND | Sentinel only | N/A | N/A | N/A |
| ARC | Yes | Yes | Yes | Yes |
| CIRCLE | Yes | Yes | Yes | Yes |
| ELLIPSE | Yes | Yes | Yes | Yes |
| SPLINE | Yes | Yes (control points) | Yes | Yes (Bezier when possible) |
| TEXT | Yes | No | No | Yes |
| MTEXT | Yes | No | No | Yes |
| DIMENSION | Yes | No | No | Yes |
| INSERT | Yes | Yes (expands blocks) | Indirect (via expanded entities) | Indirect (via expanded entities) |
| HATCH | Yes | No | No | No |
| SOLID | Yes | No | No | No |
| POINT | Yes | No | No | No |
| VIEWPORT | Yes | No | No | No |
| OLE2FRAME | Yes | No | No | No |
| 3DFACE | Yes | No | No | No |

**Key implication:** adding “complete 2D” is not only about parsing more entity types; it requires expanding rendering support in `src/toSVG.ts` and `src/entityToPolyline.ts` and ensuring `src/denormalise.ts` adjusts block-contained entities consistently.

### TABLES coverage (code-backed)

`src/handlers/tables.ts` currently extracts only: `LAYER`, `LTYPE`, `STYLE`, `VPORT`, `DIMSTYLE`.

Autodesk 2024 TOC includes additional tables relevant to 2D interoperability: `APPID`, `BLOCK_RECORD`, `UCS`, `VIEW`.

### OBJECTS coverage (code-backed)

`src/handlers/objects.ts` currently extracts only `LAYOUT` objects into `objects.layouts`.

For 2D annotation + external references, real-world DXFs frequently require at least: `DICTIONARY`, `XRECORD`, `DIMASSOC`, and image/underlay definitions.

### Test suite reality check

There is already substantial fixture coverage in `test/resources/*.dxf` and unit coverage in `test/unit/*.test.js`.

- Rendering tests exist for `toSVG`, `toPolylines`, dimension/text, blocks/inserts, and hatches.
- Use this existing corpus to gate each milestone; add only minimal new fixtures per newly-supported feature.
- When fixtures become too complex, brittle, or hard to assert against, it is acceptable to replace them with simpler, targeted fixtures (including ezdxf-generated ones) as long as the test still covers the intended behavior.
- After adding or regenerating fixtures, run `yarn validate:fixtures` to ensure DXF structure is sound.

## Milestones

### M0 — Baseline & Regression Harness

**Goal:** prevent regressions while expanding coverage.

**Primary files:** `test/unit/*`, `test/resources/*`, `src/toSVG.ts`, `src/toPolylines.ts`, `src/parseString.ts`.

**PR-sized breakdown:**

- PR 0.1: Add/confirm one “golden” unit test per public API (`parseString`, `toPolylines`, `toSVG`).
- PR 0.2: Add a test-only strict mode helper (e.g., fail on unknown entity/table/object types) without changing the runtime default behavior.
- PR 0.3: Add 1–3 new fixtures only if existing fixtures don’t cover a targeted feature.
  - If a fixture is too complex for stable assertions, prefer a smaller, focused fixture generated via ezdxf.
  - It is OK to replace or simplify existing fixtures if they remain representative of the behavior under test.

- Add/confirm a single “golden” pipeline test per API surface:
  - `parseString()` parses representative DXFs without throwing.
  - `toPolylines()` returns stable polyline counts and bounding boxes.
  - `toSVG()` returns stable SVG output for representative fixtures.
- Add a “strict mode” test option (only for tests) to fail on unknown entity/table/object types.
- Add fixtures that represent real 2D drawings (architectural plan, dimensions/text-heavy, blocks+attributes, hatches).

**Acceptance criteria:** CI tests cover at least 1 DXF per major feature: lines/polylines, arcs/circles, text/mtext, dimensions, blocks/inserts, hatch.

### M1 — DXF Format & Section-Level Compliance

**Goal:** make the parser robust to AutoCAD 2024 output patterns.

**Primary files:** `src/parseString.ts`, `src/handlers/header.ts`, `src/types/tables.ts`, `src/types/dxf.ts`.

**PR-sized breakdown:**

- PR 1.1: Expand `HEADER` parsing from a small whitelist to (a) a known-keys map + (b) an `unknownHeader` map for forward compatibility.
- PR 1.2: Harden section separation/reduction so malformed DXFs do not crash (keep warning logs, but continue parsing).
- PR 1.3: Add targeted fixtures that exercise AutoCAD-exported headers and validate typing.

- Normalize group code parsing (string vs number vs float) based on “Group Code Value Types Reference”.
- Harden section parsing:
  - Detect and handle missing/extra section markers gracefully.
  - Preserve unknown sections for debugging (optional), but ignore safely.
- Expand `HEADER` parsing to a structured map with correct typing.
- Expand `CLASSES` parsing to keep compatibility (even if not used downstream).

**Acceptance criteria:** no crash on DXF 2012–2024 fixtures; sections are parsed deterministically (same input → same output).

### M2 — TABLES Coverage (2D-Relevant)

**Goal:** implement the table types required for consistent 2D rendering.

**Primary files:** `src/handlers/tables.ts`, `src/types/tables.ts`, `src/parseString.ts`, `test/unit/tables.test.js`.

**PR-sized breakdown:**

- PR 2.1: Add types for `APPID`, `BLOCK_RECORD`, `UCS`, `VIEW` entries (keep them minimal at first).
- PR 2.2: Extend `parseTables` to extract these table groups and return them on `parsed.tables`.
- PR 2.3: Add tests asserting the new table maps exist and contain expected keys for at least one fixture.

- Add parsers for: APPID, BLOCK_RECORD, UCS, VIEW.
- Validate that entity references to table entries resolve safely:
  - Unknown handles/names should not crash; default fallbacks should apply.
- Ensure DIMSTYLE values used by `dimensionToSVG` are sourced from TABLES where possible.

**Acceptance criteria:** parsing DXFs with multiple dimstyles/linetypes/layers yields correct table maps and does not drop entries silently.

### M3 — OBJECTS Coverage (2D-Relevant)

**Goal:** implement core objects used by 2D drawings and annotation.

**Primary files:** `src/handlers/objects.ts`, `src/types/tables.ts` (or a dedicated objects types file), `src/parseString.ts`.

**PR-sized breakdown:**

- PR 3.1: Add a minimal “object router” in `parseObjects` (similar to entities) that groups objects by `0` and dispatches by object type.
- PR 3.2: Implement `DICTIONARY` and `XRECORD` first (these unlock extensibility and metadata).
- PR 3.3: Implement `DIMASSOC` next (ties dimensions to geometry; should not crash if unresolved).
- PR 3.4: Implement image/underlay definitions (`IMAGEDEF`, reactors) to avoid hard failures on referenced resources.

- Add DICTIONARY/DICTIONARYVAR + XRECORD (often needed for extensibility and metadata).
- Add DIMASSOC and minimal FIELD support (enough to not crash and to extract useful text).
- Add IMAGEDEF/IMAGEDEF_REACTOR + UNDERLAY definitions for reference resolution.
- Extend LAYOUT parsing to cover paper/model space expectations.

**Acceptance criteria:** DXFs containing the above objects parse without warnings that indicate dropped essential data; references (handles) resolve when present.

### M4 — ENTITIES: Complete 2D Set

**Goal:** implement missing 2D entities and make existing ones complete.

**Primary files:** `src/handlers/entities.ts`, `src/handlers/entity/*`, `src/types/*`, `src/denormalise.ts`.

**PR-sized breakdown (recommended order):**

- PR 4.1: Make `SEQEND` handling robust (ensure it terminates a polyline even if the `SEQEND` group is otherwise unsupported).
- PR 4.2: Add the first new 2D entity end-to-end: type + handler + at least one fixture/test + minimal rendering support.
- PR 4.3+: Continue entity additions in small vertical slices (one entity or one closely-related group per PR).

1. Fix polyline sequencing robustness

  Ensure `SEQEND` ends a running `POLYLINE` even if `SEQEND` itself is not fully parsed. Ensure orphan `VERTEX` entities do not poison subsequent entities.

1. Implement missing entity handlers (prioritized)

  Annotation: LEADER, MLEADER, TOLERANCE. Geometry: REGION, TRACE. Reference: IMAGE, UNDERLAY, WIPEOUT. Construction: RAY, XLINE. Legacy: OLEFRAME. Table-in-entities: TABLE (entity). Optional/edge: SHAPE, MLINE.

1. Ensure common fields are handled consistently

  Layer, color, lineweight, linetype, extrusion/normal where applicable. Block/insert transforms applied consistently (`applyTransforms.ts`).

**Acceptance criteria:**

- Each targeted entity has:
  - A type definition in `src/types/*`.
  - A parser in `src/handlers/entity/*`.
  - At least one fixture or unit test proving it parses and exports (toSVG or toPolylines).

### M5 — Rendering Parity (toPolylines / toSVG)

**Goal:** ensure new parsing coverage is usable.

**Primary files:** `src/toSVG.ts`, `src/toPolylines.ts`, `src/entityToPolyline.ts`, `src/denormalise.ts`.

**PR-sized breakdown:**

- PR 5.1: Extend `entityToPolyline` to cover the next most common geometry beyond lines/arcs (e.g., SOLID, POINT, TRACE/REGION approximations as appropriate).
- PR 5.2: Extend `toSVG` entity switch to render the newly-supported entities (even as approximations).
- PR 5.3: Fix block insertion basepoint adjustments in `denormalise` so block-contained TEXT/MTEXT/DIMENSION (and other supported types) render in the right place.

- Extend `toPolylines()` to support newly-added entities, with reasonable approximations where needed.
- Extend `toSVG()` and `dimensionToSVG` to cover missing annotation entities.
- Ensure all transforms and bounds computation are correct.

**Acceptance criteria:** representative DXFs render without missing/empty output for supported features.

### M6 — Docs, Versioning, and Compatibility

**Goal:** ship safely.

- Update docs to reflect AutoCAD 2024 reference (link + scope).
- Maintain backwards compatibility (or document breaking changes explicitly).
- Add a “Supported DXF features” matrix that is kept in sync with tests.

## Definition of “Complete 2D” for This Project

The project is considered “complete 2D” when:

- All 2D-critical entities listed in the Entities checklist are parsed without crashing.
- `toPolylines` supports geometry entities used in 2D drawings (line/arc/circle/polylines/splines/ellipse/hatch/solid/trace/region) with usable approximation.
- `toSVG` supports annotations commonly required for drawings (text/mtext/dimensions/leaders) and blocks/inserts.
- TABLES and OBJECTS required for the above features are parsed sufficiently to resolve styles, layers, and references.

## Appendix A — Supported DXF Features Matrix (2D)

This appendix turns the roadmap into a checklist that can be executed as small PRs.

Legend:

- **Parse**: DXF tuples → typed entity/table/object
- **Render (SVG)**: `src/toSVG.ts` produces output
- **Render (Polylines)**: `src/entityToPolyline.ts` + `src/toPolylines.ts` produce vertices
- **Block-safe**: `src/denormalise.ts` adjusts block basepoint for block-contained entities of this type

### A.1 Entities (2D-critical)

Already parsed (handlers exist): LINE, LWPOLYLINE, POLYLINE, ARC, CIRCLE, ELLIPSE, SPLINE, TEXT, MTEXT, DIMENSION, INSERT, ATTDEF, ATTRIB, HATCH, SOLID, POINT, VIEWPORT, OLE2FRAME.

The items below are the main gaps to reach “complete 2D” as defined in this plan.

| Entity | Parse | Render (SVG) | Render (Polylines) | Block-safe | Minimal implementation checklist |
| --- | --- | --- | --- | --- | --- |
| SEQEND | Sentinel only | N/A | N/A | N/A | Add `src/handlers/entity/seqend.ts` (optional) or harden sequencing in `src/handlers/entities.ts` + add fixture that stresses POLYLINE/VERTEX/SEQEND ordering |
| LEADER | Yes | Yes | No | No | Add `src/types/leader-entity.ts` + export in `src/types/index.ts`; add `src/handlers/entity/leader.ts`; add `toSVG` case (even minimal); add fixture + unit test |
| MLEADER | No | No | No | No | Add `src/types/mleader-entity.ts`; add `src/handlers/entity/mleader.ts`; likely requires OBJECTS support (DICTIONARY/XRECORD) for full fidelity; start with parse-only + safe ignore in render |
| TOLERANCE | Yes | Yes | No | No | Add `src/types/tolerance-entity.ts`; add `src/handlers/entity/tolerance.ts`; render as text fallback (SVG only) |
| IMAGE | Yes | No | No | No | Add `src/types/image-entity.ts`; add `src/handlers/entity/image.ts`; add OBJECTS: IMAGEDEF/IMAGEDEF_REACTOR; render as placeholder rect or ignore safely |
| UNDERLAY | Yes | No | No | No | Add `src/types/underlay-entity.ts`; add `src/handlers/entity/dwfUnderlay.ts` + `src/handlers/entity/dgnUnderlay.ts`; add OBJECTS: UNDERLAYDEFINITION; render placeholder/ignore |
| WIPEOUT | No | No | No | No | Add `src/types/wipeout-entity.ts`; add `src/handlers/entity/wipeout.ts`; render as polygon mask approximation or ignore safely |
| RAY | No | No | No | No | Add `src/types/ray-entity.ts`; add `src/handlers/entity/ray.ts`; render as long line (bounded by extents) or ignore |
| XLINE | No | No | No | No | Add `src/types/xline-entity.ts`; add `src/handlers/entity/xline.ts`; render as long line (bounded by extents) or ignore |
| OLEFRAME | No | No | No | No | Add `src/types/oleframe-entity.ts`; add `src/handlers/entity/oleframe.ts`; render placeholder/ignore |
| TRACE | No | No | No | No | Add `src/types/trace-entity.ts`; add `src/handlers/entity/trace.ts`; render as closed polyline (both SVG and polylines) |
| REGION | No | No | No | No | Add `src/types/region-entity.ts`; add `src/handlers/entity/region.ts`; start with parse-only + safe ignore in render |
| TABLE (entity) | No | No | No | No | Add `src/types/table-entity.ts`; add `src/handlers/entity/table.ts`; render minimal (text grid) or ignore safely |
| SHAPE | No | No | No | No | Add `src/types/shape-entity.ts`; add `src/handlers/entity/shape.ts`; likely depends on STYLE/LTYPE; start parse-only |
| MLINE | No | No | No | No | Add `src/types/mline-entity.ts`; add `src/handlers/entity/mline.ts`; likely depends on MLSTYLE object/table; start parse-only |

### A.2 Tables (2D-relevant)

| Table | Current status | Primary file(s) to change | Minimal checklist |
| --- | --- | --- | --- |
| APPID | Missing | `src/handlers/tables.ts`, `src/types/tables.ts` | Add entry type; extract group in `parseTables`; add unit test verifying at least one APPID entry exists |
| BLOCK_RECORD | Missing | `src/handlers/tables.ts`, `src/types/tables.ts` | Add entry type; extract group in `parseTables`; ensure blocks can reference it without crashing |
| UCS | Missing | `src/handlers/tables.ts`, `src/types/tables.ts` | Add entry type (minimal fields); extract group in `parseTables`; add unit test |
| VIEW | Missing | `src/handlers/tables.ts`, `src/types/tables.ts` | Add entry type; extract group in `parseTables`; add unit test |

### A.3 Objects (2D-relevant)

| Object | Current status | Primary file(s) to change | Minimal checklist |
| --- | --- | --- | --- |
| DICTIONARY | Implemented | `src/handlers/objects.ts` (+ new types file if desired) | Group objects by `0`; add DICTIONARY parser; store by handle for lookup |
| XRECORD | Implemented | `src/handlers/objects.ts` | Add XRECORD parser; preserve raw records for downstream consumers |
| DIMASSOC | Missing | `src/handlers/objects.ts` | Add DIMASSOC parse with safe unresolved references; add fixture-based test |
| IMAGEDEF / IMAGEDEF_REACTOR | Implemented | `src/handlers/objects.ts` | Parse enough to resolve IMAGE entity references; do not crash if external files missing |
| UNDERLAYDEFINITION | Implemented | `src/handlers/objects.ts` | Parse enough to resolve DWFUNDERLAY/DGNUNDERLAY references; do not crash if external files missing |
| FIELD | Missing | `src/handlers/objects.ts` | Parse as raw text/value pairs; do not attempt full evaluation initially |
| TABLESTYLE | Missing | `src/handlers/objects.ts` | Parse style basics; used later for TABLE entity rendering |
| GROUP | Missing | `src/handlers/objects.ts` | Parse group membership; safe ignore if not used |

## Appendix B — PR Sequencing (Executable Roadmap)

This appendix provides an explicit sequence of PRs. The intent is to keep each PR small, testable, and shippable.

### B.0 PR rules of thumb

- Prefer “vertical slices”: **type → handler → registration → tests → minimal rendering**.
- Keep “parse-only + safe ignore in render” as an acceptable intermediate state for complex entities.
- Each PR should add or update at least one unit test under `test/unit/*` and reuse an existing fixture in `test/resources/*` when possible.
- If a feature requires both ENTITIES and OBJECTS/TABLES, land the dependency first (OBJECTS/TABLES), then the entity.

### B.1 Recommended order (high value first)

- **Stabilize existing behavior**: ✅ PR B1.1 (POLYLINE/VERTEX/SEQEND sequencing), ✅ PR B1.2 (block basepoint for TEXT/MTEXT/DIMENSION).
- **Unblock references and metadata**: ✅ PR B1.3 (OBJECTS dispatch + DICTIONARY), ✅ PR B1.4 (XRECORD).
- **Enable images/underlays**: ✅ PR B1.5 (IMAGEDEF / IMAGEDEF_REACTOR), ✅ PR B1.6 (IMAGE entity), ✅ PR B1.7 (UNDERLAY defs + UNDERLAY entity).
- **Add remaining common 2D annotation**: ✅ PR B1.8 (LEADER), ✅ PR B1.9 (TOLERANCE), PR B1.10 (DIMASSOC), PR B1.11 (MLEADER).

### B.2 PR templates by feature type

#### B.2.1 New entity (simple geometry)

Use this template for entities like RAY/XLINE/TRACE.

- PR: Add `src/types/<name>-entity.ts` and export it from `src/types/index.ts`.
- PR: Add `src/handlers/entity/<name>.ts` and register in `src/handlers/entities.ts`.
- PR: Add minimal rendering (SVG: add a `case` in `src/toSVG.ts`; polylines: add a branch in `src/entityToPolyline.ts` if applicable).
- PR: Add/extend one fixture-based test (`test/unit/*`) proving parse + render does not crash.

#### B.2.2 New entity (reference-based)

Use this template for IMAGE/UNDERLAY/WIPEOUT.

- PR: Add/extend required OBJECTS first (e.g., IMAGEDEF).
- PR: Add entity parsing (store handles/refs).
- PR: Add rendering behavior as a placeholder element (preferred) or safe ignore with a warning (acceptable initially).
- PR: Add unit tests that assert parsing does not throw and that rendering behavior matches the chosen strategy.

#### B.2.3 New object (OBJECTS section)

- PR: Introduce object grouping + dispatch-by-type in `src/handlers/objects.ts`.
- PR: Implement one object type at a time (DICTIONARY, then XRECORD, then DIMASSOC, etc.).
- PR: Add tests using an existing fixture that contains the object, or add a minimal new fixture.

### B.3 Concrete PR checklist per missing 2D entity

This table expands Appendix A into explicit PR steps.

| Entity | PR 1 (Parse) | PR 2 (SVG) | PR 3 (Polylines) | PR 4 (Block-safe) |
| --- | --- | --- | --- | --- |
| LEADER | Add type + handler + register + tests | Add minimal `toSVG` case | Optional (usually not needed) | Update `denormalise` if leader can appear in blocks |
| MLEADER | Add type + handler + register + tests (parse-only) | Safe ignore or placeholder first | N/A | Later, after DICTIONARY/XRECORD/DIMASSOC coverage |
| TOLERANCE | Add type + handler + register + tests | Render as text fallback | N/A | Update `denormalise` if used in blocks |
| IMAGE | Add IMAGEDEF(+reactor) objects, then IMAGE entity parse + tests | Placeholder rect/image element or safe ignore | N/A | Update `denormalise` for block-contained images |
| UNDERLAY | Add underlay defs objects, then UNDERLAY entity parse + tests | Placeholder | N/A | Optional |
| WIPEOUT | Add type + handler + tests (parse-only) | Placeholder or safe ignore | Optional (as polygon) | Optional |
| RAY | Add type + handler + tests | Render as bounded line | Optional | Optional |
| XLINE | Add type + handler + tests | Render as bounded line | Optional | Optional |
| OLEFRAME | Add type + handler + tests | Placeholder or safe ignore | N/A | Optional |
| TRACE | Add type + handler + tests | Render as closed polyline | Add polyline conversion | Optional |
| REGION | Add type + handler + tests (parse-only) | Safe ignore first | Safe ignore | N/A |
| TABLE (entity) | Add type + handler + tests (parse-only) | Safe ignore/placeholder | N/A | Optional |
| SHAPE | Add type + handler + tests (parse-only) | Safe ignore first | N/A | N/A |
| MLINE | Add type + handler + tests (parse-only) | Safe ignore first | N/A | N/A |

### B.4 Concrete PR checklist for missing tables

- PR: Add types to `src/types/tables.ts` for APPID/BLOCK_RECORD/UCS/VIEW.
- PR: Extend `src/handlers/tables.ts` to extract the table groups and return them on `parsed.tables`.
- PR: Add tests in `test/unit/tables.test.js` asserting at least one entry is parsed for each newly-supported table in at least one fixture.

### B.5 Concrete PR checklist for missing objects

- PR: Refactor `src/handlers/objects.ts` into group-by-object + dispatch-by-type (no behavior change for LAYOUT).
- PR: Add DICTIONARY support + tests.
- PR: Add XRECORD support + tests.
- PR: Add DIMASSOC support + tests.
- PR: Add IMAGEDEF / IMAGEDEF_REACTOR support + tests.
- PR: Add FIELD support + tests.
- PR: Add TABLESTYLE support + tests.
- PR: Add GROUP support + tests.
