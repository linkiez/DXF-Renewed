# Nesting API

`index.ts` exposes the Observable-based part nesting entry points:

- `nestDXF` parses DXF text, extracts parts, and nests them.
- `nestWithPreset` applies a preset and accepts optional nesting overrides.
- `quickNest` applies laser defaults with an auto-sized public bin.

The optional `seed` nesting option is forwarded through all entry points.
