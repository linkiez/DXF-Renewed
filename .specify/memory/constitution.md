# DXF-Renewed Constitution

## Core Principles

### I. Library-First, Additive Public API
Every feature ships as a self-contained module under `src/`, re-exported from the `src/index.ts`
barrel. New capability is additive: existing exported signatures may not break. An exception is
permitted only for a deliberate, documented breaking change that carries a recorded ADR and a
major version bump (see `.specify/adr/`). A feature that
cannot be used without a new external service or repository is out of scope. Each module states
its purpose in its header comment — no organizational-only modules.

### II. Reuse Before Rewrite (NON-NEGOTIABLE)
Already-tested code in the repository is reused before anything new is written:
`src/nesting/types.ts`, `config.ts`, `polygonUtils.ts`, `collision.ts`, `geometryAnalysis.ts`,
`binPacking/*`, and `src/nest/*`. New algorithms are permitted only where no existing code
computes the required property, and the rationale must be recorded. Duplicating a function that
already exists is a defect, not a style preference.

### III. Test-First (NON-NEGOTIABLE)
Tests are written before implementation and MUST fail first (Red → Green → Refactor). Runner is
Mocha + `tsx`: `npm run test:unit` for unit tests, `npm run test:integration:node` for node
integration tests. A task is complete only when its tests pass and no previously passing test
regresses. A bug fix starts with a test that reproduces the bug.

### IV. Determinism and Reproducibility
Identical input plus identical seed MUST produce identical output at the level of placement
decisions. Any bounded search MUST be bounded by a budget derived from the input, never by
wall-clock time. Iteration and tie-breaking order MUST be stable and independent of object
identity, hash-map ordering, or filesystem order. Non-deterministic output is a defect, not a
tuning issue.

### V. Strict TypeScript, Zero New Runtime Dependencies
Code compiles under the existing `tsconfig.json` (`strict`, `noImplicitReturns`,
`noFallthroughCasesInSwitch`, `moduleResolution: bundler`) and passes `npm run type-check`
(`tsc --noEmit`). No new entry may be added to `dependencies` in `package.json`, except a runtime
dependency approved by a recorded ADR and a major version bump (see `.specify/adr/`). No persistence,
no network I/O, and no mutation of caller-supplied input objects.

The stateless ERP contract is an approved exception: Zod is a runtime dependency because published
consumers must receive the same request and artifact validation as Node and browser callers. The
exception is governed by `.specify/adr/ADR-0002-stateless-erp-contract.md` and package major
version `9.0.0`.

## Additional Constraints

**Unit discipline**: geometry values carry no implicit unit. Where a unit exists it is explicit in
the type or the options object. Mixed-unit arithmetic is forbidden.

**Precision**: floating-point comparisons use the repository epsilon (`EPSILON` in
`src/nesting/config.ts`) rather than literal `0`; the same epsilon is used for collision, bounds
and containment checks.

**Performance floors are acceptance criteria**: a time or yield threshold stated in a feature spec
is a pass/fail gate, not an aspiration. Failing it fails the feature; the calibration is the defect
to fix.

**Silent failure is forbidden**: an item that cannot be processed is returned with an explicit,
specific reason. Never drop input silently; never throw to signal an expected outcome.

## Development Workflow & Quality Gates

Before any commit, all of the following MUST pass:

1. `npm run type-check` — zero errors
2. `npm run lint` — zero errors
3. `npm run test:unit` — zero failures, no regression against the recorded baseline
4. Feature-specific acceptance thresholds (time, yield, precision) measured, not assumed

A failing gate blocks the commit. A gate may not be skipped, disabled, or narrowed to make a change
pass. Feature work is tracked in `specs/<###-feature>/` — `spec.md` → `plan.md` → `tasks.md` — and
`tasks.md` checkboxes are updated only when the corresponding gate passes.

## Governance

This constitution supersedes conflicting local convention. Amendments require an explicit edit to
this file, a recorded rationale in the same commit, and a version bump. Removing or weakening a
principle requires a minor or major version bump; clarification-only edits are a patch.

When a plan cannot satisfy a principle, the deviation MUST be documented in that plan's
`Complexity Tracking` table with the rejected simpler alternative. An undocumented deviation is a
blocking review finding, not a nitpick. Every implementation review verifies compliance with
Principles I–V and records which gates were run.

### Implement, Do Not Report

When a request is to implement, fix, refactor, or add capability, the deliverable is the changed
code, not a document about it. A report is acceptable only when explicitly requested (review,
audit, analysis, explanation) or when confirming a destructive or irreversible action. Missing
context is resolved with at most three short questions, then work proceeds.

### Coding Conventions

- Code identifiers, comments and JSDoc are English (`en_US`); user-facing strings and commit
  descriptions are Brazilian Portuguese (`pt_BR`).
- Public functions, methods, classes, interfaces and enums carry JSDoc (`@param`, `@returns`,
  `@throws`, `@example` where it aids use). Trivial private helpers and test code need none.
- No file may exceed 500 lines; split into focused helpers when it would.
- `any`, `unknown` in the core domain, and `[key: string]: any` are forbidden. `unknown` is
  permitted only at trust boundaries, then narrowed to a domain type. Prefer `Record<string, T>`
  with a concrete `T`.
- Never read, print, log or hard-code secrets, tokens or credentials. Access them indirectly
  (`process.env`, a vault, CI injection) and flag any hard-coded secret on sight.

### Documentation Discipline

A change inside `src/` updates the sibling `*.doc.md` in the same commit. No other documentation
(README, guides, summaries, changelogs) is created without an explicit request. `.doc.md` files are
consolidated and timeless — no "news", "changes" or release-note sections. `.specify/` governance
and `specs/<###-feature>/` feature records are exempt from this rule.

### Commit Discipline

Commits follow Conventional Commits: `<type>[scope]: <description>`, imperative, lowercase, no
trailing period, description under 72 characters. Each commit is atomic — one logical change;
tests travel with the change they validate. A breaking change requires `!` or a `BREAKING CHANGE:`
footer **and** explicit user approval before committing, with the migration path in the body.
`--no-verify` is never used.

### Comment Discipline

A code comment is justified only by a non-obvious architectural decision together with the
alternative it rejected, an active blocker with its upgrade path, or a summary closing the parent
issue. Narrative, decorative, changelog-style and restate-the-code comments are defects.
Intentional simplifications are marked with a `ponytail:` comment naming the ceiling and the
upgrade path. Feature work is tracked in `specs/<###-feature>/`; a `tasks.md` checkbox is flipped
only when the corresponding gate passes.

### Amendment History

- **2.0.0 (2026-09-15)**: Principles I and V relaxed for the Observable nesting surface
  (`specs/009-async-nesting-flows`): in-scope flow names may break under a major version bump, and
  RxJS may be added to `dependencies`. Rationale and scope:
  `.specify/adr/ADR-0001-observable-nesting-surface.md`. Major bump because a principle is weakened.
- **2.1.0 (2026-09-16)**: Principle V amended for the stateless ERP contract's Zod runtime
  validation dependency. Rationale and scope: `.specify/adr/ADR-0002-stateless-erp-contract.md`.

**Version**: 2.1.0 | **Ratified**: 2026-09-12 | **Last Amended**: 2026-09-16
