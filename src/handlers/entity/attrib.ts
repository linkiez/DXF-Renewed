import type { DXFTuple } from '../../types/dxf'
import type { Entity } from '../../types/entity'

import { assign, createTextEntityProcessor } from './attdef'

const TYPE = 'ATTRIB'

const process = (tuples: DXFTuple[]): Entity => createTextEntityProcessor(TYPE, assign)(tuples)

export default { TYPE, process }
