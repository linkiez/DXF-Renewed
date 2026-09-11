import type { DXFTuple } from '../../types'
import { parseUnderlay } from './underlay'

const TYPE = 'DGNUNDERLAY'

const process = (tuples: DXFTuple[]) => parseUnderlay(TYPE, tuples)

export default { TYPE, process }
