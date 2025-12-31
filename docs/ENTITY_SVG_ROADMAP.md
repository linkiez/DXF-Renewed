# Entity SVG Roadmap (Fixture → ezdxf → SVG Integration)

This roadmap is a **repeatable checklist** for each DXF entity:

1. Confirm/produce a fixture in `test/resources/`
2. Validate it with ezdxf
3. Add/extend unit parsing tests
4. Add final SVG integration tests

The goal is incremental coverage: one entity at a time, with fixtures and tests proving end-to-end behavior.

## Template (Use For Every Entity)

### 1) Fixture

- Add or pick a DXF fixture in `test/resources/<entity>-<scenario>.dxf`.
- Keep fixtures minimal: only the needed sections/entities.

### 2) ezdxf validation

- Run `yarn validate:fixtures`
- Confirm:
  - The file loads in ezdxf
  - `$ACADVER` is present and sane
  - Entity type counts include your target entity

### 3) Unit tests

- Add unit parsing tests under `test/unit/`.
- Assert minimum required fields for the entity type.

### 4) SVG integration tests

- Add `test/integration-browser/<entity>-rendering.browser.spec.js`.
- Assert:
  - `<svg ...>` envelope
  - `viewBox="..."`
  - Required SVG elements exist
  - Key attributes exist (markers, transforms, href, etc)
  - Expected text content (when applicable)

#### Saved PNG per entity (required)

Every browser integration test should save a screenshot to `test/rendered/` for manual review.

- Use deterministic naming tied to the fixture: `test/rendered/<fixture-name>.png`
- Overwrite is expected (re-running tests updates the same file).

See: `docs/SVG_RENDERING_INTEGRATION_TESTS.md` (Saved Render Artifacts section)

## DIMENSION (Start Here)

### Fixture(s)

- `test/resources/dimension-vertical.dxf`
- `test/resources/dimensions.dxf` (optional secondary)

### ezdxf validation

- Run `yarn validate:fixtures`
- Confirm `dimension-vertical.dxf` includes `DIMENSION` in modelspace.

### Unit tests

Already present:

- `test/unit/dimensions.test.js`

### SVG integration test

Implemented:

- `test/integration-browser/dimension-rendering.browser.spec.js`

Assertions:

- Marker definitions exist (prefix-based regex)
- Dimension line references `marker-start` and `marker-end`
- Dimension text appears in the SVG (`5.35`)

## Next Entities (Suggested Order)

This order prioritizes entities already in the codebase and/or those that tend to break rendering pipelines.

1. TEXT
2. MTEXT
3. LEADER
4. TOLERANCE
5. IMAGE / IMAGEDEF
6. UNDERLAY (DWF/DGN/PDF underlay entities)
7. INSERT (block expansion)
8. HATCH
9. LWPOLYLINE / POLYLINE
10. SPLINE

For each, create at least one “single entity” fixture and one “mixed scene” fixture.
