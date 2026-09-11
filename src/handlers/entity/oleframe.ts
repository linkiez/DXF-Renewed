import type { DXFTuple, OleFrameEntity } from '../../types'
import { parseOleFrame } from './ole-frame-parser'

const TYPE = 'OLEFRAME'

const process = (tuples: DXFTuple[]): OleFrameEntity =>
  parseOleFrame(TYPE, tuples) as OleFrameEntity

export default { TYPE, process }
