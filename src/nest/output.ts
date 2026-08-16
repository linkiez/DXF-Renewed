// output.ts — Generates SVG output from nesting results

import type { NestPart, NestPlacement, NestOptions } from './types'

/**
 * Generate an SVG visualization of nesting results.
 */
export function generateNestSVG(
  placements: NestPlacement[],
  unplaced: NestPart[],
  binSize: { width: number; height: number },
  title = 'DXF Nest Result'
): string {
  const svgParts: string[] = []

  // SVG header
  svgParts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${binSize.width + 40} ${binSize.height + 60}" width="${binSize.width + 40}" height="${binSize.height + 60}">`)
  svgParts.push(`<title>${escapeXml(title)}</title>`)

  // Background
  svgParts.push(`<rect x="0" y="0" width="${binSize.width + 40}" height="${binSize.height + 60}" fill="#1a1a2e"/>`)

  // Title
  svgParts.push(`<text x="${(binSize.width + 40) / 2}" y="20" text-anchor="middle" fill="#e0e0e0" font-size="14" font-family="sans-serif">${escapeXml(title)}</text>`)

  // Bin outline
  svgParts.push(`<rect x="20" y="30" width="${binSize.width}" height="${binSize.height}" fill="none" stroke="#4fc3f7" stroke-width="2" stroke-dasharray="5,5"/>`)

  // Grid
  const gridSize = 100
  for (let x = 20; x <= 20 + binSize.width; x += gridSize) {
    svgParts.push(`<line x1="${x}" y1="30" x2="${x}" y2="${30 + binSize.height}" stroke="#333" stroke-width="0.5"/>`)
  }
  for (let y = 30; y <= 30 + binSize.height; y += gridSize) {
    svgParts.push(`<line x1="20" y1="${y}" x2="${20 + binSize.width}" y2="${y}" stroke="#333" stroke-width="0.5"/>`)
  }

  // Placed parts
  for (const placement of placements) {
    const color = placement.color
      ? `rgb(${placement.color[0]},${placement.color[1]},${placement.color[2]})`
      : '#ff9800'

    const points = placement.placedVertices
      .map((v) => `${v[0] + 20},${v[1] + 30}`)
      .join(' ')

    svgParts.push(`<polygon points="${points}" fill="${color}" fill-opacity="0.3" stroke="${color}" stroke-width="1"/>`)

    // Part label
    if (placement.placedVertices.length > 0) {
      const cx = placement.placedVertices.reduce((s, v) => s + v[0], 0) / placement.placedVertices.length
      const cy = placement.placedVertices.reduce((s, v) => s + v[1], 0) / placement.placedVertices.length
      svgParts.push(`<text x="${cx + 20}" y="${cy + 30}" text-anchor="middle" fill="#fff" font-size="8" font-family="sans-serif" opacity="0.7">${escapeXml(placement.partId)}</text>`)
    }
  }

  // Unplaced parts indicator
  if (unplaced.length > 0) {
    svgParts.push(`<text x="${(binSize.width + 40) / 2}" y="${binSize.height + 50}" text-anchor="middle" fill="#f44336" font-size="12" font-family="sans-serif">⚠ ${unplaced.length} parts could not be placed</text>`)
  }

  // Footer
  svgParts.push(`<text x="${(binSize.width + 40) / 2}" y="${binSize.height + 55}" text-anchor="middle" fill="#888" font-size="10" font-family="sans-serif">Bin: ${binSize.width} × ${binSize.height} | Placed: ${placements.length}/${placements.length + unplaced.length}</text>`)

  svgParts.push(`</svg>`)

  return svgParts.join('\n')
}

/**
 * Generate a simple DXF output with placed parts as LWPOLYLINE entities.
 * This is a minimal DXF writer — enough to import into AutoCAD.
 */
export function generateNestDXF(
  placements: NestPlacement[],
  binSize: { width: number; height: number },
  dxfVersion = 'AC1027' // AutoCAD 2013
): string {
  const lines: string[] = []

  const w = (code: number, value: string | number) => {
    lines.push(String(code))
    lines.push(String(value))
  }

  // HEADER section
  w(0, 'SECTION')
  w(2, 'HEADER')
  w(9, '$ACADVER')
  w(1, dxfVersion)
  w(0, 'ENDSEC')

  // TABLES section (minimal)
  w(0, 'SECTION')
  w(2, 'TABLES')

  // LAYER table
  w(0, 'TABLE')
  w(2, 'LAYER')
  w(70, 3) // number of layers

  // Layer 0
  w(0, 'LAYER')
  w(100, 'AcDbSymbolTableRecord')
  w(100, 'AcDbLayerTableRecord')
  w(2, '0')
  w(70, 0)
  w(62, 7)

  // BIN layer
  w(0, 'LAYER')
  w(100, 'AcDbSymbolTableRecord')
  w(100, 'AcDbLayerTableRecord')
  w(2, 'BIN')
  w(70, 0)
  w(62, 9) // blue

  // PARTS layer
  w(0, 'LAYER')
  w(100, 'AcDbSymbolTableRecord')
  w(100, 'AcDbLayerTableRecord')
  w(2, 'PARTS')
  w(70, 0)
  w(62, 1) // red

  w(0, 'ENDTAB')
  w(0, 'ENDSEC')

  // ENTITIES section
  w(0, 'SECTION')
  w(2, 'ENTITIES')

  // Bin rectangle
  w(0, 'LWPOLYLINE')
  w(100, 'AcDbEntity')
  w(8, 'BIN')
  w(100, 'AcDbPolyline')
  w(90, 5) // 5 vertices (closed)
  w(70, 1) // closed
  w(10, 0)
  w(20, 0)
  w(10, binSize.width)
  w(20, 0)
  w(10, binSize.width)
  w(20, binSize.height)
  w(10, 0)
  w(20, binSize.height)
  w(10, 0)
  w(20, 0)

  // Each placed part as LWPOLYLINE
  for (const placement of placements) {
    const vertexCount = placement.placedVertices.length
    const isClosed = vertexCount > 2 && 
      Math.abs(placement.placedVertices[0][0] - placement.placedVertices[vertexCount - 1][0]) < 0.01 &&
      Math.abs(placement.placedVertices[0][1] - placement.placedVertices[vertexCount - 1][1]) < 0.01

    w(0, 'LWPOLYLINE')
    w(100, 'AcDbEntity')
    w(8, 'PARTS')
    w(100, 'AcDbPolyline')
    w(90, isClosed ? vertexCount : vertexCount - 1)
    w(70, isClosed ? 1 : 0)

    const vertsToWrite = isClosed ? placement.placedVertices.slice(0, -1) : placement.placedVertices
    for (const v of vertsToWrite) {
      w(10, v[0])
      w(20, v[1])
    }
  }

  w(0, 'ENDSEC')
  w(0, 'EOF')

  return lines.join('\n')
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
