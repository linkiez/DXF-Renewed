import { messages } from './messages'
import type { ReviewScene } from './types'

/** Labeled sheet selector inside a nav; calls back with the chosen sheet id. */
export function sheetSwitcher(
  doc: Document,
  scene: ReviewScene,
  current: string,
  onChange: (sheetId: string) => void,
): HTMLElement {
  const nav = doc.createElement('nav')
  nav.setAttribute('aria-label', messages.controls.sheet)
  const label = doc.createElement('label')
  label.textContent = `${messages.controls.sheet} `
  const select = doc.createElement('select')
  for (const sheet of scene.sheets) {
    const option = doc.createElement('option')
    option.value = sheet.id
    option.textContent = sheet.id
    option.selected = sheet.id === current
    select.appendChild(option)
  }
  select.addEventListener('change', () => onChange(select.value))
  label.appendChild(select)
  nav.appendChild(label)
  return nav
}
