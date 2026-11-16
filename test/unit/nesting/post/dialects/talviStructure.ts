const PREPARATION = ['G21', 'G90', 'G64 P0.03 Q0.001', '#5399=0.1', 'o<process_start> call', 'M64 P3', 'o<runframework> call', 'o110 repeat[1]']
const ENDING = ['o<process_end> call', 'o110 endrepeat', 'o<endpos> call', 'M65 P3', 'M2']
const AXIS = /^-?\d+\.\d{4}$/

interface Walk {
  out: string[]
  at: { x: number; y: number }
  contours: number
  expectDistance: number | undefined
}

const raw = (line: string, letter: string): string | undefined =>
  new RegExp(`(?:^|\\s)${letter}(-?\\d+(?:\\.\\d+)?)(?=\\s|$)`).exec(line)?.[1]
const word = (line: string, letter: string): number | undefined => {
  const value = raw(line, letter)
  return value === undefined ? undefined : Number(value)
}

function checkFrame(lines: readonly string[], out: string[]): void {
  if (!/^\(TotalContour=(\d+)\)$/.test(lines[0] ?? '')) out.push('header: TotalContour')
  if (!/^\(Size=\d+\.\d{3}\*\d+\.\d{3}\)$/.test(lines[1] ?? '')) out.push('header: Size')
  if (lines[2] !== '(Tools=1)') out.push('header: Tools')
  if (JSON.stringify(lines.slice(3, 11)) !== JSON.stringify(PREPARATION)) out.push('preparation')
  if (JSON.stringify(lines.slice(-5)) !== JSON.stringify(ENDING)) out.push('ending')
}

function checkStart(body: readonly string[], i: number, walk: Walk): void {
  walk.contours++
  if (Number(body[i].slice(1)) !== walk.contours) walk.out.push(`numbering at ${body[i]}`)
  if (!/^M101 P\d+( Q\d+)?$/.test(body[i + 1] ?? '')) walk.out.push(`selector after ${body[i]}`)
  if (!/^G00 X-?\d+\.\d{4} Y-?\d+\.\d{4}$/.test(body[i + 2] ?? '')) walk.out.push(`rapid after ${body[i]}`)
  if (body[i + 3] !== '#<_openslag>=1') walk.out.push(`openslag after ${body[i]}`)
  if (body[i + 4] !== 'o<layer_start> call') walk.out.push(`layer_start after ${body[i]}`)
}

function checkArc(line: string, x: number, y: number, walk: Walk): void {
  const i = word(line, 'I')
  const j = word(line, 'J')
  const formatted = AXIS.test(raw(line, 'I') ?? '') && AXIS.test(raw(line, 'J') ?? '')
  if (i === undefined || j === undefined || !formatted) walk.out.push(`arc center: ${line}`)
  else if (Math.abs(Math.hypot(i, j) - Math.hypot(x - (walk.at.x + i), y - (walk.at.y + j))) > 0.01) walk.out.push(`arc radius: ${line}`)
}

function checkAxes(line: string): { x: number; y: number } | undefined {
  const x = word(line, 'X')
  const y = word(line, 'Y')
  const formatted = AXIS.test(raw(line, 'X') ?? '') && AXIS.test(raw(line, 'Y') ?? '')
  return x === undefined || y === undefined || !formatted ? undefined : { x, y }
}

function checkMove(line: string, code: string, walk: Walk): void {
  const to = checkAxes(line)
  if (!to) {
    walk.out.push(`axis format: ${line}`)
    return
  }
  const travel = Math.hypot(to.x - walk.at.x, to.y - walk.at.y)
  if (code === 'G00' && walk.expectDistance !== undefined && Math.abs(travel - walk.expectDistance) > 0.001) {
    walk.out.push(`distance to next at ${line}`)
  }
  if (code === 'G02' || code === 'G03') checkArc(line, to.x, to.y, walk)
  walk.at = to
}

function checkDistance(body: readonly string[], i: number, walk: Walk): void {
  const text = body[i].slice('#<_NextOneDis>='.length)
  const value = Number(text)
  walk.expectDistance = value === -999 ? undefined : value
  if (value !== -999 && !/^\d+\.\d{3}$/.test(text)) walk.out.push(`distance format: ${body[i]}`)
  if (body[i + 1] !== 'o<layer_end> call') walk.out.push(`layer_end after ${body[i]}`)
}

function checkLine(body: readonly string[], i: number, walk: Walk): void {
  const line = body[i]
  if (/(^|\s)[FSE]-?\d/.test(line) || /^M0?[35]\b/.test(line)) walk.out.push(`forbidden word: ${line}`)
  const move = /^(G0[0123]) /.exec(line)
  if (/^N\d{4}$/.test(line)) checkStart(body, i, walk)
  else if (move) checkMove(line, move[1], walk)
  else if (line.startsWith('#<_NextOneDis>=')) checkDistance(body, i, walk)
}

function checkSentinel(body: readonly string[], out: string[]): void {
  const distances = body.filter((l) => l.startsWith('#<_NextOneDis>='))
  if (distances.length > 0 && distances[distances.length - 1] !== '#<_NextOneDis>=-999') out.push('last contour sentinel')
  if (distances.slice(0, -1).some((l) => l === '#<_NextOneDis>=-999')) out.push('sentinel before the last contour')
}

/** Check the structural rules observed in the real LaserAhead programs; returns the violations. */
export function checkTalviStructure(text: string): string[] {
  const lines = text.replace(/\n$/, '').split('\n')
  const walk: Walk = { out: [], at: { x: 0, y: 0 }, contours: 0, expectDistance: undefined }
  checkFrame(lines, walk.out)
  const body = lines.slice(11, -5)
  for (let i = 0; i < body.length; i++) checkLine(body, i, walk)
  const total = /^\(TotalContour=(\d+)\)$/.exec(lines[0] ?? '')
  if (total && Number(total[1]) !== walk.contours) walk.out.push('contour count differs from the header')
  checkSentinel(body, walk.out)
  return walk.out
}
