#!/usr/bin/env node
/**
 * CLI para nesting de peças DXF
 *
 * Uso:
 *   npx dxfr nest <arquivo.dxf> [opções]
 *   npx dxfr nest <arquivo.dxf> --bin 2000,4000 --preset laser
 *   npx dxfr nest <arquivo.dxf> --auto --output resultado
 */

import fs from 'node:fs'
import path from 'node:path'
import { nestDXF, NEST_PRESETS } from './nest/index'

// ─── Argument parsing simples ─────────────────────────────────────────

interface CliArgs {
  input: string
  bin?: string
  preset?: string
  auto?: boolean
  output?: string
  iterations?: number
  rotations?: number
  maxBins?: number
  help?: boolean
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { input: '' }
  let i = 0

  while (i < argv.length) {
    const arg = argv[i]

    switch (arg) {
      case '--help':
      case '-h':
        args.help = true
        break
      case '--bin':
        i++
        args.bin = argv[i]
        break
      case '--preset':
        i++
        args.preset = argv[i]
        break
      case '--auto':
        args.auto = true
        break
      case '--output':
      case '-o':
        i++
        args.output = argv[i]
        break
      case '--iterations':
      case '-i':
        i++
        args.iterations = parseInt(argv[i], 10)
        break
      case '--rotations':
        i++
        args.rotations = parseInt(argv[i], 10)
        break
      case '--max-bins':
        i++
        args.maxBins = parseInt(argv[i], 10)
        break
      default:
        if (!arg.startsWith('--') && !args.input) {
          args.input = arg
        }
    }
    i++
  }

  return args
}

function printHelp() {
  console.log(`
DXF Nest CLI — Encaixa peças de um arquivo DXF em chapas retangulares

USO:
  npx dxfr nest <arquivo.dxf> [opções]

OPÇÕES:
  --bin W,H          Tamanho da chapa (ex: 2000,4000)
  --preset NOME      Preset de corte: laser, plasma, waterjet, cnc
  --auto             Detecta tamanho da chapa automaticamente
  --output BASE      Prefixo para arquivos de saída (SVG + DXF)
  --iterations N     Número de iterações GA (default: 100)
  --rotations N      Ângulos de rotação (0, 4, 8; default: 4)
  --max-bins N       Bins máximos para peças que não cabem (default: 10)
  --help, -h         Mostra esta ajuda

EXEMPLOS:
  npx dxfr nest pecas.dxf --bin 2000,4000 --preset laser
  npx dxfr nest pecas.dxf --auto --output resultado
  npx dxfr nest pecas.dxf --preset plasma --iterations 50
`)
}

// ─── Main ─────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.help || !args.input) {
    printHelp()
    process.exit(args.help ? 0 : 1)
  }

  // Validar arquivo de entrada
  if (!fs.existsSync(args.input)) {
    console.error(`❌ Arquivo não encontrado: ${args.input}`)
    process.exit(1)
  }

  const dxfText = fs.readFileSync(args.input, 'utf-8')

  // Determinar bin size
  let binSize: { width: number; height: number } | undefined

  if (args.bin) {
    const [w, h] = args.bin.split(',').map(Number)
    if (isNaN(w) || isNaN(h)) {
      console.error('❌ Formato inválido para --bin. Use W,H (ex: 2000,4000)')
      process.exit(1)
    }
    binSize = { width: w, height: h }
  }

  // Opções
  const options: Parameters<typeof nestDXF>[1] = {
    autoDetectBin: args.auto || !binSize,
    ...(binSize && { binSize }),
    ...(args.iterations !== undefined && { maxIterations: args.iterations }),
    ...(args.rotations !== undefined && { maxRotations: args.rotations }),
    ...(args.maxBins !== undefined && { maxBins: args.maxBins }),
  }

  if (args.preset && NEST_PRESETS[args.preset]) {
    Object.assign(options, NEST_PRESETS[args.preset])
  }

  console.log(`📐 Lendo ${args.input}...`)
  console.time('⏱ Nesting completo')

  try {
    const result = await nestDXF(dxfText, options)

    console.log(`\n✅ Nesting concluído!`)
    console.log(
      `   Peças posicionadas: ${result.metrics.placedParts}/${result.metrics.totalParts}`,
    )
    console.log(
      `   Utilização: ${result.metrics.utilizationPercent.toFixed(1)}%`,
    )
    console.log(`   Bins usados: ${result.metrics.binsUsed}`)

    if (result.metrics.unplacedParts > 0) {
      console.log(
        `   ⚠ ${result.metrics.unplacedParts} peças não foram posicionadas`,
      )
    }

    // Salvar saída
    const outputBase = args.output || path.parse(args.input).name + '-nested'

    // SVG
    const svg = result.svg()
    const svgPath = outputBase + '.svg'
    fs.writeFileSync(svgPath, svg)
    console.log(
      `\n📄 SVG salvo: ${svgPath} (${(svg.length / 1024).toFixed(1)} KB)`,
    )

    // DXF
    const dxf = result.dxf()
    const dxfPath = outputBase + '.dxf'
    fs.writeFileSync(dxfPath, dxf)
    console.log(
      `📄 DXF salvo: ${dxfPath} (${(dxf.length / 1024).toFixed(1)} KB)`,
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`\n❌ Erro: ${message}`)
    process.exit(1)
  }

  console.timeEnd('⏱ Nesting completo')
}

main()
