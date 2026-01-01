# DXF Fixture Validation (ezdxf)

## Goal

Ensure every DXF fixture under `test/resources/` is:

- Readable by **ezdxf** (independent parser), and
- Free of audit fatal errors (and optionally free of audit errors).

This provides an external sanity check so our test fixtures stay “real DXF” and not just “files our parser happens to accept”.

## How It Works

The project includes a small validator:

- `tools/ezdxf_validate_fixtures.py`

It:

1. Enumerates `test/resources/*.dxf`
2. Loads each file via `ezdxf.readfile(...)`
3. Extracts `$ACADVER`
4. Counts entity types in modelspace
5. Runs `doc.audit()` and reports counts

## Run Locally

- `yarn validate:fixtures`

Notes:

- If `./.venv-ezdxf/bin/python` exists, the script uses it.
- Otherwise it falls back to `python3`.

## Failure Policy

By default (current yarn script):

- Fails if any fixture cannot be read by ezdxf
- Fails if audit reports fatal errors or errors

If you need a “report-only” run, execute the script directly:

- `./.venv-ezdxf/bin/python tools/ezdxf_validate_fixtures.py`

## Using the Report

Use the printed per-file summary to:

- Verify a new fixture’s `$ACADVER` is what you expect
- Confirm an entity appears in the file (entity type counts)
- Catch malformed DXF output from generators

## Adding/Updating Fixtures

When adding a new fixture:

1. Add the DXF file under `test/resources/`.
2. Run `yarn validate:fixtures`.
3. Add unit tests (parsing) and integration tests (final SVG).

See also: the entity workflow checklist in `PLAN.md` under “Documentation (Consolidated) → Entity SVG Roadmap”.
