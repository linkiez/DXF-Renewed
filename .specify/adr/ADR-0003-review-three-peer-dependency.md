# ADR-0003: three.js as Optional Peer Dependency for Nesting Review

- **Status**: Accepted
- **Date**: 2026-11-16
- **Feature**: `specs/007-nesting-simulation`
- **Constitution impact**: Principle V (Zero New Runtime Dependencies). `three` is not added to
  `dependencies`; it is an optional peer dependency plus a `devDependency`. No package major bump is
  required because no `dependencies` entry changes and consumers who do not install `three` see no
  behavior change. Confirmed by the maintainer on 2026-11-16 ("permitir three").

## Context

Feature 007 needs an accelerated top-down review of sheets with about 500 parts and about 10^4
planned actions, with constant-cost seek and smooth playback. The roadmap
(`ROADMAP-NESTING.md` §12, `docs/nesting/VIEWER-THREEJS.md`) selects three.js. Principle V forbids new
runtime dependencies without an ADR. A static SVG review must remain available as the fallback
(spec FR-005).

## Decision

1. Declare `three` in `peerDependencies` with `peerDependenciesMeta.three.optional = true`, and in
   `devDependencies` for tests.
2. Put the accelerated renderer in `src/nesting/review/three/`, exposed through an additive
   subpath export (`review/three`). Nothing reachable from `src/index.ts` imports `three`.
3. The renderer receives the `three` namespace, or an async loader for it, from the caller; library
   code contains no `import 'three'` in the main graph, so the iife `dist` bundle is unchanged.
4. The renderer uses an orthographic top-down camera, merged line buffers, instanced markers and a
   draw-range trail. Picking is done by the shared headless model, not by `Raycaster`.
5. Absence of `three`, absence of WebGL2 or context loss degrades to the SVG renderer with an
   explicit `GRAPHICS_UNAVAILABLE` or `GRAPHICS_LOST` notice.

## Consequences

- Consumers opening an accelerated review install `three` themselves; others pay nothing.
- The package carries one more optional peer to keep compatible; the tested major is recorded in
  the peer range at implementation.
- `docs/nesting/VIEWER-THREEJS.md` describes a perspective mode and `Raycaster` picking that this
  feature does not implement. It is not edited here (documentation outside sibling `.doc.md` files
  needs an explicit request) and stays known-stale until the maintainer asks for its update.
- Two renderers share one model, so display logic is tested once headlessly.

## Alternatives rejected

- `three` in `dependencies`: every consumer pays, and requires a major bump under Principle V.
- Static `import('three')` in the main graph: esbuild inlines it into the iife bundle and breaks
  when the package is absent.
- Canvas 2D as the primary renderer: redraw cost scales with plan size; no constant-cost seek.
- SVG only: retained as the mandatory fallback, insufficient as the primary view at the reference
  scale.
