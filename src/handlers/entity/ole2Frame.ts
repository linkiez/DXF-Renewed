import type { DXFTuple, Ole2FrameEntity } from '../../types'
import { parseOleFrame } from './ole-frame-parser'

const TYPE = 'OLE2FRAME'

const process = (tuples: DXFTuple[]): Ole2FrameEntity =>
  parseOleFrame(TYPE, tuples) as Ole2FrameEntity

export default { TYPE, process }
