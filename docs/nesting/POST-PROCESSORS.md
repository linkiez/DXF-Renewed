# Cut Path & Modular Post-Processors (Laser / Plasma)

Companion detail doc for [`ROADMAP-NESTING.md`](../../ROADMAP-NESTING.md) §9–§10.
Documentation language: en_US (project rule).

---

## 1. Cut Action List — the only contract

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
  points: Point2D[]                              // ordered; first = entry
  arc?: { center: Point2D; clockwise: boolean }  // when the segment is an arc
  feed?: number                                  // mm/min
  power?: number                                 // laser S value
  amperage?: number                              // plasma A
  thc?: boolean                                  // plasma torch height control
  dwellMs?: number
  contourId?: string
  partId?: string
}

export interface CutPlan {
  actions: CutAction[]
  stats: {
    cutLength: number
    rapidLength: number
    pierceCount: number
    tabs: number
  }
}
```

Rule: every emitter consumes only `CutPlan` + `PostContext`. No emitter may inspect
`Part`, `Contour` or the nesting result directly — otherwise dialects become coupled to
the algorithm and third-party post-processors become impossible.

---

## 2. `PostProcessor` interface & registry

```ts
export interface PostContext {
  machine: Machine
  material: MaterialPreset
  units: 'mm' | 'inch'
  programNumber: number
  options: Record<string, unknown>
}

export interface PostProcessor {
  id: string
  label: string
  machineKind: 'laser' | 'plasma'
  /** emits the full NC program */
  emit(plan: CutPlan, ctx: PostContext): string
  /** returns issues; empty = valid */
  validate(plan: CutPlan, ctx: PostContext): ValidationIssue[]
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
export function listPostProcessors(): { id: string; label: string; machineKind: string }[]
export function createPostProcessor(id: string): PostProcessor
```

Regression guard: registering two processors with the same `id` throws (fail fast at
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

Arc policy: if `machine.arcSupport === false`, the writer linearises arcs at the
flattening tolerance and logs `logger.info` once per program.

---

## 4. Dialect matrix

| Feature | Generic laser | Generic plasma | Hypertherm | Burny | Farley |
|---|---|---|---|---|---|
| Units word | G21/G20 | G21/G20 | `[VERIFY]` | `[VERIFY]` | `[VERIFY]` |
| Pierce | laser on + dwell | dwell + pierce height | `[VERIFY]` | `[VERIFY]` | `[VERIFY]` |
| Torch on/off | M03/M05 | M03/M05 | `[VERIFY]` | `[VERIFY]` | `[VERIFY]` |
| THC | n/a | M-code + `thc` flag | `[VERIFY]` | `[VERIFY]` | `[VERIFY]` |
| Power/amperage | `S` word | `A`/M-code | `[VERIFY]` | `[VERIFY]` | `[VERIFY]` |
| Gas select | M-code | M-code | `[VERIFY]` | `[VERIFY]` | `[VERIFY]` |
| Arc support | G02/G03 | often linearised | `[VERIFY]` | `[VERIFY]` | `[VERIFY]` |
| Subprograms | M98/M99 | M98/M99 | `[VERIFY]` | `[VERIFY]` | `[VERIFY]` |
| Header/footer | template | template | `[VERIFY]` | `[VERIFY]` | `[VERIFY]` |
| Comment style | `( )` | `( )` | `[VERIFY]` | `[VERIFY]` | `[VERIFY]` |

Every `[VERIFY]` must be replaced by the value read from the machine manual or a known-good
program, then recorded in the table above. Never guess a vendor M-code.

---

## 5. Vendor template pattern

Each vendor dialect is a thin module composed of named sections so users can override
one section without forking the processor:

```ts
export interface DialectTemplate {
  header(ctx: PostContext, stats: CutPlan['stats']): string
  pierce(ctx: PostContext, a: CutAction): string
  torchOn(ctx: PostContext): string
  torchOff(ctx: PostContext): string
  rapid(ctx: PostContext, a: CutAction): string
  cut(ctx: PostContext, a: CutAction): string
  tab(ctx: PostContext, a: CutAction): string
  footer(ctx: PostContext, stats: CutPlan['stats']): string
}
```

`GenericLaser` and `GenericPlasma` implement this fully. Vendor dialects override only the
sections that differ. This is the DRY boundary: shared G-code grammar lives in
`GcodeWriter`, only vocabulary differs per vendor.

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

Validator runs on every emitted program before the file is written. A program with any
`error` is never written to disk without an explicit `--force` flag.

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
