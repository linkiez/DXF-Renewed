#!/usr/bin/env node
import { Command } from 'commander'
import fs from 'node:fs'
import { createRequire } from 'node:module'

import { denormalise, groupEntitiesByLayer, parseString, toSVG } from './'

const require = createRequire(import.meta.url)
const { version } = require('../package.json')

const program = new Command()

program
  .version(version)
  .description('Converts a dxf file to a svg file.')
  .arguments('<dxfFile> [svgFile]')
  .option('-v --verbose', 'Verbose output')
  .action((dxfFile: string, svgFile: string | undefined, options: { verbose?: boolean }) => {
    const parsed = parseString(fs.readFileSync(dxfFile, 'utf-8'))

    if (options.verbose) {
      const groups = groupEntitiesByLayer(denormalise(parsed))
      console.log('[layer : number of entities]')
      for (const layer of Object.keys(groups)) {
        console.log(`${layer} : ${groups[layer].length}`)
      }
    }

    fs.writeFileSync(
      svgFile || `${dxfFile.split('.').slice(0, -1).join('.')}.svg`,
      toSVG(parsed),
      'utf-8',
    )
  })
  .parse(process.argv)

if (!process.argv.slice(2).length) {
  program.help()
}
