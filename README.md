# DXF-Renewed

[![semantic-release: conventionalcommits](https://img.shields.io/badge/semantic--release-conventionalcommits-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

> **Note:** This is a modernized fork under active development. The core parsing and rendering features are stable, with ongoing work to expand 2D entity coverage. See [ROADMAP.md](./ROADMAP.md) for current progress.

DXF parser for node/browser.

Written in **TypeScript** with full type definitions included. Uses modern ES2015+ features and is built with esbuild for optimal performance.

> **Note:** This is a renewed and modernized fork of the original [dxf](https://github.com/skymakerolof/dxf) library, with complete TypeScript migration, enhanced performance, and additional features.

## TL;DR

- Parse: `parseString(dxfText)` → typed `ParsedDXF`
- Expand blocks: `denormalise(parsed)` → flat `Entity[]` with transforms
- Render/export:
  - `toSVG(parsed)` → SVG string
  - `toPolylines(parsed)` → numeric polyline arrays
  - `toJson(parsed)` → JSON string

## Features

- TypeScript-first public API (strict typing)
- Deterministic parsing + regression coverage via real DXF fixtures
- INSERT/BLOCK expansion (denormalisation) with transform stacking
- SVG rendering for common 2D geometry + annotation entities
- Polyline output for custom renderers (Canvas/WebGL/etc.)
- Framework-agnostic (no React/Webpack required)

## Development Progress

This project follows a phased migration plan to align with AutoCAD 2024 DXF specifications and achieve complete 2D coverage.

**Current Status (as of 2026-01-01):**
- ✅ M0 — Baseline & Regression Harness: **Complete**
- 🔄 M1 — DXF Format & Section-Level Compliance: **Ongoing**
- 🔄 M2 — TABLES Coverage (2D-Relevant): **In Progress**
- 🔄 M3 — OBJECTS Coverage (2D-Relevant): **In Progress**
- 🔄 M4 — ENTITIES: Complete 2D Set: **Ongoing**
- 🔄 M5 — Rendering Parity (toPolylines / toSVG): **Ongoing**

For detailed progress, implementation roadmap, and architecture documentation, see:
- [ROADMAP.md](./ROADMAP.md) - Full migration plan and progress tracking
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture overview

## Documentation

- Project roadmap and progress: [ROADMAP.md](./ROADMAP.md)
- Architecture overview: [ARCHITECTURE.md](./ARCHITECTURE.md)

## Table of Contents

- [Version History](#version-history)
- [Supported Entities](#supported-entities)
- [Getting started](#getting-started)
- [API](#api)
- [Running the Examples](#running-the-examples)
- [Tests](#tests)
- [Build System](#build-system)

## Version History

**Version 2.0** - Complete rewrite from SAX-style parsing to handle nested references properly (inserts, blocks, etc.)

**Version 3.0** - Adopted [standard JS](https://standardjs.com), ES6 imports, removed Gulp, updated dependencies

**Version 4.x** - Native SVG elements where possible (`<circle />`, `<ellipse />`, etc.)

**Version 5.x (Current)** - Complete TypeScript migration:

- 🎯 Full TypeScript codebase with strict type checking
- ⚡ Built with esbuild (96% faster than Babel - 18ms vs 447ms)
- 📦 Modular type system with 22+ separate type files
- ✅ Extensive unit tests and browser integration tests
- 🎨 Enhanced SVG rendering with TEXT, MTEXT, and DIMENSION support
- 📚 Comprehensive type definitions for all DXF entities

## Supported Entities

Many common DXF entities are **parsed and rendered to SVG**. Some entities are parsed but currently skipped during SVG rendering.

### Rendered to SVG

- ✅ **LINE** - Straight line segments
- ✅ **CIRCLE** - Native SVG `<circle />` element
- ✅ **ARC** - Circular arcs with native SVG paths
- ✅ **ELLIPSE** - Native SVG `<ellipse />` element
- ✅ **LWPOLYLINE** - Lightweight polylines with bulges
- ✅ **POLYLINE** - 2D/3D polylines with vertices
- ✅ **SPLINE** - B-spline curves (degree 2-3 as Bézier, others interpolated)
- ✅ **TEXT** - Single-line text with rotation
- ✅ **MTEXT** - Multi-line text with formatting
- ✅ **DIMENSION** - Linear, aligned, radial, diameter, and ordinate dimensions
- ✅ **SOLID** - Solid-filled triangles and quadrilaterals
- ✅ **TRACE** - Rendered as a filled path outline
- ✅ **RAY** - Rendered as polylines (finite fallback)
- ✅ **XLINE** - Rendered as polylines (finite fallback)
- ✅ **WIPEOUT** - Rendered as outline fallback (masking not yet implemented)
- ✅ **LEADER** - Rendered as an SVG path
- ✅ **TOLERANCE** - Rendered with SVG text fallback
- ✅ **SHAPE** - Rendered with SVG text fallback

> **INSERT note:** INSERT is supported via denormalisation. The library expands INSERT entities into their referenced BLOCK contents and then renders the resulting entities with transforms applied.

### Parsed (Not Rendered)

- ⚠️ **POINT** - Parsed but currently not rendered to SVG
- ⚠️ **3DFACE** - Parsed but currently not rendered to SVG
- ⚠️ **HATCH** - Parsed but currently not rendered to SVG
- ⚠️ **ATTDEF/ATTRIB** - Block attributes parsed but not rendered
- ⚠️ **MLEADER** - Parsed but not rendered to SVG
- ⚠️ **OLEFRAME** - Parsed but not rendered to SVG
- ⚠️ **REGION** - Parsed but not rendered to SVG
- ⚠️ **TABLE** - Parsed but not rendered to SVG
- ⚠️ **MLINE** - Parsed but not rendered to SVG

> **Note:** Text styles (STYLE table) are parsed. Colors are supported; fonts are not applied to SVG.

## Getting started

TypeScript example with full type safety:

```typescript
import { Helper } from '@linkiez/dxf-renew'

const helper = new Helper(dxfString)

// The 1-to-1 object representation of the DXF
console.log('parsed:', helper.parsed)

// Denormalised blocks inserted with transforms applied
console.log('denormalised:', helper.denormalised)

// Create an SVG
console.log('svg:', helper.toSVG())

// Create polylines (e.g. to render in WebGL)
console.log('polylines:', helper.toPolylines())

// Create a JSON representation (1-to-1 with the parsed model)
console.log('json:', helper.toJson({ pretty: true }))
```

JavaScript example:

```javascript
const { Helper } = require('@linkiez/dxf-renew')

const helper = new Helper(dxfString)

// The 1-to-1 object representation of the DXF
console.log('parsed:', helper.parsed)

// Denormalised blocks inserted with transforms applied
console.log('denormalised:', helper.denormalised)

// Create an SVG
console.log('svg:', helper.toSVG())

// Create polylines (e.g. to render in WebGL)
console.log('polylines:', helper.toPolylines())

// Create a JSON representation (1-to-1 with the parsed model)
console.log('json:', helper.toJson({ pretty: true }))
```

## API

The public API is exported from `src/index.ts`.

- `parseString(dxfText: string): ParsedDXF`
  - Parse DXF text into a typed model.
- `denormalise(parsed: ParsedDXF): Entity[]`
  - Expand `INSERT` entities into their referenced `BLOCK` contents.
- `toSVG(parsed: ParsedDXF, options?): string`
  - Render the drawing to an SVG string.
- `toPolylines(parsed: ParsedDXF, options?): any[]`
  - Convert supported entities to polyline arrays.
- `toJson(parsed: ParsedDXF, options?): string`
  - Serialize the parsed model as JSON.
- `Helper`
  - Convenience wrapper that exposes `parsed`, `denormalised`, plus `toSVG()`, `toPolylines()`, and `toJson()`.

## Running the Examples

There are examples in the `examples/` directory.

Node ES6 (TypeScript). Will write an SVG to `examples/example.es6.svg`:

```bash
npx tsx examples/example.es6.js
```

Node ES5. Will write an SVG to `examples/example.es5.svg`:

```bash
node examples/example.es5.js
```

Browser. Compile to a browser bundle and open the example webpage:

```bash
yarn compile
open examples/dxf.html
```

## Package Manager

This project uses **Yarn 4** (Berry) as the package manager. Make sure you have Yarn installed:

```bash
# Install via npm
npm install -g yarn

# Or via corepack (recommended)
corepack enable
```

All npm commands in the documentation can be replaced with yarn equivalents:

- `npm install` → `yarn install` or just `yarn`
- `npm test` → `yarn test`
- `npm run compile` → `yarn compile`

## SVG

Geometric elements are fully supported with **native SVG elements** where possible (`<circle />`, `<ellipse/>`, etc.). TEXT, MTEXT, and DIMENSION entities are now fully rendered with proper transformations and formatting.

**SPLINE entities** with degree 2-3 and no weights are converted to native Bézier curves. Other splines are interpolated as polylines.

Here's an example you will find in the functional test output:

![svg example image](https://cloud.githubusercontent.com/assets/57994/17583566/e00f5d78-5fb1-11e6-9030-55686f980e6f.png)

### DIMENSION auto-scaling

DIMENSION rendering supports viewport-based auto-scaling so that arrows and text remain readable across different coordinate scales.

```ts
import { Helper } from '@linkiez/dxf-renew'

const helper = new Helper(dxfString)

const svg = helper.toSVG({
  dimension: {
    autoScale: true,
    // Reference used when percentages are not provided.
    autoScaleViewportReference: 40,
    // Optional per-element overrides as a percentage (0..100)
    // of min(viewBoxWidth, viewBoxHeight).
    autoScaleViewportPercentages: {
      arrowSize: 1.5,
      textHeight: 1
    }
  }
})
```

When `autoScaleViewportPercentages` is provided (and `autoScale` is enabled), the final size for each configured element is computed as:

`size = min(viewBoxWidth, viewBoxHeight) * (percent / 100)`

## Interpolation

The library supports outputting DXFs as interpolated polylines for custom rendering (e.g. WebGL) or other applications:

```typescript
const polylines = helper.toPolylines()
```

## Command line

There is a command-line utility (courtesy of [@Joge97](https://github.com/Joge97)) for converting DXF files to SVG:

```bash
yarn global add @linkiez/dxf-renew
# or
npm i -g @linkiez/dxf-renew

dxf-to-svg --help
```

Usage:

```text
Usage: dxf-to-svg [options] <dxfFile> [svgFile]

Converts a dxf file to a svg file.

Options:
  -V, --version  output the version number
  -v --verbose   Verbose output
  -h, --help     output usage information
```

## Tests

Running the unit tests:

```bash
yarn test
```

Running the browser integration tests (Playwright):

```bash
yarn test:integration:browser
```

These tests render fixtures in a real browser and write deterministic PNG screenshots under `test/rendered/` (overwritten on each run).

Running the functional tests in a browser:

```bash
yarn test:functional
```

This starts a Vite dev server and opens `http://localhost:8030/toSVG.html`.

## Development Guidelines

Project documentation index: `ROADMAP.md` (see “Documentation (Consolidated)”).

## TypeScript Support

This library is written in TypeScript and includes full type definitions. All DXF entities, configuration options, and helper methods are fully typed.

Example with type imports:

```typescript
import { Helper, ParsedDXF, Entity, LineEntity, CircleEntity } from '@linkiez/dxf-renew'

const helper = new Helper(dxfString)
const parsed: ParsedDXF = helper.parsed
const entities: Entity[] = helper.denormalised

// Type narrowing
entities.forEach((entity) => {
  if (entity.type === 'LINE') {
    const line = entity as LineEntity
    console.log(`Line from (${line.start.x}, ${line.start.y}) to (${line.end.x}, ${line.end.y})`)
  }
})
```

## Build System

The project uses **esbuild** for compilation, which is significantly faster than Babel:

- Build time: ~18-22ms (vs 447ms with Babel)
- 96% performance improvement
- Full TypeScript support with type checking via `tsc`
- **Yarn 4** (Berry) as package manager

Build commands:

```bash
yarn compile        # Compile TypeScript to JavaScript
yarn type-check     # Run TypeScript type checking
yarn test           # Run all tests
```

## Credits

This project is a modernized fork of the original [dxf library by skymakerolof](https://github.com/skymakerolof/dxf), which itself was based on the work by bjnortier and many contributors. DXF-Renewed aims to maintain and improve upon this excellent foundation with modern TypeScript, enhanced performance, and new features.

## Releases

This project uses [semantic-release](https://semantic-release.gitbook.io/) for automated version management and package publishing.

**Releases are automatically created** when commits following [Conventional Commits](https://www.conventionalcommits.org/en/) are pushed to:

- `main` - Stable production releases (`1.0.0`, `1.1.0`, `2.0.0`)

### Commit Format

```bash
# New feature → MINOR version (1.0.0 → 1.1.0)
feat(dimension): add DIMSTYLE color support

# Bug fix → PATCH version (1.0.0 → 1.0.1)
fix(parser): correct POLYLINE parsing

# Breaking change → MAJOR version (1.0.0 → 2.0.0)
feat!: migrate to pure ESM

BREAKING CHANGE: CommonJS is no longer supported
```

### Contributing

To contribute:

1. Fork the repository
2. Make commits using `yarn commit` (interactive) or following Conventional Commits
3. Push to your fork
4. Open a Pull Request to `main`

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## Contributors

### Original dxf Library Contributors

- Liam Mitchell <https://github.com/LiamKarlMitchell>
- Artur Zochniak <https://github.com/arjamizo>
- Andy Werner <https://github.com/Gallore>
- Ivan Baktsheev <https://github.com/apla>
- Jeff Chen <https://github.com/jeffontheground>
- Markko Paas <https://github.com/markkopaas>
- Kim Lokøy <https://github.com/klokoy>
- Erik Söhnel <https://github.com/hoeck>
- Teja <https://github.com/hungerpirat>
- Jakob Pallhuber <https://github.com/Joge97>
- Eric Mansfield <https://github.com/ericman314>
- Kristofer <https://github.com/kriffe>

### DXF-Renewed Maintainers

- LiNkIeZ <https://github.com/linkiez>

## License

See LICENSE file for details.
