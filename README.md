[![Build Status](https://travis-ci.org/bjnortier/dxf.svg?branch=master)](https://travis-ci.org/bjnortier/dxf)

# DXF-Renewed

DXF parser for node/browser.

Written in **TypeScript** with full type definitions included. Uses modern ES2015+ features and is built with esbuild for optimal performance.

> **Note:** This is a renewed and modernized fork of the original [dxf](https://github.com/skymakerolof/dxf) library, with complete TypeScript migration, enhanced performance, and additional features.

## Version History

**Version 2.0** - Complete rewrite from SAX-style parsing to handle nested references properly (inserts, blocks, etc.)

**Version 3.0** - Adopted [standard JS](https://standardjs.com), ES6 imports, removed Gulp, updated dependencies

**Version 4.x** - Native SVG elements where possible (`<circle />`, `<ellipse />`, etc.)

**Version 5.x (Current)** - Complete TypeScript migration:

- 🎯 Full TypeScript codebase with strict type checking
- ⚡ Built with esbuild (96% faster than Babel - 18ms vs 447ms)
- 📦 Modular type system with 22+ separate type files
- ✅ 100% test coverage maintained (85 tests passing)
- 🎨 Enhanced SVG rendering with TEXT, MTEXT, and DIMENSION support
- 📚 Comprehensive type definitions for all DXF entities

## Supported Entities

All major geometric entities are **parsed and rendered to SVG**:

### Fully Supported

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
- ✅ **INSERT** - Block references with transformations
- ✅ **POINT** - Point entities
- ✅ **SOLID** - Solid-filled triangles and quadrilaterals
- ✅ **3DFACE** - 3D face entities

### Parsed (Not Rendered)

- ⚠️ **HATCH** - Parsed but not rendered to SVG
- ⚠️ **STYLE** - Text styles parsed (colors supported, fonts not applied)
- ⚠️ **ATTDEF/ATTRIB** - Block attributes parsed

## Getting started

TypeScript example with full type safety:

```typescript
import { Helper } from 'dxf'

const helper = new Helper(dxfString)

// The 1-to-1 object representation of the DXF
console.log('parsed:', helper.parsed)

// Denormalised blocks inserted with transforms applied
console.log('denormalised:', helper.denormalised)

// Create an SVG
console.log('svg:', helper.toSVG())

// Create polylines (e.g. to render in WebGL)
console.log('polylines:', helper.toPolylines())
```

JavaScript example:

```javascript
const { Helper } = require('dxf')

const helper = new Helper(dxfString)

// The 1-to-1 object representation of the DXF
console.log('parsed:', helper.parsed)

// Denormalised blocks inserted with transforms applied
console.log('denormalised:', helper.denormalised)

// Create an SVG
console.log('svg:', helper.toSVG())

// Create polylines (e.g. to render in WebGL)
console.log('polylines:', helper.toPolylines())
```

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
npm run compile
open examples/dxf.html
```

## SVG

Geometric elements are fully supported with **native SVG elements** where possible (`<circle />`, `<ellipse/>`, etc.). TEXT, MTEXT, and DIMENSION entities are now fully rendered with proper transformations and formatting.

**SPLINE entities** with degree 2-3 and no weights are converted to native Bézier curves. Other splines are interpolated as polylines.

Here's an example you will find in the functional test output:

![svg example image](https://cloud.githubusercontent.com/assets/57994/17583566/e00f5d78-5fb1-11e6-9030-55686f980e6f.png)

## Interpolation

The library supports outputting DXFs as interpolated polylines for custom rendering (e.g. WebGL) or other applications:

```typescript
const polylines = helper.toPolylines()
```

## Command line

There is a command-line utility (courtesy of [@Joge97](https://github.com/Joge97)) for converting DXF files to SVG:

```bash
npm i -g dxf
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
npm test
```

Running the functional tests in a browser:

```bash
npm run test:functional
```

Please open `toSVG.html` when the file listing loads in the browser (or open `http://localhost:8030/toSVG.html#/`).

## TypeScript Support

This library is written in TypeScript and includes full type definitions. All DXF entities, configuration options, and helper methods are fully typed.

Example with type imports:

```typescript
import { Helper, ParsedDXF, Entity, LineEntity, CircleEntity } from 'dxf'

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

Build commands:

```bash
npm run compile        # Compile TypeScript to JavaScript
npm run type-check     # Run TypeScript type checking
npm test              # Run all tests
```

## Credits

This project is a modernized fork of the original [dxf library by skymakerolof](https://github.com/skymakerolof/dxf), which itself was based on the work by bjnortier and many contributors. DXF-Renewed aims to maintain and improve upon this excellent foundation with modern TypeScript, enhanced performance, and new features.

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

- Linkiez <https://github.com/linkiez>

## License

See LICENSE file for details.
