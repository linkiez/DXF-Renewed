import { messages } from './messages'
import type { ReviewController, ReviewState } from './types'

const button = (doc: Document, label: string, onClick: () => void): HTMLButtonElement => {
  const element = doc.createElement('button')
  element.type = 'button'
  element.textContent = label
  element.addEventListener('click', onClick)
  return element
}

/** Playback controls and the function that keeps them in sync with the controller state. */
export interface ControlsHandle {
  element: HTMLElement
  update(state: ReviewState): void
}

/**
 * Labeled playback controls: play/pause, reset, next pierce, speed, position slider and a
 * go-to-action field, all reachable with Tab.
 *
 * @param doc - Owner document.
 * @param controller - Controller the controls drive.
 * @param actionCount - Number of actions of a sheet.
 * @returns The controls element and an `update` function for state changes.
 */
export function controlsPanel(
  doc: Document,
  controller: ReviewController,
  actionCount: (sheetId: string) => number,
): ControlsHandle {
  const group = doc.createElement('div')
  group.setAttribute('role', 'group')
  group.setAttribute('aria-label', messages.controls.playback)
  let playing = false
  const toggle = button(doc, messages.controls.play, () => (playing ? controller.pause() : controller.play()))
  const reset = button(doc, messages.controls.reset, () => controller.reset())
  const next = button(doc, messages.controls.nextPierce, () => controller.stepToNextPierce())
  const slower = button(doc, messages.controls.slower, () => controller.handleKey({ key: '<', shiftKey: false }))
  const faster = button(doc, messages.controls.faster, () => controller.handleKey({ key: '>', shiftKey: false }))
  const speedLabel = doc.createElement('output')
  speedLabel.setAttribute('aria-label', messages.controls.speed)

  const slider = doc.createElement('input')
  slider.type = 'range'
  slider.min = '0'
  slider.setAttribute('aria-label', messages.controls.position)
  slider.addEventListener('input', () => controller.seekToAction(Number(slider.value)))

  const goTo = doc.createElement('input')
  goTo.type = 'number'
  goTo.min = '1'
  goTo.setAttribute('aria-label', messages.controls.goToAction)
  goTo.addEventListener('change', () => controller.seekToAction(Number(goTo.value) - 1))

  group.append(toggle, reset, next, slower, speedLabel, faster, slider, goTo)
  return {
    element: group,
    update(state) {
      playing = state.playing
      const count = actionCount(state.sheetId)
      toggle.textContent = playing ? messages.controls.pause : messages.controls.play
      toggle.setAttribute('aria-pressed', String(playing))
      speedLabel.textContent = `×${state.speed}`
      slider.max = String(count)
      slider.value = String(state.position.actionIndex)
      goTo.max = String(Math.max(count, 1))
      goTo.value = String(Math.min(state.position.actionIndex + 1, Math.max(count, 1)))
    },
  }
}
