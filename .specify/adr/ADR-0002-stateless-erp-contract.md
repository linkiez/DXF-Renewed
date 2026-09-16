# ADR-0002: Stateless ERP Nesting Contract

- **Status**: Proposed
- **Date**: 2026-09-16
- **Feature**: `specs/006-stateless-erp-contract`
- **Constitution impact**: Principle V exception for Zod runtime validation; requires package major
  bump from `8.0.0` to `9.0.0`

## Context

The ERP boundary requires runtime validation of caller-owned requests and emitted artifacts while
preserving exported TypeScript interfaces. The contract also needs deterministic canonical
serialization, SHA-256 digests, explicit versioning, and a stateless Observable execution path.

## Decision

1. Use exported TypeScript interfaces as the public contract.
2. Use Zod schemas as the runtime validation boundary for requests and artifacts.
3. Add Zod to `dependencies`, not `devDependencies`, because published consumers execute validation.
4. Use platform Web Crypto SHA-256 over deterministic canonical JSON projections.
5. Ship the dependency and public contract as package version `9.0.0`.
6. Keep ERP orchestration in `src/nesting/erp/` and delegate nesting to existing algorithms.

## Consequences

- Consumers receive a typed, runtime-validated ERP artifact without persistence or external lookup.
- The package has one additional runtime dependency and a major-version migration.
- Digest projections must explicitly exclude timestamps, timings, correlation metadata, logs, and
  digest fields while including deterministic layout and manufacturing output data.
- The Constitution version and amendment history must be updated in the same atomic implementation
  change.

## Alternatives rejected

- Dev-only Zod: published consumers would not receive runtime validation.
- Handwritten validators: they duplicate the TypeScript contract and drift over time.
- Direct `JSON.stringify` hashing: insertion order is not a canonical serialization guarantee.
- A second nesting algorithm: violates reuse and risks output divergence.
