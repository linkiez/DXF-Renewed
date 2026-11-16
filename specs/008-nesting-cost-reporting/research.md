# Nesting Cost Reporting Research

## D1. Decision: Input is `ErpNestingArtifact` plus optional `CutLayout` and `CutPlanResult` and a `CostModel`

**Rationale:** The artifact carries the layout (placements, sheets, utilization, waste, unplaced), the
correlation and both digests; the cut plan carries per-action lengths, process metadata and per-plan
stats; the cost model carries everything commercial. All are caller-supplied, so the module reads no
ERP data (FR-006) and never recomputes layout, sequence or metrics (FR-007). Net part area needs the
shapes of the cut layout; without it the part outline from the placement is used and the part carries
an info notice.

**Alternatives considered:** Adding costs to `ErpNestingArtifact` was rejected: it would change the 006
contract and its digest projection. Requiring the original request was rejected for the same reason as
in `007`: the report must work from what the ERP stored.

## D2. Decision: One module `src/nesting/cost/` with a sync core and an Observable flow

**Rationale:** The numbers are pure functions (`buildCostBreakdown`), testable without digests. SHA-256
digests are asynchronous (Web Crypto), so the public flow `calculateCostReport` returns a cold
Observable that emits one `CostReport`, exactly like `calculateErpNesting` (`observeFlow`), keeping one
async style across the ERP surface (006 FR-008).

**Alternatives considered:** A Promise API was rejected for consistency with 006. Making digests
optional in a sync function was rejected: the report must always be auditable (FR-013).

## D3. Decision: Extract part linking and placement resolution into `src/nesting/linking/`

**Rationale:** `review/linkParts.ts` and `review/resolvePlacements.ts` already implement exactly what
cost needs: resolving a cut action to a placed part (layout contours, then `partId` rules) and turning
placements into parts with deterministic instances, sheet fallback and compound handling. Cost must
agree with the review on which part an action belongs to. The shared modules return structured results
(unresolved references, approximate outlines) with no user text; `review` wraps them and adds its pt_BR
notices, `cost` wraps them and adds its own. Review behavior and tests stay identical.

**Alternatives considered:** Importing from `review` (internal modules, wrong dependency direction);
copying the logic (violates Principle II and risks divergent part identity).

## D4. Decision: Money as integers of the smallest currency unit, with largest-remainder apportionment

**Rationale:** FR-018 and SC-001 require exact reconciliation. Each component is computed as an exact
(unrounded) amount per part in minor units. The job amount of a component is the rounded sum of the
exact part amounts; the part amounts are then apportioned to integers that add up to it by the largest
remainder method, ties broken by part order (artifact order). Rates are accepted in major units as
decimals and converted once with the currency's `minorUnitDigits`. Because the apportionment is applied
per component and the grand total is the sum of components, parts reconcile to the job for every
component and for the total.

**Alternatives considered:** Rounding each part independently (parts may not add up to the job); floating
totals compared with a tolerance (violates "exactly"); arbitrary-precision decimals (extra code or a
dependency without need, since only the final integer matters).

## D5. Decision: Allocation bases per component

**Rationale:**

| Component | Exact amount per part | Job-level amounts |
|---|---|---|
| Material | stock price of each sheet (full-sheet price per stock id, or the remnant value) distributed to the placed parts of that sheet in proportion to net area | A sheet without parts is not charged; unplaced items are not charged (FR-011) |
| Cutting | cutting time of the part's linked cut, lead, overcut, tab and common-line actions x hourly cutting rate | none |
| Pierce | pierce count x cost per pierce | none |
| Travel | travel time of the part's linked rapid actions x hourly travel rate | rapid actions with no part (for example the first move from the origin) form an unallocated amount |
| Consumable | usage x (consumable cost / life), by pierces or cutting seconds | none |
| Labour | machine time (cutting + pierce + travel) x labour rate | handling seconds per sheet and per job x labour rate |

Amounts that have no owner part (unallocated travel, per-sheet and per-job handling) are distributed to
the placed parts of their scope (sheet or job) in proportion to the part's net area, so every component
of every part sums to the job amount (FR-002). The distribution stays visible: each one is listed in
`CostBreakdown.distributed` (category, scope, integer amount) and raises an info `UNALLOCATED_DISTRIBUTED`
notice. The net area of a part is `+abs(area)` of its outer contour minus `abs(area)` of its holes (by
`isOuter`, never by the stored sign). When no part of a sheet has positive net area, the sheet price is
split equally among its parts. Waste cost stays inside the part totals through the material rule and is also reported as
a figure (`wasteArea`, as supplied by the artifact).

**Alternatives considered:** Leaving unallocated amounts at job level only (breaks "parts add up to the
job"); charging waste separately (changes the quote total semantics; kept as a reported figure).

## D6. Decision: Time model

**Rationale:** For each action: cutting-like kinds (`cut`, `lead-in`, `lead-out`, `overcut`, `tab`,
`common-line`) take `length / speed` with `speed` taken from the action's numeric `feed` metadata when
present, else from the model's cutting speed; `rapid` takes `length / rapid speed`; `pierce` takes the
action's numeric `dwell` metadata when present, else the model's pierce dwell. Length is converted with
`geometryUnitsPerMeter`; speeds are in meters per minute and times are reported in seconds. A missing
speed or dwell makes the dependent time, and the components that use it, incomplete. Arcs and beziers
use the cut plan's own measured length (the same sampling rules as `review`'s `buildTimeline`, reused
through the shared action path function).

**Alternatives considered:** Using a generic default speed (would invent a value, forbidden by FR-004);
reading speeds from process-profile `settings` by guessed key names (non-portable; the model declares
speeds explicitly).

## D7. Decision: Consumable life model

**Rationale:** Each consumable has a cost and a life expressed in pierces or in cutting seconds. Cost per
use = cost / life; usage is the part's pierce count or cutting seconds. A life of zero or less is
rejected at validation (FR-016). A missing life leaves the consumable component incomplete.

## D8. Decision: Status model and propagation

**Rationale:** Every component of a part, sheet and the job has `complete`, `estimated` or `incomplete`.
`incomplete` carries no amount and a reason code; `estimated` carries an amount because the caller marked
at least one input it used as an unverified estimate (`estimated: true` on that value); `complete` needs
neither. The job and part totals are `incomplete` if any component is, `estimated` if none is incomplete
and any is estimated, else `complete`. An incomplete total exposes only `partialSubtotal` (the sum of the
complete and estimated components), never a final amount (User Story 2).

**Alternatives considered:** Treating missing values as zero (forbidden: invents values); failing the
whole report on any gap (loses the useful part of the estimate).

## D9. Decision: Report content and digests

**Rationale:** The report contains: status and report contract version; the artifact correlation and
both artifact digests; the digest of the canonical cost model; currency; the breakdown by job, sheet and
part; the time by category; the production figures (sheets used, yield and waste as supplied, unplaced
items with reasons); and notices. The report digest is the SHA-256 of the canonical JSON of the whole
report without the digest field itself, so identical inputs produce an identical report and digest
(SC-004). Nothing wall-clock based is included.

## D10. Decision: Tabular export is RFC 4180 CSV with fixed columns

**Rationale:** The roadmap asks for a documented CSV schema. UTF-8, comma separator, `\n` line ends,
header row, fields quoted when they contain a comma, quote or newline, decimal point as separator,
amounts as integers in minor units plus a currency column, times in seconds with a fixed number of
decimals, empty cell for an incomplete amount. Two tables: `parts` (one row per placed part) and `job`
(one row per category plus total, and sheet rows). Column lists are fixed in the contract and reading the
file back reproduces the report totals (SC-007).

**Alternatives considered:** Locale formats such as `;` with `,` decimals (not locale-independent); JSON
only (the ERP asked for a documented CSV).

## D11. Decision: Validation with Zod, plus explicit checks

**Rationale:** The request and the cost model are validated by Zod schemas aligned with the exported
types (the same boundary and the same exception as ADR-0002); the artifact is validated with the
existing `erpNestingArtifactSchema` of 006, composed into the request schema, never copied. Rules a schema cannot state cleanly
(single currency, positive lives, estimated markers on numeric values only) live in
`validateCostModel`, which returns structured issues. An invalid model yields an `unavailable` report
with specific notices, not an exception, because it is an expected outcome (silent-failure rule);
structurally invalid requests (not an object, wrong contract version) reject the Observable like the ERP
flow.

## D12. Decision: Messages in pt_BR from one internal module

**Rationale:** Same rule as `review`: every notice text is built in `cost/messages.ts`; codes and field
names are English and stable. Text carried by the artifact or the cut plan is copied as received.

## D13. Decision: Performance

**Rationale:** One pass over the actions groups usage by part key (linking resolved once per action);
amounts are per part; apportionment sorts parts once per component. This is O(parts + actions) with
small constants. SC-006 is measured on the `007` reference fixture (500 parts, about 5,000 actions) in
Node.

## Open items (not blocking, resolved during implementation)

- Final CSV column names and the order of sheet rows are fixed in `contracts/cost-reporting-api.md` and
  frozen by a unit test.
- Whether the shared `linking` extraction needs its own `.doc.md` per file (yes, one per file).
