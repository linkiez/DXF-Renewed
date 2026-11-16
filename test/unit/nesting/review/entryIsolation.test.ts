import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { expect } from 'expect'

const SRC = join(process.cwd(), 'src')
const THREE_DIR = ['nesting', 'review', 'three'].join(sep)
const THREE_IMPORT = /from\s+['"]three['"]|import\(\s*['"]three['"]\s*\)|require\(\s*['"]three['"]\s*\)/

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) return sourceFiles(full)
    return /\.(ts|js|cjs|mjs)$/.test(name) ? [full] : []
  })

describe('review/entry isolation — three stays out of the main graph', () => {
  it('no source file outside review/three imports three', () => {
    const offenders = sourceFiles(SRC)
      .filter((file) => !relative(SRC, file).startsWith(THREE_DIR))
      .filter((file) => THREE_IMPORT.test(readFileSync(file, 'utf8')))
      .map((file) => relative(SRC, file))

    expect(offenders).toEqual([])
  })

  it('the review barrel does not re-export the three subpath', () => {
    const barrel = readFileSync(join(SRC, 'nesting', 'review', 'index.ts'), 'utf8')

    expect(barrel).not.toMatch(/['"]\.\/three(\/|['"])/)
  })

  it('the browser bundle, when built, does not import three', () => {
    const bundle = join(process.cwd(), 'dist', 'dxf.js')
    if (!existsSync(bundle)) return

    expect(readFileSync(bundle, 'utf8')).not.toMatch(/require\(\s*['"]three['"]\s*\)|from\s*['"]three['"]|import\(\s*['"]three['"]\s*\)/)
  })

  it('the review/three subpath targets exist once the library is built', () => {
    const manifest = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      exports: Record<string, { types?: string; import?: string }>
    }
    const target = manifest.exports['./review/three']

    expect(target.import).toBe('./lib/nesting/review/three/index.js')
    expect(target.types).toBe('./lib/nesting/review/three/index.d.ts')
    if (!existsSync(join(process.cwd(), 'lib'))) return
    expect(existsSync(join(process.cwd(), target.import as string))).toBe(true)
    expect(existsSync(join(process.cwd(), target.types as string))).toBe(true)
  })
})
