// svgnest-loader.ts — Carrega os módulos do SVGnest incorporados
//
// Arquivos (código fonte incorporado, SEM dependência externa):
//   clipper-core.cjs       — ClipperLib 6.1.3a (Boost License)
//   geometryutil-core.js   — GeometryUtil (MIT)
//   svgparser-core.js      — SvgParser (MIT)
//   svgnest-core.js        — SvgNest (MIT)

import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

let _clipperLib: any = null
let _geometryUtil: any = null
let _svgNest: any = null

// ─── Polyfills ──────────────────────────────────────────────────────────

function injectPolyfills(): void {
  if ((globalThis as any).navigator === undefined) {
    try {
      ;(globalThis as any).navigator = { userAgent: 'Node.js', appName: 'Node' }
    } catch {
      Object.defineProperty(globalThis, 'navigator', {
        value: { userAgent: 'Node.js', appName: 'Node' },
        writable: false,
        configurable: true,
      })
    }
  }

  if ((globalThis as any).window === undefined) {
    try {
      ;(globalThis as any).window = globalThis
    } catch {
      Object.defineProperty(globalThis, 'window', {
        value: globalThis,
        writable: false,
        configurable: true,
      })
    }
  }

  if ((globalThis as any).self === undefined) {
    try {
      ;(globalThis as any).self = globalThis
    } catch {
      Object.defineProperty(globalThis, 'self', {
        value: globalThis,
        writable: false,
        configurable: true,
      })
    }
  }

  if ((globalThis as any).document === undefined) {
    ;(globalThis as any).document = {
      createElement: () => null,
      createElementNS: () => null,
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
    }
  }

  // DOMParser polyfill — precisa retornar estrutura compatível com svgparser-core.js
  // O svgparser-core.js faz:
  //   for(var i=0; i<svg.childNodes.length; i++) { if(child.tagName == 'svg') ... }
  //   depois itera sobre svgRoot.childNodes procurando paths
  if ((globalThis as any).DOMParser === undefined) {
    ;(globalThis as any).DOMParser = class {
      parseFromString(str: string, _mimeType: string) {
        // Extrai paths do SVG
        const paths: any[] = []
        const pathRegex = /<path([^>]*)>/g
        let pm
        while ((pm = pathRegex.exec(str)) !== null) {
          const attrs: Record<string, string> = {}
          const attrRegex = /([A-Za-z_][A-Za-z0-9_-]*)="([^"]*)"/g // NOSONAR: SVG quoted attributes require a bounded tag-local scan.
          let am
          while ((am = attrRegex.exec(pm[1])) !== null) {
            attrs[am[1]] = am[2]
          }
          paths.push({
            tagName: 'path',
            attributes: attrs,
            getAttribute: (name: string) => attrs[name] ?? null,
            setAttribute: (name: string, val: string) => {
              attrs[name] = val
            },
            parentNode: null,
            childNodes: [],
          })
        }

        // Extrai rects do SVG
        const rects: any[] = []
        const rectRegex = /<rect([^>]*)>/g
        let rm
        while ((rm = rectRegex.exec(str)) !== null) {
          const attrs: Record<string, string> = {}
          const attrRegex = /([A-Za-z_][A-Za-z0-9_-]*)="([^"]*)"/g // NOSONAR: SVG quoted attributes require a bounded tag-local scan.
          let am
          while ((am = attrRegex.exec(rm[1])) !== null) {
            attrs[am[1]] = am[2]
          }
          rects.push({
            tagName: 'rect',
            attributes: attrs,
            getAttribute: (name: string) => attrs[name] ?? null,
            setAttribute: (name: string, val: string) => {
              attrs[name] = val
            },
            parentNode: null,
            childNodes: [],
          })
        }

        const svgRoot: any = {
          tagName: 'svg',
          childNodes: [...paths, ...rects],
          getAttribute: () => null,
          setAttribute: () => {},
          removeChild: () => {},
          appendChild: () => {},
          insertBefore: () => {},
          namespaceURI: 'http://www.w3.org/2000/svg',
        }

        return {
          childNodes: [svgRoot],
        }
      }
    }
  }
}

// ─── Carregadores ───────────────────────────────────────────────────────

async function loadClipper(): Promise<any> {
  if (_clipperLib) return _clipperLib
  injectPolyfills()

  // UMD file: keeps its module.exports branch, so load through require
  _clipperLib = require(path.join(__dirname, 'clipper-core.cjs'))

  if (!_clipperLib?.Clipper) {
    throw new Error('[svgnest-loader] ClipperLib não carregou')
  }

  ;(globalThis as any).ClipperLib = _clipperLib
  return _clipperLib
}

async function loadGeometryUtil(): Promise<any> {
  if (_geometryUtil) return _geometryUtil
  await loadClipper()

  // Global-only IIFE: import for side effects, then read the global it sets
  await import(pathToFileURL(path.join(__dirname, 'geometryutil-core.js')).href)
  _geometryUtil = (globalThis as any).GeometryUtil

  if (!_geometryUtil) {
    throw new Error('[svgnest-loader] GeometryUtil não carregou')
  }
  return _geometryUtil
}

async function loadSvgNest(): Promise<any> {
  if (_svgNest) return _svgNest
  await loadClipper()
  await loadGeometryUtil()

  await import(pathToFileURL(path.join(__dirname, 'matrix-core.js')).href)
  await import(pathToFileURL(path.join(__dirname, 'svgparser-core.js')).href)
  await import(pathToFileURL(path.join(__dirname, 'svgnest-core.js')).href)
  await import(pathToFileURL(path.join(__dirname, 'placementworker-core.js')).href)
  _svgNest = (globalThis as any).SvgNest

  if (!_svgNest) {
    throw new Error('[svgnest-loader] SvgNest não carregou')
  }
  return _svgNest
}

// ─── API pública ────────────────────────────────────────────────────────

export async function initSvgNest(): Promise<{
  ClipperLib: any
  GeometryUtil: any
  SvgNest: any
}> {
  const [ClipperLib, GeometryUtil, SvgNest] = await Promise.all([
    loadClipper(),
    loadGeometryUtil(),
    loadSvgNest(),
  ])

  console.log(
    '[svgnest-loader] ✅ SVGnest carregado (ClipperLib + GeometryUtil + SvgNest)',
  )
  return { ClipperLib, GeometryUtil, SvgNest }
}

export { loadClipper, loadGeometryUtil, loadSvgNest }
export default initSvgNest
