import { controlsPanel } from './controlsPanel'
import type { ControlsHandle } from './controlsPanel'
import { inspectorPanel } from './inspectorPanel'
import type { InspectorHandle } from './inspectorPanel'
import { messages } from './messages'
import { noticesPanel } from './noticesPanel'
import { shortcutsPanel } from './shortcutsPanel'
import { sheetSwitcher } from './sheetSwitcher'
import type { ReviewController, ReviewScene } from './types'

/** Panels of an interactive review and the elements that change with the state. */
export interface PanelHandles {
  switcher: HTMLElement
  controls: ControlsHandle | null
  inspector: InspectorHandle | null
  status: HTMLElement
  /** Current notices element; replaced whenever the notices change. */
  notices: { element: HTMLElement }
}

const makeFocusable = (view: HTMLElement, controller: ReviewController): void => {
  view.tabIndex = 0
  view.setAttribute('role', 'group')
  view.setAttribute('aria-label', messages.panels.viewKeyboard)
  view.addEventListener('keydown', (event) => {
    if (controller.handleKey({ key: event.key, shiftKey: event.shiftKey })) event.preventDefault()
  })
}

/**
 * Appends the interactive panels (sheet switcher, controls, shortcuts, view, inspector, notices
 * and the live status region) to the review root.
 *
 * @param root - Review root element.
 * @param view - Element that receives the drawing.
 * @param scene - Review scene.
 * @param controller - Controller the panels drive.
 * @returns Handles used to keep the panels in sync with the controller state.
 */
export function buildPanels(root: HTMLElement, view: HTMLElement, scene: ReviewScene, controller: ReviewController): PanelHandles {
  const doc = root.ownerDocument
  const actionCount = (sheetId: string): number =>
    scene.sheets.find((sheet) => sheet.id === sheetId)?.timeline?.actions.length ?? 0
  const switcher = sheetSwitcher(doc, scene, scene.sheets[0].id, (sheetId) => controller.selectSheet(sheetId))
  root.appendChild(switcher)
  const controls = scene.capabilities.playback ? controlsPanel(doc, controller, actionCount) : null
  if (controls) root.appendChild(controls.element)
  root.appendChild(shortcutsPanel(doc))
  makeFocusable(view, controller)
  const figure = doc.createElement('figure')
  figure.appendChild(view)
  root.appendChild(figure)
  const inspectable = scene.capabilities.actionInspection || scene.sheets.some((sheet) => sheet.parts.length > 0)
  const inspector = inspectable ? inspectorPanel(doc, scene, controller) : null
  if (inspector) root.appendChild(inspector.element)
  const notices = { element: noticesPanel(doc, scene.notices) }
  root.appendChild(notices.element)
  const status = doc.createElement('p')
  status.setAttribute('role', 'status')
  status.setAttribute('aria-live', 'polite')
  root.appendChild(status)
  return { switcher, controls, inspector, status, notices }
}
