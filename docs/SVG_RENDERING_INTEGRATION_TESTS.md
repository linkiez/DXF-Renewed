# SVG Rendering Integration Tests

## Goal

Add end-to-end tests that validate the **final SVG output** for real DXF fixtures:

`DXF fixture → parseString() → (optional denormalise) → toSVG() → SVG assertions`

The project already has strong unit tests for geometry and parsing. This document defines a predictable integration-test layer to catch regressions at the “final render” boundary.

## Framework Choice

Run the final rendering integration tests in a **real browser** using **Playwright**.

Rationale:

- Executes the same rendering code path in a browser runtime.
- Enables future pixel/screenshot tests (if ever needed) without changing frameworks.
- Still supports stable structural assertions (regex/DOM parsing) for deterministic checks.

## Where Tests Live

- Integration tests: `test/integration/**`
- Browser integration tests: `test/integration-browser/**`
- DXF fixtures: `test/resources/*.dxf`

Browser harness:

- `test/browser/harness.html`
- Served by `tools/browser_test_server.cjs`

Scripts:

- `yarn test:integration` (browser, via Playwright)
- `yarn test:integration:node` (legacy Node-only integration tests)

## What Integration Tests Should Assert

Integration tests should focus on **stable, user-visible output** and avoid overfitting internal implementation details.

Recommended assertions (in order):

1. **SVG well-formed envelope**
   - Contains `<svg` and `</svg>`
   - Includes `viewBox="..."`

2. **Entity-specific rendering markers**
   - Presence of SVG elements expected for the entity type (`<line>`, `<path>`, `<circle>`, `<text>`, `<image>`)

3. **Critical attributes**
   - For example: `marker-start/marker-end` for DIMENSION arrows
   - For example: correct path command type for ARC (`A`) or SPLINE (`C/Q`)

4. **Text content (when applicable)**
   - Assert the final SVG contains the expected text payload

5. **No crashes on full fixture set**
   - A single integration test can iterate a curated list of fixtures and ensure rendering does not throw.

### Saved Render Artifacts (PNG)

Browser integration tests should save a screenshot under `test/rendered/` for manual review.

- The file can be overwritten on re-run.
- Prefer a deterministic filename tied to the fixture name, e.g. `test/rendered/dimension-vertical.png`.

Note: these PNGs are tracked in git. If you regenerate them, include the updated files in your PR.

### Handling Non-Deterministic IDs

Some renderers generate IDs using `Date.now()` (e.g. DIMENSION arrow markers). Integration tests should validate **prefix-based patterns**:

- `dim-arrow-start-\d+`
- `dim-arrow-end-\d+`

Avoid asserting the full exact ID.

## Golden Files (Optional)

If/when the project wants pixel-perfect or full-SVG snapshots, consider adding a “golden SVG” snapshot layer.

Guidelines:

- Only snapshot **small, stable fixtures**.
- Normalize dynamic values (e.g. marker IDs) before snapshotting.
- Keep snapshots per-fixture under `test/snapshots/`.

This is intentionally optional; regex-based structural assertions are the default.

## DIMENSION: First Integration Target

Start with fixtures that include real DIMENSION output:

- `test/resources/dimension-vertical.dxf`

Suggested assertions:

- Markers exist (`<marker id="dim-arrow-start-..."`)
- Dimension line uses `marker-start/marker-end`
- Text appears in SVG (fixture includes `5.35`)

See:

- `test/integration-browser/dimension-rendering.browser.spec.js`

## Adding a New Integration Test (Checklist)

1. Pick or create a DXF fixture under `test/resources/`.
2. (Recommended) Validate it with `yarn validate:fixtures` (see `docs/FIXTURE_VALIDATION_EZDXF.md`).
3. Add a new `test/integration/*.integration.test.js`.
   - Or, for browser execution, add `test/integration-browser/*.browser.spec.js`.
4. Assert:
   - SVG envelope + viewBox
   - Entity-specific elements
   - Critical attributes
   - Screenshot is saved to `test/rendered/<fixture-name>.png` (overwrite on re-run)
5. Run:
   - `yarn test:unit`
   - `yarn test:integration`
