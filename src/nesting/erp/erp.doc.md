# nesting/erp

## Overview

The ERP adapter exposes a stateless, versioned nesting contract for Node.js and browser
consumers.

## Responsibilities

- Validate ERP-owned request and artifact boundaries with Zod.
- Delegate geometry work to the existing true-shape nesting implementation.
- Produce deterministic canonical JSON and Web Crypto SHA-256 digests.
- Return complete, partial, or rejected artifacts through a cold RxJS Observable.

## Inputs and outputs

- Inputs: `ErpNestingRequest`, including correlation, machine and process snapshots, parts, stock,
  clearances, and seed.
- Outputs: `ErpNestingArtifact`, with layout, plan, deterministic metrics, issues, unplaced
  reasons, and input/output digests.

## Error handling

Expected manufacturing outcomes are emitted as artifacts. Invalid contract versions or malformed
requests use the Observable error channel.

## Determinism

Digest projections exclude timestamps, timings, logs, correlation metadata, and digest fields.
Layout decisions, selected sheets, cut/nesting plan, metrics, unplaced reasons, and manufacturing
output are included in the output projection.
