# Cut Path & Modular Post-Processors (Laser / Plasma)

Companion detail doc for [`ROADMAP-NESTING.md`](../../ROADMAP-NESTING.md) §9–§10.
Documentation language: en_US (project rule).

---

## 1. Cut Action List — the only contract

The modular post-processing API is implemented under `src/nesting/post/` and is exported from the
nesting barrel. It consumes the existing immutable `CutPlan` and returns `MachineProgram` metadata
including `processorName`, `processorId`, `processorRevision`, and `profileRevision`.

Release is blocked by every error, including unsupported capabilities, invalid feeds, missing curve
tolerances, and canonical expected-output mismatches. The registry resolves an exact
`(processorId, processorRevision)` pair and never falls back.

The nesting engine never knows the machine. The post-processor never knows the algorithm.
They meet at the Cut Action List: a machine-independent, tool-independent trace.

```ts
export type CutActionKind =
  | 'rapid'      // traverse, torch off
  | 'pierce'     // pierce/dwell at current point
  | 'lead-in'    // travel to contour start, torch on
  | 'cut'        // cut polyline/arc segment
  | 'lead-out'   // exit contour
  | 'overcut'    // travel past closure
  | 'tab'        // torch off/on (micro-joint)
  | 'end'        // program end

export interface CutAction {
  kind: CutActionKind
  points: readonly Point2D[]                    // ordered; first = entry
  curve?: { type: 'arc'; center: Point2D; clockwise: boolean } |
    { type: 'bezier'; controlPoints: readonly Point2D[] } // explicit curve geometry
  contourId?: string
  partId?: string
  metadata?: Readonly<Record<string, string | number | boolean>>
}

export interface CutPlan {
  actions: CutAction[]
  stats: {
    cutLength: number
    rapidLength: number
    pierceCount: number
    tabCount: number
  }

}
```

Example profile (reviewed output is passed explicitly; fixture loading is a host concern):

```ts
generateMachineProgram(plan, {
  machineId: 'laser-01',
  machineKind: 'laser',
  processorId: 'generic-laser',
  processorRevision: '1',
  profileRevision: '2026-09',
  units: 'mm',
  sheet: { width: 3000, height: 2000, margin: 10 },
  maxFeed: 5000,
  arcSupport: false,
  curveLinearizationTolerance: 0.01,
  capabilities: { cutting: true },
  feed: 1000,
  power: 100,
  pierceDwellMs: 0,
  expectedOutput: reviewedGcode,
})
```

Rule: every emitter consumes only `CutPlan` + `PostContext`. No emitter may inspect
`Part`, `Contour` or the nesting result directly — otherwise dialects become coupled to
the algorithm and third-party post-processors become impossible.

---

## 2. `PostProcessor` interface & registry

```ts
export interface PostProcessingContext {
  profile: MachineProfile
  linearizedPlan: CutPlan
}

export interface PostProcessor {
  id: string
  name: string
  revision: string
  machineKind: 'laser' | 'plasma'
  emit(plan: CutPlan, ctx: PostProcessingContext): string
  validate(plan: CutPlan, ctx: PostProcessingContext): readonly ValidationIssue[]
}

export interface ValidationIssue {
  severity: 'error' | 'warning'
  code: string
  message: string
  actionIndex?: number
}
```

Registry (open/closed — new dialect needs no core edit):

```ts
export function registerPostProcessor(p: PostProcessor): void
export function listPostProcessors(): readonly PostProcessorSummary[]
export function resolvePostProcessor(id: string, revision: string): PostProcessor | undefined
```

Regression guard: registering two processors with the same `(id, revision)` throws (fail fast at
startup, not at emit time).

---

## 3. G-code writer (`post/gcode/writer.ts`)

Tokenized builder — never string-concatenate G-code ad hoc across emitters.

```ts
export class GcodeWriter {
  beginLine(n?: number): this
  word(letter: string, value: number | string): this
  comment(text: string, style: '(' | ';'): this
  endLine(): this
  toString(): string
}
```

Dialect knobs (per processor, not global):

| Knob | Options |
|---|---|
| units | `G20` (inch) / `G21` (mm) |
| distance | `G90` (absolute) / `G91` (incremental) |
| plane | `G17` |
| rapids | `G00` |
| feed move | `G01` with `F` |
| arc CW / CCW | `G02` / `G03` with `I`,`J` (center-relative) — or linearise |
| cutter comp | `G40` off / `G41` left / `G42` right |
| program start/end | `M02`/`M30`, `%`, `O####` |
| plasma on/off | `M03`/`M05` (or vendor M-code) |
| laser on/off | `M03`/`M05` + `S` power word |
| comment style | `( ... )` or `; ...` |
| line numbers | `N` prefix, configurable step |

Arc policy: if `machine.arcSupport === false`, the writer deterministically
linearises valid arcs and Bezier curves at the approved profile tolerance. Missing,
non-finite, or malformed curve data is rejected explicitly.

---

## 4. Dialect matrix

| Feature | Generic laser | Generic plasma | Hypertherm EDGE Connect 809550-rev6 |
|---|---|---|---|
| Units word | G21/G20 | G21/G20 | G21 |
| Pierce | M03 + G04 | M03 + G04 | M15 |
| Torch on/off | M03/M05 | M03/M05 | M15/M16 |
| THC | capability validation | capability validation | unsupported in this subset |
| Power/amperage | S / process settings | `S` amperage word from approved process settings | not inferred |
| Gas select | not inferred | not inferred | not inferred |
| Arc support | G02/G03 or approved linearization | approved linearization | rejected unless represented as G01 |
| Header/footer | deterministic template | deterministic template | line-numbered deterministic template |
| Comment style | `( )` | `( )` | `( )`, preceded by M00 |

The EDGE Connect mapping is intentionally limited to directly supported EIA RS-274D behavior in
[`Hypertherm EDGE PRO Programmer reference.md`](../Hypertherm%20EDGE%20PRO%20Programmer%20reference.md).
ESSI, XPR, G59, bevel, program-number (`Pxx`), and other undocumented commands are not inferred.

No unverified vendor values are used in the implemented matrix.

---

## 5. Processor composition

Built-in processors implement the exported `PostProcessor` contract directly. Shared G-code
tokenization belongs to `GcodeWriter`; processor-specific validation and emission remain in each
processor module. New dialects are registered as complete processors rather than extending an
unimplemented template contract.

---

## 6. Cut-path planning detail

### 6.1 Sequence

1. Group actions by sheet.
2. Sort by containment depth descending (inner before outer) — **mandatory**; violating it
   drops the part into the skeleton.
3. Nearest-neighbour chain on entry points.
4. 2-opt improvement bounded by `timeBudget`.

```ts
export interface SequenceOptions {
  strategy: 'nearest' | 'nearest-2opt' | 'in-file-order'
  timeBudget: number      // ms
  groupByLayer: boolean
}
```

### 6.2 Pierce point

Order of rules:

1. Inside the part, `≥ minDistanceFromContour` from every edge.
2. Prefer a convex bulge with room for the lead-in.
3. Hole smaller than `outsideHoleThreshold` → pierce outside, on scrap.
4. Never on a corner; never over another part's material.

### 6.3 Leads

```ts
export interface LeadSpec {
  type: 'none' | 'line' | 'arc' | 'ramp'
  length: number
  angle: number
  radius?: number
  rampAngle?: number
  position: 'auto' | 'start' | 'midpoint'
}
```

Validation before emit: lead-in must not cross its own contour, any tab, or any other
part's kept material. A lead that crosses geometry is an automatic `error` issue.

### 6.4 Tabs / micro-joints

```ts
export interface TabSpec {
  count: number
  width: number
  liftMm?: number
  placement: 'even' | 'corners-preferred'
}
```

Emits torch-off, small rapid, torch-on across the tab span. Tab width must stay smaller
than the smallest contour segment it sits on.

### 6.5 Common-line

Detect coincident edges within `commonLineTol` between neighbour parts, emit once. Guard
with SAT + area re-check before committing; opt-in flag. On success it is the single
largest cut-time saving available for laser.

---

## 7. Validation rules (`post/validate.ts`)

| Code | Severity | Condition |
|---|---|---|
| `OUT_OF_BOUNDS` | error | point outside sheet minus margin |
| `FEED_INVALID` | error | feed ≤ 0 or > machine.maxFeed |
| `MISSING_PIERCE` | error | `cut` action without preceding `pierce` on a new contour |
| `RAPID_OVER_PART` | warning | rapid passes over kept material |
| `LEAD_CROSSES_GEOMETRY` | error | lead intersects a contour or tab |
| `TAB_TOO_WIDE` | error | tab width > host segment length |
| `THC_ON_RAPID` | error | THC enabled during `rapid` |
| `ARC_UNSUPPORTED` | warning | arc emitted for a machine that linearises |

Validator runs on every emitted program before it is returned. A program with any `error`, or
without a matching reviewed expected output, is never releasable. There is no force-release
override.

---

## 8. Golden-file testing

Post-processors are tested by diffing emitted output against a checked-in golden file:

```
test/resources/gcode/<processorId>/<fixture>.nc      # expected
test/unit/nesting/post/<processorId>.test.ts         # compares emit(plan) === golden
```

One fixture per: laser simple part, laser with holes + tabs, plasma simple, plasma with
THC + pierce dwell, vendor dialect, sub-program reuse. Any diff fails the build; updating
a golden requires a reviewed commit explaining the dialect change.
