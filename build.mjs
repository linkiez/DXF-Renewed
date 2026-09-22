// esbuild configuration for building the project
import * as esbuild from 'esbuild'
import { execFile } from 'node:child_process'
import { copyFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

async function emitTypeDeclarations() {
  // Generate *.d.ts into ./lib without emitting JS (esbuild handles JS output)
  await new Promise((resolve, reject) => {
    const child = execFile(
      process.execPath,
      ['./node_modules/typescript/bin/tsc', '-p', './tsconfig.json', '--emitDeclarationOnly'],
      { stdio: 'inherit' },
      error => {
        if (error) {
          reject(error)
          return
        }
        resolve(undefined)
      },
    )

    child.on('error', reject)
  })
}

async function getEntryPoints(dir) {
  const entries = []
  const stack = [dir]

  while (stack.length) {
    const currentDir = stack.pop()
    const dirEntries = await readdir(currentDir, { withFileTypes: true })

    for (const entry of dirEntries) {
      const fullPath = join(currentDir, entry.name)

      if (entry.isDirectory()) {
        stack.push(fullPath)
        continue
      }

      if (entry.isFile() && /\.(ts|js|cjs)$/.test(entry.name)) {
        entries.push(fullPath)
      }
    }
  }

  return entries
}

async function build() {
  await emitTypeDeclarations()

  await esbuild.build({
    entryPoints: await getEntryPoints('src'),
    outdir: 'lib',
    platform: 'node',
    format: 'esm',
    target: 'es2020',
    sourcemap: true,
    outExtension: { '.js': '.js' },
    logLevel: 'info',
  })

  await copyFile('src/nest/clipper-core.cjs', 'lib/nest/clipper-core.cjs')

  console.log('✓ Build completed successfully (ESM only)')
}

try {
  await build()
} catch (error) {
  console.error('Build failed:', error)
  process.exit(1)
}
