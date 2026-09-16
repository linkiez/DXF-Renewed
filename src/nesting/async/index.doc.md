# `nesting/async`

Observable adaptation layer for the nesting flows.

## Public surface

- `observeFlow` — wraps an `async` flow factory into a lazy, cold `Observable`.

## Scope

This module only changes the *shape* of the asynchronous API (FR-001). It does
not schedule work on a scheduler or worker; a flow may emit synchronously inside
`subscribe`.

Stays synchronous and is intentionally **not** wrapped:

`toNestedSvg`, `toNestedDxf`, `extractShapes`, `sortShapes`, `packMultiSheet`,
`searchBestArrangement`, `analyzeShapes`.
