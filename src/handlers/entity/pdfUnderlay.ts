import type { DXFTuple } from '../../types'
import { parseUnderlay } from './underlay'

const TYPE = 'PDFUNDERLAY'

const process = (tuples: DXFTuple[]) => parseUnderlay(TYPE, tuples)

export default { TYPE, process }
