# Nesting Feature Catalogue

Companion detail doc for [`ROADMAP-NESTING.md`](../../ROADMAP-NESTING.md) §6.

Tags: `[L]` laser-specific, `[P]` plasma-specific, `[*]` both.

## Geometry and preparation

- Closed-contour extraction and open-contour detection.
- Auto-close within configurable gap tolerance.
- Outer/hole/island classification through containment depth and even-odd parity.
- Self-intersection repair, duplicate-vertex removal and collinear simplification.
- Arc/spline flattening by sagitta tolerance.
- Kerf compensation: outer offset outward, hole offset inward.
- Part quantity, priority, layer grouping and minimum-feature warnings.
- Grain-direction lock for materials where orientation matters.

## Nesting and material

- Existing rectangle packers: guillotine, MaxRects and shelf.
- True-shape NFP/Minkowski packing with convex-hull acceleration.
- Discrete, stepped and continuous rotation.
- Multi-sheet packing, sheet priority and deterministic seed.
- Caller-supplied remnant/offcut sets and scrap threshold; no internal inventory store.
- Part-in-part nesting and skeleton/slug management.
- Common-line cutting `[L]` with geometry validation.
- Yield versus cut-time objective weights.
- Optional multi-head/dual-gantry offsets `[P][VERIFY]`.

## Cut path

- Pierce-point selection away from edges and corners.
- Inner-before-outer ordering.
- Line, arc and ramp lead-ins; configurable lead-outs.
- Kerf compensation direction and overcut.
- Pierce delay/height and ramp-in/ramp-down `[P]`.
- Tabs/micro-joints and skeleton retention.
- Corner slowdown, cut direction and multi-pass rules.
- Common-line sequencing `[L]`.
- Rapid collision/bounds validation.
- Nested versus sequential cutting modes.

## Post-processing

- Registry-based plugin architecture.
- Generic laser and plasma emitters.
- Vendor templates: Hypertherm, Burny, Farley and future dialects `[VERIFY]`.
- Units, absolute/relative distance, modal G-code and arc output.
- Laser power/frequency, plasma amperage, THC and gas codes.
- Program numbering, comments, line numbers, subprograms and user hooks.
- Header/footer templates, dry-run and safety validator.

## Viewer and production

- three.js top-down 2D and extruded 3D view.
- Animated torch/laser head, cut trail, pierce/lead/tab markers.
- Part picking, measurement, colour by layer/part/status and SVG fallback.
- Material, cut-length, pierce, rapid, consumables, labour and scrap costing.
- Serializable per-part, per-sheet and per-job artifacts; CSV/JSON ERP export.
- Automatic job grouping by material and machine, with a deterministic input hash and resolved
	technology snapshot in every artifact.

## Commercial-suite parity targets

The initial parity target is the workflow shape common to SigmaNest, Lantek Expert,
ProNest/Hypertherm and FastCAM: import, repair, material assignment, nesting, cut
sequencing, technology parameters, machine-specific NC output, simulation and job artifact.
Machine-specific codes and technology numbers are never copied as assumptions; they are
calibrated from the machine manual and supplied by the caller as editable technology profiles.

The [SigmaNEST product page](https://www.sigmanest.com/en/sigmanest) independently confirms
the required CAD import, automatic material/machine task grouping, material and motion
optimization, NC posting and productivity reporting workflow.
