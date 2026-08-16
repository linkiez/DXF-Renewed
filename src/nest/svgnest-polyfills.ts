// svgnest-polyfills.ts — Injeta polyfills de browser antes de carregar os IIFEs
// Este arquivo DEVE ser importado antes de qualquer outro do SVGnest

if (typeof (globalThis as any).navigator === 'undefined') {
  (globalThis as any).navigator = {
    userAgent: 'Node.js',
    appName: 'Node',
  }
}

if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = globalThis
}

if (typeof (globalThis as any).self === 'undefined') {
  (globalThis as any).self = globalThis
}

if (typeof (globalThis as any).document === 'undefined') {
  (globalThis as any).document = {
    createElement: () => null,
    createElementNS: () => null,
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
  }
}

export {}
