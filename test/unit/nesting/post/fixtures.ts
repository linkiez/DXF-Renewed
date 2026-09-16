import type { CutPlan } from '../../../../src/nesting/cutPath'
import type { MachineProfile } from '../../../../src/nesting/post'

export const plan: CutPlan = {
  sheetId: 'sheet-1',
  actions: [
    { kind: 'rapid', points: [{ x: 10, y: 10 }, { x: 20, y: 20 }] },
    { kind: 'pierce', points: [{ x: 20, y: 20 }] },
    { kind: 'cut', points: [{ x: 20, y: 20 }, { x: 30, y: 20 }, { x: 30, y: 30 }] },
    { kind: 'end', points: [{ x: 30, y: 30 }] },
  ],
  stats: { cutLength: 20, rapidLength: Math.hypot(10, 10), pierceCount: 1, tabCount: 0 },
  baselineRapidLength: Math.hypot(10, 10),
  optimizedRapidLength: Math.hypot(10, 10),
}

export function profile(overrides: Partial<MachineProfile> = {}): MachineProfile {
  return {
    machineId: 'machine-1',
    machineKind: 'laser',
    processorId: 'generic-laser',
    processorRevision: '1',
    profileRevision: 'profile-1',
    units: 'mm',
    sheet: { width: 100, height: 100, margin: 0 },
    maxFeed: 1000,
    arcSupport: true,
    capabilities: { cutting: true },
    feed: 1000,
    power: 100,
    amperage: 45,
    pierceDwellMs: 0,
    ...overrides,
  }
}
