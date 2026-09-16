# Research: Stateless ERP Nesting Contract

## Decision: Use a TypeScript-first contract with Zod runtime schemas

**Rationale:** Feature 006 requires exported TypeScript interfaces and runtime validation. Zod
provides a single executable validation definition that can be aligned with those interfaces while
keeping the public API type-safe. The ERP boundary should validate before adapting data to the
existing nesting models and validate the final artifact before emission.

**Alternatives considered:**

- Handwritten validators: rejected because they duplicate the contract and are harder to keep
  aligned with exported types.
- JSON Schema as the primary contract: deferred because the current package is TypeScript-first and
  no JSON Schema toolchain is required by the feature.
- Validation only inside existing nesting algorithms: rejected because it would not validate the
  complete ERP envelope or correlation metadata.

**Evidence:** `src/nesting/types.ts`, `src/nesting/config.ts`,
`src/nesting/trueShape/index.ts`, and `src/nesting/index.ts`.

## Decision: Expose a dedicated stateless ERP Observable entry point

**Rationale:** Existing `NestRequest`/`NestResponse` models describe algorithm-level true-shape
nesting, while the ERP artifact also needs correlation, snapshots, status, warnings, rejections,
unplaced reasons, overrides, versions, and digests. A dedicated `src/nesting/erp/` module avoids
overloading lower-level result types and can delegate to existing nesting flows without mutation or
external I/O.

**Alternatives considered:**

- Add ERP fields directly to `NestRequest` and `NestResponse`: rejected because it couples the
  algorithm contract to an ERP integration envelope.
- Build a second nesting algorithm: rejected by Constitution Principle II; the adapter must reuse
  existing nesting implementations.
- Use a service or persistence adapter: rejected by FR-003; persistence remains ERP-owned.

## Decision: Canonicalize JSON before SHA-256 hashing

**Rationale:** `JSON.stringify` preserves construction order but does not define canonical key
ordering, numeric normalization, volatile-field exclusion, or array semantics. The digest layer
must recursively sort object keys, normalize supported numbers, reject non-finite values, preserve
meaningful array order, and hash compact UTF-8 canonical JSON with the platform Web Crypto API.
`crypto.subtle.digest('SHA-256', ...)` is available in supported Node.js and browser runtimes,
keeping the published library portable. Timestamps, processing timings, logs, correlation
metadata, and digest fields are excluded from digest projections.

**Alternatives considered:**

- Hash direct `JSON.stringify` output: rejected because equivalent objects can produce different
  digests.
- Hash only the final layout: rejected because the audit must include the request and execution
  context that produced it.
- Add a canonicalization or hashing dependency: rejected because deterministic serialization plus
  the platform Web Crypto API is sufficient and the feature already adds Zod as the approved
  runtime dependency.

**Evidence:** `src/toJson.ts`, `src/nest/placementworker-core.js`,
`docs/nesting/TECHNOLOGY-DB.md`, and existing determinism tests.

## Decision: Continue with a partial artifact when resources are unavailable

**Rationale:** The clarified contract chooses partial continuation. Available resources are used,
affected items are returned in typed `unplaced` entries with specific reasons, and the artifact
status distinguishes complete, partial, rejected, and failed contract outcomes. Expected
processing outcomes are normal Observable emissions.

**Alternatives considered:**

- Reject the complete job without a layout: rejected by the clarified requirement.
- Substitute an implicit default resource: rejected because it can produce an unsafe manufacturing
  artifact and violates caller-owned resource assumptions.

## Decision: Version the contract explicitly

**Rationale:** Every request and artifact carries a contract major version. Additive fields remain
compatible within a major version; incompatible changes require a new major version and schema
dispatcher branch. This makes schema evolution explicit for ERP consumers.

**Alternatives considered:**

- Unversioned structural evolution: rejected because consumers cannot distinguish incompatible
  payloads.
- A new interface for every patch: rejected because it creates unnecessary surface fragmentation.

## Decision: Add Zod as an approved runtime dependency and plan the next major package release

**Rationale:** Zod is required at the published runtime boundary, not only in tests. Constitution
Principle V permits this only with a recorded ADR and a major version bump. The current package is
8.0.0, so implementation must record the exception and release the ERP contract in 9.0.0.

**Alternatives considered:**

- Keep Zod as a dev dependency: rejected because published consumers execute the validation path.
- Avoid runtime validation: rejected by FR-010.
