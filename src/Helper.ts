import denormalise from './denormalise'
import groupEntitiesByLayer from './groupEntitiesByLayer'
import parseString from './parseString'
import toJson from './toJson'
import toPolylines from './toPolylines'
import toSVG from './toSVG'
import logger from './util/logger'

import type { Entity, LayerGroups, ParsedDXF, ToJsonOptions, ToSVGOptions } from './types'

export default class Helper {
  private readonly _contents: string
  private _parsed: ParsedDXF | null
  private _denormalised: Entity[] | null
  private _groups: LayerGroups | null

  constructor(contents: string) {
    if (typeof contents !== 'string') {
      throw new TypeError('Helper constructor expects a DXF string')
    }
    this._contents = contents
    this._parsed = null
    this._denormalised = null
    this._groups = null
  }

  parse(): ParsedDXF {
    this._parsed = parseString(this._contents)
    logger.info('parsed:', this.parsed)
    return this._parsed
  }

  get parsed(): ParsedDXF {
    if (this._parsed === null) {
      this.parse()
    }
    return this._parsed as ParsedDXF
  }

  denormalise(): Entity[] {
    this._denormalised = denormalise(this.parsed)
    logger.info('denormalised:', this._denormalised)
    return this._denormalised
  }

  get denormalised(): Entity[] {
    if (!this._denormalised) {
      this.denormalise()
    }
    return this._denormalised as Entity[]
  }

  group(): LayerGroups {
    this._groups = groupEntitiesByLayer(this.denormalised)
    return this._groups
  }

  get groups(): LayerGroups {
    if (!this._groups) {
      this.group()
    }
    return this._groups as LayerGroups
  }

  toSVG(options?: ToSVGOptions): string {
    return toSVG(this.parsed, options)
  }

  toJson(options?: ToJsonOptions): string {
    return toJson(this.parsed, options)
  }

  toPolylines(): ReturnType<typeof toPolylines> {
    return toPolylines(this.parsed)
  }
}
