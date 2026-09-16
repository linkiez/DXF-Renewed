# Research: Modular Laser and Plasma Post-Processing

## Decision: Reuse the machine-independent cut-path boundary

**Rationale:** `CutPlan` and its action types already isolate sequencing and geometry from machine
dialects. Post-processors will consume only `CutPlan` plus a caller-supplied machine profile, which
preserves the existing library boundary and avoids coupling emitters to nesting internals.

**Alternatives considered:** Reading `CutLayout`, nesting entities, or placement internals directly
was rejected because it would duplicate planning knowledge and make processor variants dependent on
the nesting implementation.

## Decision: Use a versioned processor registry with explicit profile selection

**Rationale:** The machine profile supplies the processor identifier and revision. A registry can
reject unknown or duplicate variants deterministically and prevents silent fallback to another
dialect.

**Alternatives considered:** Inferring a processor from a machine name or automatically selecting
the newest compatible processor was rejected because incomplete or changed machine metadata could
produce unsafe G-code.

## Decision: Emit through a shared tokenized G-code writer

**Rationale:** A shared writer centralizes numeric formatting, line endings, comments, and command
ordering. Laser and plasma processors can then vary only their process vocabulary and templates.

**Alternatives considered:** Ad-hoc string concatenation in each processor was rejected because it
duplicates grammar and makes reviewed output drift likely.

## Decision: Linearize unsupported curves only with an approved profile tolerance

**Rationale:** The machine profile remains the source of calibration truth. Deterministic segment
generation with a finite positive tolerance supports machines without arcs while rejecting unsafe
implicit defaults.

**Alternatives considered:** Always rejecting curves was rejected because the specification permits
approved equivalents. A built-in tolerance was rejected because it would invent machine behavior.

## Decision: Block release on every validation error

**Rationale:** The specification requires that no program with a validation error is releasable.
Results should retain explicit validation issues and set release status only after all checks pass.

**Alternatives considered:** A force or override flag was rejected because it conflicts with the
clarified release rule.

## Decision: Compare canonicalized G-code text exactly

**Rationale:** Canonicalization removes only permitted representation differences such as line
ending and trailing whitespace normalization. Exact comparison preserves command order and catches
unexpected dialect changes in reviewed fixtures.

**Alternatives considered:** Semantic comparison, numeric tolerances, and human-only review were
rejected because they could hide command or ordering changes that affect machine behavior.

## Decision: Use checked-in golden fixtures for approved processors

**Rationale:** Versioned expected G-code files make processor approval reproducible in unit tests
without persistence or network services. Fixture paths include processor identity and revision.

**Alternatives considered:** Runtime calls to an ERP or vendor service were rejected by the
constitution's no-network and no-new-service constraints.

## Decision: Add a Hypertherm EDGE Connect processor from the Markdown reference

**Rationale:** `docs/Hypertherm EDGE PRO Programmer reference.md` contains the Hypertherm EDGE
Connect Programmer Reference 809550, Revision 6 (April 2025). It documents EIA RS-274D support,
directly supported `G00` and `G01` movement codes, comments, line numbers, axis words, and the
separate G59, THC, XPR, and advanced-feature sections. The first processor slice should implement
only the directly supported, verified subset needed by the cut-plan actions and should preserve
unsupported-code rejection rather than infer vendor behavior.

**Alternatives considered:** The empty PDF was rejected as a source of truth. Implementing all
legacy, ESSI, XPR, bevel, waterjet, and advanced codes in the first slice was rejected because
the feature requires approved variants and reviewed outputs, not an unbounded vendor language
implementation.

**Reference constraint:** The Markdown reference is used as the primary technical source. The
empty `docs/Hypertherm EDGE PRO Programmer reference.pdf` remains non-authoritative and must not be
used to infer additional commands.
