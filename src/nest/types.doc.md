# Nesting Types

`types.ts` defines the public data contracts for part-based nesting.

`NestOptions.seed` optionally selects the deterministic pseudo-random sequence
used by placement shuffling, rotation selection, and the embedded SVGnest
genetic algorithm. When omitted, the pipeline uses the stable default seed.
