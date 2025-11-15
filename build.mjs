// esbuild configuration for building the project
import * as esbuild from 'esbuild'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

async function getEntryPoints(dir) {
  const entries = []
  const files = await readdir(dir, { withFileTypes: true, recursive: true })
  
  for (const file of files) {
    if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.js'))) {
      const fullPath = join(file.path, file.name)
      entries.push(fullPath)
    }
  }
  
  return entries
}

async function build() {
  const entryPoints = await getEntryPoints('src')
  
  await esbuild.build({
    entryPoints,
    outdir: 'lib',
    platform: 'node',
    format: 'cjs',
    target: 'es2015',
    sourcemap: true,
    outExtension: { '.js': '.js' },
    logLevel: 'info',
  })
  
  console.log('✓ Build completed successfully')
}

try {
  await build()
} catch (error) {
  console.error('Build failed:', error)
  process.exit(1)
}
