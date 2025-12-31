---
applyTo: '**'
---
# Code Patterns & Best Practices

This document codifies the current implementation patterns used in DXF-Renewed, plus recommended best practices for new contributions.

## Scope

- Applies to all TypeScript code under `src/`.
- Covers parsing (DXF → typed model), denormalisation (INSERT expansion), and rendering (SVG / polylines).

## Tooling & Style

- **Runtime**: Node.js (see `package.json#engines`).
- **Package manager**: Yarn (see `package.json#packageManager`).
- **TypeScript**: `strict: true` (see `tsconfig.json`).
- **Lint/format**:
  - ESLint (Standard + TypeScript rules): `.eslintrc.json`
  - Prettier: `.prettierrc.json` (`semi: false`, `singleQuote: true`)

Best practices:

- Prefer `import type { ... }` for type-only imports.
- Avoid `any` or `unknown` in new code. If runtime constraints require it, keep it local and document why.
- Keep names and comments in **English (en_US)**.

## Project Architecture (High-Level)

Core pipeline:

- Parse: `parseString(dxfText)` → `ParsedDXF`
- Denormalise: `denormalise(parsed)` → flattened `Entity[]` with `transforms`
- Render:
  - `toSVG(parsed)` → SVG string
  - `toPolylines(parsed)` → numeric polylines for custom renderers

Entry points:

- Public API exports are defined in `src/index.ts`.
- `Helper` provides the “batteries included” API around parse/denormalise/render.

## Parsing Patterns

### DXF tuples and group codes

The parser converts DXF text into a tuple stream of `[groupCode, value]` where:

- Values are parsed into numbers for numeric group code ranges.
- Section routing happens in `src/parseString.ts` via `HEADER | TABLES | BLOCKS | ENTITIES | OBJECTS`.

Best practices:

- Do not change numeric parsing rules lightly; it impacts all handlers.
- Prefer **“parse what we can, warn for what we can’t”** instead of throwing.

### Section handlers

- Section handlers live under `src/handlers/*`.
- Each section handler accepts `DXFTuple[]` and returns a typed result.

Best practices:

- Keep handler interfaces stable. If you must extend output shape, do it in a backward-compatible way.

### Entity handlers (`src/handlers/entity/*.ts`)

Canonical pattern:

- Export `TYPE` as a string DXF entity type.
- Export `process(tuples)` that reduces tuples into a typed entity object.
- Delegate shared properties to `src/handlers/entity/common.ts`:
  - `Object.assign(entity, common(type, value))`

Example pattern:

- `LINE` handler parses geometry group codes, and falls back to `common()` for layer/color/etc.

Best practices:

- Prefer returning the public entity types from `src/types/*` when feasible.
- Keep parsing logic in a single `switch` over group codes.
- Store unknown/unhandled codes only if they are needed downstream; otherwise ignore.

### Multi-entity sequences (POLYLINE/VERTEX/SEQEND)

- `src/handlers/entities.ts` contains sequencing logic:
  - `POLYLINE` begins a stateful polyline.
  - Subsequent `VERTEX` entities are appended.
  - `SEQEND` terminates the sequence.

Best practices:

- Preserve sequencing correctness over convenience: incorrect state handling can corrupt the entity list.
- When ignoring invalid sequences, log via `logger.error` or `logger.warn` (do not throw).

## Types

- Public types are under `src/types/`.
- The union type `Entity` is defined in `src/types/entity.ts`.

Best practices:

- When adding a new entity:
  - Add a new type file in `src/types/<entity>-entity.ts`.
  - Export it from `src/types/index.ts`.
  - Add it to the `Entity` union if it is part of the public surface.

## Denormalisation (INSERT Expansion)

- Implemented in `src/denormalise.ts`.
- Responsibilities:
  - Resolve `INSERT` → referenced BLOCK.
  - Apply rectangular array replication.
  - Attach a `transforms` stack to each flattened entity.

Best practices:

- Denormalise should be deterministic and side-effect free (beyond logging).
- Avoid heavy deep clones in hot paths unless necessary for correctness.
- If you add entity types that can appear inside blocks, ensure block basepoint adjustments are correct (and test it).

## Rendering Patterns

### SVG (`src/toSVG.ts`)

- Prefer native SVG primitives when possible (`<circle>`, `<ellipse>`, path `A` commands).
- For complex curves, polyline interpolation is acceptable.
- Transform application uses `transformBoundingBoxAndElement`.

Best practices:

- Rendering should not throw on unsupported types. Use `logger.warn` and skip.
- Ensure **XML escaping** for any text inserted into SVG attributes or text nodes.

### Polylines (`src/entityToPolyline.ts` and `src/toPolylines.ts`)

- Use `entityToPolyline(entity, options)` as the single conversion point.

Best practices:

- Keep conversions pure: same input entity → same polyline output.
- Add options to `EntityToPolylineOptions` rather than hard-coding interpolation quality.

## Logging & Error Handling

- Use `src/util/logger.ts`.
- `info` and `warn` are gated by `config.verbose`.

Best practices:

- Prefer `logger.warn` for unsupported features.
- Prefer `logger.error` for invalid DXF content that is being skipped.
- Avoid `console.*` directly outside logger.

## Testing

- Unit tests: `test/unit/**` (Mocha + TSX).
- Functional tests: `test/functional/**`.
- Fixtures: `test/resources/*.dxf`.

Best practices:

- For each new entity/table/object:
  - Add or reuse a fixture DXF that exercises the feature.
  - Add at least one unit test asserting:
    - parsing does not throw,
    - output shape is correct (minimum required fields),
    - rendering (SVG or polyline) does not throw if supported.

## Backward Compatibility

Best practices:

- Treat exports from `src/index.ts` as public API.
- If you must rename/move types, re-export old names for at least one major version.
- “Parse-only + safe ignore in rendering” is acceptable for complex entities, as long as it is documented.

## Contribution Checklist (Quick)

Before opening a PR:

- Run `yarn lint`, `yarn type-check`, `yarn test`.
- Keep PRs focused (one feature/fix).
- Use Conventional Commits.
