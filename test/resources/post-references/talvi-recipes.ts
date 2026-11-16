/** Hand-written tool files in the structure of the Talvi exports (values are synthetic). */
export interface RecipeOptions {
  height?: number
  speed?: number
  power?: number
  gas?: string
  tool?: number
  omit?: string[]
  stages?: Array<{ open: boolean; type: string; time: number }>
  lead?: boolean
}

export function recipeXml(options: RecipeOptions = {}): string {
  const o = { height: 0.5, speed: 300, power: 6000, gas: 'N2', tool: 1, omit: [] as string[], stages: [{ open: false, type: 'FenDuan', time: 10 }], lead: false, ...options }
  const tag = (name: string, value: string | number): string => (o.omit.includes(name) ? '' : `    <${name}>${value}</${name}>\n`)
  const stage = (s: { open: boolean; type: string; time: number }): string =>
    `    <HPiercing>\n      <bOpen>${s.open}</bOpen>\n      <strType>${s.type}</strType>\n      <nTime>${s.time}</nTime>\n      <dHeight>10</dHeight>\n      <strGasType>N2</strGasType>\n      <dGasPressure>1</dGasPressure>\n      <nPower>6000</nPower>\n      <nDuty>50</nDuty>\n      <nFrequency>500</nFrequency>\n      <dStartFocus>-5</dStartFocus>\n      <dEndFocus>6</dEndFocus>\n    </HPiercing>\n`
  return `<?xml version="1.0"?>
<HTool>
  <nTNumber>${o.tool}</nTNumber>
  <HCutParamtersSt>
${tag('dHeight', o.height)}${tag('dSpeed', o.speed)}${tag('nPower', o.power)}${tag('nFrequency', 3000)}${tag('nDuty', 100)}${tag('dGasPressure', 10)}${tag('strGasType', o.gas)}${tag('dFocus', -1.5)}${tag('nPreCutDelay', 0)}${tag('nCoolDelay', 0)}${tag('dSpotSize', 5.89)}    <bopenLeadPar>${o.lead}</bopenLeadPar>
    <dLeadCuttingVel>10</dLeadCuttingVel>
    <dLeadDuty>50</dLeadDuty>
    <dLeadFrequency>5000</dLeadFrequency>
    <dLeadHight>5</dLeadHight>
    <dLeadStableDis>3</dLeadStableDis>
    <dLeadCircleVel>10</dLeadCircleVel>
    <dLeadFocus>0</dLeadFocus>
    <dLeadStartLineLong>3</dLeadStartLineLong>
    <dLeadInCirRadius>1</dLeadInCirRadius>
    <chuZhaCutting>
      <dHeight>3</dHeight>
      <dSpeed>10</dSpeed>
    </chuZhaCutting>
  </HCutParamtersSt>
  <HPierceParamtersList>
${o.stages.map(stage).join('')}  </HPierceParamtersList>
</HTool>
`
}

export const recipeFiles = [
  { name: '0.9mm aco carbono s1.5.HSTool', text: recipeXml({ height: 0.5, speed: 300, power: 6000, gas: 'N2', tool: 1 }) },
  { name: '12mm inox s3.5.HSTool', text: recipeXml({ height: 1, speed: 80, power: 5500, gas: 'N2', tool: 2, stages: [{ open: true, type: 'FenDuan', time: 10 }, { open: true, type: 'FenDuan', time: 1000 }, { open: false, type: 'FenDuan', time: 5 }], lead: true }) },
  { name: '1.2双10mm.htoolsall.HSTool', text: recipeXml({ height: 1.2, speed: 120, power: 6000, gas: 'O2', tool: 3 }) },
]
