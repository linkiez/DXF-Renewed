import type { CutChartInput, CutChartRow } from '../../../src/nesting/post/cutcharts/types'

/** Hand-written excerpt of the Phoenix 9.761 cut chart workbook (`Cut` and `Separations` sheets), checked row by row. */
const row = (values: CutChartRow): CutChartRow => ({
  'Profile Type': '*', Diameter: '*', 'Profile Area': '*', 'Feedrate %': 100, 'Process Variation Adjustment': 0,
  'Disable AHC': 0, 'Asynchronous Stop': 0, 'Cut Chart Type': 34, 'Cut Chart Cutting Surface': 1,
  'Transfer Height Factor': 200, 'Pierce Height Factor': 200, 'Edge Pierce Time': 0.15,
  V500: 1, V600: 1, 'M50 N': 1, RT: 1, HS: 1, 'Fine Feature': 0, HDi: 0, 'Thick Pierce': 0, 'True Hole': 0,
  Underwater: 0, Bevel: 0, 'Edge Pierce Only': 0,
  ...values,
})

export const cutChartExcerpt: CutChartInput = {
  unitMarker: 'mm',
  software: 'Phoenix 9.761',
  powerSupply: 'HPR260XDa',
  rows: [
    row({
      Material: 'MS', Thickness: 0.5, Class: '30Amp O2/O2', 'Base Feedrate': 5355, Feedrate: 5355, 'Lead In Feedrate': 5355,
      'Base Kerf': 1.09, Kerf: 1.09, 'Cut Chart Material': 1, 'Cut Chart Current': 30, 'Cut Chart Gas': 3, 'Cut Chart Thickness': 6,
      'Transfer Height Factor': 180, 'Pierce Height Factor': 180, 'Pierce Time': 0.1, 'Edge Pierce Time': 0.05,
      'Cut Height': 1.3, 'Cut Height Delay': 0.085378151260504201, 'Arc Voltage': 114,
    }),
    row({
      Material: 'MS', Thickness: 6, Class: '130Amp O2/Air', 'Base Feedrate': 4035, Feedrate: 4035, 'Lead In Feedrate': 4035,
      'Base Kerf': 1.81, Kerf: 1.81, 'Minimum Ramp Time': 0.35, 'Cut Chart Material': 1, 'Cut Chart Current': 130,
      'Cut Chart Gas': 2, 'Cut Chart Thickness': 29, 'Pierce Time': 0.3, 'Cut Height': 2.8,
      'Cut Height Delay': 0.1133085501858736, 'Arc Voltage': 127,
    }),
    row({
      Material: 'MS', Thickness: 8, Class: '130Amp O2/Air (True Hole)', 'True Hole': 1, 'Base Feedrate': 3360, Feedrate: 3360,
      'Lead In Feedrate': 3360, 'Base Kerf': 1.92, Kerf: 1.92, 'Cut Chart Material': 1, 'Cut Chart Current': 130,
      'Cut Chart Gas': 2, 'Cut Chart Thickness': 30, 'Pierce Time': 0.3, 'Cut Height': 3, 'Arc Voltage': 129,
    }),
    row({
      Material: 'SS', Thickness: 6, Class: '130Amp N2/N2', 'Base Feedrate': 1960, Feedrate: 1960, 'Lead In Feedrate': 1960,
      'Base Kerf': 1.83, Kerf: 1.83, 'Cut Chart Material': 2, 'Cut Chart Current': 130, 'Cut Chart Gas': 12,
      'Cut Chart Thickness': 29, 'Pierce Time': 0.3, 'Cut Height': 3, 'Cut Height Delay': 0.23326530612244897, 'Arc Voltage': 153,
    }),
    row({
      Material: 'AL', Thickness: 6, Class: '130Amp Air/Air', 'Base Feedrate': 2370, Feedrate: 2370, 'Lead In Feedrate': 2370,
      'Base Kerf': 2.09, Kerf: 2.09, 'Cut Chart Material': 3, 'Cut Chart Current': 130, 'Cut Chart Gas': 1,
      'Cut Chart Thickness': 29, 'Pierce Time': 0.2, 'Edge Pierce Time': 0.1, 'Cut Height': 2.8, 'Cut Height Delay': 0.1929113924050633, 'Arc Voltage': 153,
    }),
    row({
      Material: 'MS', Thickness: 10, Class: '130Amp O2/Air', 'Base Feedrate': 3000, Feedrate: 'not a number', 'Lead In Feedrate': 3000,
      'Base Kerf': 2, Kerf: 2, 'Cut Chart Material': 1, 'Cut Chart Current': 130, 'Cut Chart Gas': 2, 'Cut Chart Thickness': 31,
    }),
    row({
      Material: 'AL', Thickness: 10, Class: '130Amp Air/Air', 'Base Feedrate': 2000, Feedrate: 2000, 'Lead In Feedrate': 2000,
      'Base Kerf': 2, Kerf: 2, 'Cut Chart Material': 3, 'Cut Chart Current': 130, 'Cut Chart Gas': 99, 'Cut Chart Thickness': 31,
    }),
  ],
  separations: [
    { Material: '*', Thickness: 3, 'Part Sep': 5, 'Plate Sep': 5, 'Pierce Sep': 5 },
    { Material: '*', Thickness: 6, 'Part Sep': 4.8, 'Plate Sep': 4.8, 'Pierce Sep': 4.8 },
    { Material: '*', Thickness: 10, 'Part Sep': 8, 'Plate Sep': 8, 'Pierce Sep': 8 },
  ],
}

/** `count` valid rows for volume checks (distinct thickness and class). */
export function generatedCutChartRows(count: number): CutChartRow[] {
  const base = cutChartExcerpt.rows[1]
  return Array.from({ length: count }, (_, index) => ({ ...base, Thickness: 1 + index * 0.01, Class: `${index}Amp O2/Air` }))
}
