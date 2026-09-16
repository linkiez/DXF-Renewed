# Embedded SVGnest Core

`svgnest-core.js` contains the bundled SVGnest genetic algorithm used by the
part-based nesting pipeline.

Randomized operations consume the per-run `config.random` function supplied by
`nestCore.ts`, rather than the global `Math.random`, so seeded runs remain
isolated and reproducible in Node and browser environments.
