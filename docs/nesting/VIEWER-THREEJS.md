# three.js Viewer & Simulation

Companion detail doc for [`ROADMAP-NESTING.md`](../../ROADMAP-NESTING.md) §12.

## Goal

Render the nested sheet, animate the cut path, and validate the emitted program before it
reaches the machine. The viewer consumes `NestingResult` + `CutPlan`; it never recomputes
geometry.

## Stack

| Concern | Choice |
|---|---|
| Renderer | `three` with WebGL2 |
| Controls | `OrbitControls` from `three/examples` |
| 2D mode | `OrthographicCamera`, top-down |
| 3D mode | `PerspectiveCamera` with sheet extrusion |
| Loading | dynamic `import('three')` |
| Fallback | existing `toNestedSvg` when WebGL2 is unavailable |

`three` is the only viewer dependency and is lazy-loaded so core library consumers pay no
viewer bundle cost.

## Scene graph

```text
scene
├── sheetGroup: plate + optional grid
├── partsGroup: static part meshes
├── cutPathGroup: cut lines, dashed rapids, markers, animated head
└── lights: ambient + directional
```

Merge static parts into `BufferGeometry`. Use `InstancedMesh` for pierce, lead and tab
markers. Only the head and growing cut trail update per frame.

## Coordinate mapping

DXF/nesting uses XY with Y-up. Centralise the axis convention in
`viewer/transform.ts`; never scatter flips across modules.

```ts
export const toScene = (point: Point2D, sheet: StockSheet) => new Vector3(
  point.x - sheet.width / 2,
  point.y - sheet.height / 2,
  0,
)
```

Extrusion thickness is visual only and must never drive machine behaviour.

## Animation

```ts
export interface ViewerOptions {
  mode: '2d' | '3d'
  animate: boolean
  speed: number
  showRapids: boolean
  showMarkers: boolean
  colourBy: 'action' | 'part' | 'layer' | 'status'
}
```

1. Flatten `CutPlan.actions` into `(point, kind, feed)` segments.
2. Advance by `speed * dt * feed`.
3. Move the head marker to the interpolated point.
4. Append torch-on segments to the cut trail.
5. Colour cut, rapid, lead and tab segments distinctly.

Controls: play, pause, reset, step-to-next-pierce and scrub. Scrubbing is required for
inspecting a lead that crosses geometry.

## Markers and picking

| Marker | Meaning |
|---|---|
| disc/cross | pierce point |
| arrow | lead-in or lead-out direction |
| bracket | tab/micro-joint |
| dashed line | torch-off rapid |

Use `Raycaster` for selection. Clicking a part shows id, layer, area, perimeter, rotation
and placement. Hovering a cut action shows feed, power/amperage and dwell. Emit `select` and
`hover` events so host applications can provide their own panels.

## Performance budget

| Scenario | Target |
|---|---|
| First render, 500 parts | < 100 ms |
| Sustained frame rate | >= 50 fps |
| Marker draw calls | <= 2 |
| Animation update | O(1) per frame |

Use preallocated buffers and no per-frame object allocation. Disable frustum culling for
the sheet only.

## Progressive enhancement

```ts
export async function mountViewer(el: HTMLElement, input: ViewerInput) {
  if (!supportsWebGL2()) return mountSvgFallback(el, input)
  const THREE = await import('three')
  return createViewer(el, input, { THREE })
}
```

The SVG fallback is the existing `toNestedSvg`; no duplicate renderer is needed.

## Accessibility

Expose a text summary beside the canvas: yield, sheets, part count and total cut length.
Support arrows for pan, `+`/`-` for zoom, space for play/pause, and
`prefers-reduced-motion` by defaulting animation off.

## Testing

- Playwright: scene mounts without WebGL errors and animation advances.
- Unit: trip cursor interpolation and marker count.
- Unit: SVG fallback when WebGL2 is unavailable.
- Browser screenshot: desktop and mobile viewports; verify nonblank canvas and no overlap.
