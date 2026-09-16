# Nesting Types

`types.ts` defines the public data contracts for part-based nesting.

`NestOptions.seed` optionally selects the deterministic pseudo-random sequence
used by placement shuffling, rotation selection, and the embedded SVGnest
genetic algorithm. When omitted, the pipeline uses the stable default seed.

`NestOptions.baselineCompatibility: '7.7.6'` explicitly selects the historical
raw-DXF baseline random streams for `nestDXF`, `nestWithPreset`, and `quickNest`.
It exists for frozen parity validation while preserving the caller-provided
seed in the public request.
