# Quickstart: Stateless ERP Nesting Contract

## Prerequisites

- Node.js `>=22.13.0`
- Yarn `4.12.0`
- Repository dependencies installed with `yarn install`

## Validation commands

Run the standard gates:

```bash
yarn type-check
yarn lint
yarn test:unit
yarn build
git diff --check
```

Run the feature-specific tests:

```bash
yarn test:unit --grep "ERP nesting contract"
yarn test:integration:node --grep "ERP nesting contract"
```

## Required scenarios

1. Submit a complete caller-owned request and subscribe to one Observable emission. Assert that
   correlation, machine/stock/profile snapshots, `inputDigest`, `outputDigest`, and a serializable
   artifact are present.
2. Submit the same canonical request 100 times with the same seed. Assert equal output digests and
   equal deterministic layout decisions.
3. Submit a request with an unavailable compatible resource. Assert a `partial` artifact, explicit
   `unplaced` reasons, and no external state access or mutation.
4. Change only `requestedAt`. Assert that the input and output digests remain unchanged.
5. Add a caller override. Assert that it is preserved in the emitted artifact and included in the
   auditable request projection when applicable.
6. Validate malformed input and an unsupported contract version. Assert no artifact is emitted and
   the contract violation is surfaced through the documented error path.
7. Run the bundled browser flow and assert that the ERP Observable and Web Crypto SHA-256 path
   work without Node-only crypto imports.

## Validation evidence

The implementation was validated with 100 equal requests: all output digest values matched.
The Node integration suite passed 7 ERP scenarios, the targeted Chromium browser contract test
passed, and `yarn type-check`, `yarn build`, `yarn quality:gate`, and `git diff --check` passed.

See `data-model.md` for entity rules and `contracts/erp-nesting-contract.ts` for the public
TypeScript shape.
