import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

export function fixture(name: string): string {
  return readFileSync(resolve(here, '../../resources', name), 'utf8')
}

export function ring(cx: number, cy: number, r: number, n = 16): [number, number][] {
  const points: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2
    points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r])
  }
  points.push([points[0][0], points[0][1]])
  return points
}

export function rect(x: number, y: number, w: number, h: number): [number, number][] {
  return [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
    [x, y],
  ]
}

export function deepEqual(actual: unknown, expected: unknown, message?: string): void {
  assert.deepStrictEqual(actual, expected, message)
}
