import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { createEditState } from '../../src/nesting/edit/createEditState'
import { commitEdit } from '../../src/nesting/edit/commitEdit'
import { buildEditedArtifact } from '../../src/nesting/edit/buildEditedArtifact'
import type { EditState } from '../../src/nesting/edit/types'
import { firstValueFrom } from 'rxjs'
import { costModel, editableInput, processProfile, referenceInput, riskProfile, smallInput } from './reviewFixtures'

const THREE_URL = '/vendor/three/three.module.js'
const EDIT = '#host [data-review-edit]'
const EDIT_OPTIONS = { constraints: { allowedRotations: [0, 90] }, step: { move: 2, rotate: 90 } }

const mountEditable = async (page: Page, input: unknown, accelerated: boolean, extra: Record<string, unknown> = {}): Promise<void> => {
  const { edit: extraEdit, ...more } = extra
  await page.goto('/')
  await page.addStyleTag({
    content: '#host{width:800px} #host figure{margin:0;width:800px;height:500px} #host [data-review-view]{width:100%;height:100%}',
  })
  await page.addScriptTag({ url: '/dist/dxf-review-three.js' })
  await page.evaluate(async ({ payload, useThree, threeUrl, edit, more }) => {
    const host = document.createElement('div')
    host.id = 'host'
    host.style.width = '800px'
    host.style.height = '600px'
    document.body.append(host)
    const options: Record<string, unknown> = { edit, ...more }
    if (useThree) {
      const three = await import(threeUrl)
      options.acceleratedRenderer = (view: HTMLElement) =>
        (globalThis as unknown as { dxfReviewThree: { createThreeRenderer(o: unknown): Promise<unknown> } })
          .dxfReviewThree.createThreeRenderer({ container: view, three })
    }
    ;(globalThis as unknown as { review: unknown }).review = await globalThis.dxf.mountReview(host, payload, options)
  }, { payload: input, useThree: accelerated, threeUrl: THREE_URL, edit: { ...EDIT_OPTIONS, ...((extraEdit as object) ?? {}) }, more })
}

const choosePart = async (page: Page, key: string): Promise<void> => {
  await page.locator(`${EDIT} [data-edit="toggle"]`).click()
  await page.locator(`${EDIT} select[data-edit-part]`).selectOption(key)
}

const propose = async (page: Page, kind: 'move' | 'rotate' | 'mirror', values: { dx?: number; dy?: number; degrees?: number } = {}): Promise<void> => {
  await page.locator(`${EDIT} select[data-edit-kind]`).selectOption(kind)
  if (values.dx !== undefined) await page.locator(`${EDIT} [data-edit-field="dx"]`).fill(String(values.dx))
  if (values.dy !== undefined) await page.locator(`${EDIT} [data-edit-field="dy"]`).fill(String(values.dy))
  if (values.degrees !== undefined) await page.locator(`${EDIT} [data-edit-field="degrees"]`).fill(String(values.degrees))
  await page.locator(`${EDIT} [data-edit="propose"]`).click()
}

const partX = (page: Page, key: string): Promise<number> =>
  page.evaluate((partKey) => {
    const review = (globalThis as unknown as { review: { scene: { sheets: { parts: { key: string; placement: { x: number } }[] }[] } } }).review
    return review.scene.sheets.flatMap((sheet) => sheet.parts).find((part) => part.key === partKey)?.placement.x ?? NaN
  }, key)

for (const accelerated of [false, true]) {
  test.describe(`nesting review editing (${accelerated ? 'accelerated' : 'static'} renderer)`, () => {
    test('an overlapping drop lists its reasons in text, refuses to confirm and announces it', async ({ page }) => {
      await mountEditable(page, smallInput(), accelerated)
      await choosePart(page, 'part-1#0')

      await propose(page, 'move', { dx: 20, dy: 0 })

      await expect(page.locator(`${EDIT} [data-violation="OVERLAP"]`)).toContainText('sobrepõe')
      await expect(page.locator(`${EDIT} [data-edit="confirm"]`)).toBeDisabled()
      await expect(page.locator(`${EDIT} [data-edit-status]`)).toContainText('inválida')
      if (!accelerated) {
        await expect(page.locator('#host svg [data-overlay-ghost][data-valid="false"]')).toHaveCount(1)
        await expect(page.locator('#host svg [data-overlay-mark="OVERLAP"]')).toContainText('sobrepõe')
      }
    })

    test('a position past the edge is refused with its own reason', async ({ page }) => {
      await mountEditable(page, smallInput(), accelerated)
      await choosePart(page, 'part-1#0')

      await propose(page, 'move', { dx: -5, dy: 0 })

      await expect(page.locator(`${EDIT} [data-violation="OUTSIDE_USABLE_AREA"]`)).toContainText('área útil')
    })

    test('a valid drop confirms, hides the old cut path and undo restores it', async ({ page }) => {
      await mountEditable(page, smallInput(), accelerated)
      await choosePart(page, 'part-1#0')
      expect(await partX(page, 'part-1#0')).toBe(2)

      await propose(page, 'move', { dx: 0, dy: 30 })
      await expect(page.locator(`${EDIT} [data-edit-status]`)).toContainText('válida')
      await page.locator(`${EDIT} [data-edit="confirm"]`).click()

      await expect(page.locator(`${EDIT} [data-edit-plan-outdated]`)).toBeVisible()
      await expect(page.locator(`${EDIT} [data-edit-freshness]`)).toContainText('Plano de corte: desatualizado')
      if (!accelerated) await expect(page.locator('#host svg [data-kind="cut"]')).toHaveCount(0)
      expect(await page.evaluate(() => {
        const review = (globalThis as unknown as { review: { scene: { sheets: { parts: { key: string; placement: { y: number } }[] }[] } } }).review
        return review.scene.sheets[0].parts.find((part) => part.key === 'part-1#0')?.placement.y
      })).toBe(32)

      await page.locator(`${EDIT} [data-edit="undo"]`).click()
      await expect(page.locator(`${EDIT} [data-edit-plan-outdated]`)).toBeHidden()
      if (!accelerated) await expect(page.locator('#host svg [data-kind="cut"]').first()).toBeAttached()
      await expect(page.locator(`${EDIT} [data-edit="redo"]`)).toBeEnabled()
    })

    test('arrow keys, Enter, Ctrl+Z and Ctrl+Y edit without a pointer and announce each step', async ({ page }) => {
      await mountEditable(page, smallInput(), accelerated)
      await choosePart(page, 'part-1#0')
      await page.locator('#host [data-review-view]').focus()

      await page.keyboard.press('ArrowRight')
      await expect(page.locator(`${EDIT} [data-edit-status]`)).toContainText('válida')
      await page.keyboard.press('Enter')
      await expect(page.locator(`${EDIT} [data-edit-status]`)).toContainText('confirmada')
      expect(await partX(page, 'part-1#0')).toBe(4)
      await expect(page.locator('#host [data-review-view]')).toBeFocused()

      await page.keyboard.press('Control+z')
      await expect(page.locator(`${EDIT} [data-edit-status]`)).toContainText('desfeita')
      expect(await partX(page, 'part-1#0')).toBe(2)
      await page.keyboard.press('Control+y')
      await expect(page.locator(`${EDIT} [data-edit-status]`)).toContainText('refeita')
      expect(await partX(page, 'part-1#0')).toBe(4)
    })

    test('a rotation that is not allowed says which rule refuses it', async ({ page }) => {
      await mountEditable(page, smallInput(), accelerated)
      await choosePart(page, 'part-1#0')

      await propose(page, 'rotate', { degrees: 45 })

      await expect(page.locator(`${EDIT} [data-violation="ROTATION_NOT_ALLOWED"]`)).toContainText('não é permitida')
    })
  })
}

test.describe('nesting review editing — picking after an edit', () => {
  test('clicking the new location selects the moved part and the inspector shows its new position', async ({ page }) => {
    await mountEditable(page, smallInput(), false)
    await choosePart(page, 'part-1#0')
    await propose(page, 'move', { dx: 0, dy: 40 })
    await page.locator(`${EDIT} [data-edit="confirm"]`).click()
    await expect(page.locator('#host svg path[data-part-key="part-1#0"]')).toHaveCount(1)

    const point = await page.evaluate(() => {
      const group = document.querySelector('#host svg g[data-sheet-id]') as SVGGElement
      const mapped = new DOMPoint(12, 52).matrixTransform(group.getScreenCTM() as DOMMatrix)
      return { x: mapped.x, y: mapped.y }
    })
    await page.mouse.click(point.x, point.y)

    await expect(page.locator('#host aside[aria-label="Inspeção"]')).toContainText('Peça part-1#0')
    await expect(page.locator('#host aside[aria-label="Inspeção"]')).toContainText('42')
  })
})

test.describe('nesting review editing — SC-001 verdict latency', () => {
  test('gives the verdict of each drag step on the 500-part sheet in under 100 ms', async ({ page }) => {
    test.setTimeout(180_000)
    const worst: number[] = []
    for (let run = 0; run < 5; run += 1) {
      await mountEditable(page, referenceInput(), true)
      const result = await page.evaluate(() => {
        const review = (globalThis as unknown as { review: { edit: { enter(): void; selectPart(key: string): void; propose(c: unknown): void } } }).review
        review.edit.enter()
        review.edit.selectPart('part-1#0')
        const steps: number[] = []
        for (let step = 1; step <= 60; step += 1) {
          const begin = performance.now()
          review.edit.propose({ partKey: 'part-1#0', kind: 'move', delta: { dx: step * 9, dy: step * 3 } })
          steps.push(performance.now() - begin)
        }
        return Math.max(...steps)
      })
      worst.push(result)
    }
    console.log(`SC-001 worst drag step per run (ms): ${worst.map((v) => v.toFixed(1)).join(', ')} | worst ${Math.max(...worst).toFixed(1)}`)
    expect(Math.max(...worst)).toBeLessThan(100)
  })
})


test.describe('nesting review editing — recomputation, comparison and traceability', () => {
  const recomputeEdit = (lead = 1) => ({ recompute: { processProfile: processProfile(lead), costModel: costModel() } })

  test('recomputes the plan after an edit, shows the new cut path and compares with the original', async ({ page }) => {
    await mountEditable(page, editableInput(), false, { edit: recomputeEdit() })
    await choosePart(page, 'part-1#0')
    await propose(page, 'move', { dx: 0, dy: 40 })
    await page.locator(`${EDIT} [data-edit="confirm"]`).click()
    await expect(page.locator(`${EDIT} [data-edit-plan-outdated]`)).toBeVisible()
    await expect(page.locator('#host svg [data-kind="cut"]')).toHaveCount(0)

    await page.locator(`${EDIT} [data-edit="recompute"]`).click()

    await expect(page.locator(`${EDIT} [data-edit-plan-outdated]`)).toBeHidden()
    await expect(page.locator(`${EDIT} [data-edit-freshness]`)).toContainText('Plano de corte: atual')
    await expect(page.locator(`${EDIT} [data-edit-freshness]`)).toContainText('Custo: atual')
    await expect(page.locator(`${EDIT} [data-edit-comparison]`)).toContainText('Peças com violação')
    await expect(page.locator(`${EDIT} [data-edit-comparison]`)).toContainText('Custo')
    await expect(page.locator(`${EDIT} [data-edit-status]`)).toContainText('Recálculo concluído')
    await expect(page.locator('#host svg [data-kind="cut"]').first()).toBeAttached()
  })

  test('a planner failure shows the reason, keeps the edited layout and keeps the old path hidden', async ({ page }) => {
    await mountEditable(page, editableInput(), false, { edit: recomputeEdit(-1) })
    await choosePart(page, 'part-1#0')
    await propose(page, 'move', { dx: 0, dy: 40 })
    await page.locator(`${EDIT} [data-edit="confirm"]`).click()

    await page.locator(`${EDIT} [data-edit="recompute"]`).click()

    await expect(page.locator(`${EDIT} [data-edit-notices]`)).toContainText('Não foi possível recalcular o plano de corte')
    await expect(page.locator(`${EDIT} [data-edit-plan-outdated]`)).toBeVisible()
    await expect(page.locator('#host svg [data-kind="cut"]')).toHaveCount(0)
    expect(await partX(page, 'part-1#0')).toBe(2)
  })

  test('the edited artifact built in the browser has the same digests as in Node (SC-004)', async ({ page }) => {
    const input = editableInput()
    const state = commitEdit(createEditState({ artifact: input.artifact as never }).state as EditState, { partKey: 'part-1#0', kind: 'move', delta: { dx: 0, dy: 40 } }).state
    const expected = await firstValueFrom(buildEditedArtifact(state))
    await page.goto('/')

    const actual = await page.evaluate(async (payload) => {
      const api = globalThis.dxf
      const created = api.createEditState({ artifact: payload.artifact })
      const committed = api.commitEdit(created.state, { partKey: 'part-1#0', kind: 'move', delta: { dx: 0, dy: 40 } })
      const result = await new Promise<{ artifact: { outputDigest: { value: string } }; edit: { digest: { value: string } } }>((resolve, reject) => {
        api.buildEditedArtifact(committed.state).subscribe({ next: resolve, error: reject })
      })
      return { output: result.artifact.outputDigest.value, edit: result.edit.digest.value }
    }, input)

    expect(actual).toEqual({ output: expected.artifact.outputDigest.value, edit: expected.edit.digest.value })
  })
})

test.describe('nesting review — risk panel', () => {
  test('lists each finding in text with its reason, values and suggestion, and says the result is indicative', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(async ({ payload, profile }) => {
      const host = document.createElement('div')
      host.id = 'host'
      document.body.append(host)
      await globalThis.dxf.mountReview(host, payload, { risk: { profile, processProfile: payload.processProfile } })
    }, { payload: { ...editableInput(), processProfile: processProfile() }, profile: riskProfile() })

    const panel = page.locator('#host [data-review-risk]')
    await expect(panel).toContainText('não substitui um corte de teste')
    await expect(panel).toContainText('Regras avaliadas: 4 de 4')
    const web = panel.locator('[data-risk-finding][data-category="thin-web"]', { hasText: 'Alma fina entre part-1#0 e part-2#0' })
    await expect(web).toHaveCount(1)
    await expect(web).toContainText('Medido')
    await expect(web).toContainText('Limite')
    await expect(web).toContainText('Sugestão')
  })

  test('names the missing input of a rule that cannot be assessed', async ({ page }) => {
    const profile = riskProfile() as Record<string, unknown>
    delete profile.web
    await page.goto('/')
    await page.evaluate(async ({ payload, risk }) => {
      const host = document.createElement('div')
      host.id = 'host'
      document.body.append(host)
      await globalThis.dxf.mountReview(host, payload, { risk: { profile: risk, processProfile: payload.processProfile } })
    }, { payload: { ...editableInput(), processProfile: processProfile() }, risk: profile })

    const panel = page.locator('#host [data-review-risk]')
    await expect(panel).toContainText('Regras avaliadas: 3 de 4')
    await expect(panel.locator('[data-risk-rules]')).toContainText('falta web.minimum')
  })

  test('shows the risk of the edited layout as outdated until it is recomputed', async ({ page }) => {
    await mountEditable(page, editableInput(), false, { edit: { recompute: { processProfile: processProfile(), costModel: costModel() } }, risk: { profile: riskProfile(), processProfile: processProfile(), costModel: costModel() } })
    await expect(page.locator('#host [data-review-risk] [data-risk-finding]').first()).toBeAttached()
    await choosePart(page, 'part-1#0')
    await propose(page, 'move', { dx: 0, dy: 40 })
    await page.locator(`${EDIT} [data-edit="confirm"]`).click()

    await expect(page.locator('#host [data-review-risk] [data-risk-note="outdated"]')).toContainText('desatualizado')

    await page.locator(`${EDIT} [data-edit="recompute"]`).click()
    await expect(page.locator('#host [data-review-risk] [data-risk-note]')).toHaveCount(0)
    await expect(page.locator('#host [data-review-risk] [data-risk-finding]', { hasText: 'Alma fina entre part-1#0 e part-2#0' })).toHaveCount(0)
  })
})


for (const accelerated of [false, true]) {
  test.describe(`nesting review — risk during playback (${accelerated ? 'accelerated' : 'static'} renderer)`, () => {
    const mountRisk = async (page: Page): Promise<void> => {
      await mountEditable(page, editableInput(), accelerated, { edit: { recompute: { processProfile: processProfile(), costModel: costModel() } }, risk: { profile: riskProfile(), processProfile: processProfile(), costModel: costModel() } })
    }
    const seekTo = (page: Page, actionIndex: number): Promise<void> =>
      page.evaluate((index) => (globalThis as unknown as { review: { controller: { seekToAction(i: number): void } } }).review.controller.seekToAction(index), actionIndex)

    test('shows the parts that are free at the displayed moment, in text and in the drawing', async ({ page }) => {
      await mountRisk(page)

      await seekTo(page, 5)

      if (!accelerated) await expect(page.locator('#host svg [data-overlay-freed]')).toHaveCount(1)
      await seekTo(page, 0)
      if (!accelerated) await expect(page.locator('#host svg [data-overlay-freed]')).toHaveCount(0)
    })

    test('shows the accumulated heat with the cells over the limit hatched and its maximum in text', async ({ page }) => {
      await mountRisk(page)
      await page.locator('#host [data-review-risk] [data-risk-heat-toggle]').check()

      await seekTo(page, 9)

      await expect(page.locator('#host [data-review-risk] [data-risk-heat]')).toContainText('Calor máximo neste instante')
      if (!accelerated) {
        await expect(page.locator('#host svg [data-overlay-heat]').first()).toBeAttached()
        await expect(page.locator('#host svg [data-overlay-heat][data-over="true"]').first()).toBeAttached()
      }
      await page.locator('#host [data-review-risk] [data-risk-heat-toggle]').uncheck()
      await expect(page.locator('#host [data-review-risk] [data-risk-heat]')).toBeHidden()
    })

    test('a timeline marker seeks to the finding and selects what it concerns, with the pointer and the keyboard', async ({ page }) => {
      await mountRisk(page)
      const marker = page.locator('#host [data-review-risk] [data-risk-timeline] button').first()
      await expect(marker).toContainText('Ir para o achado')

      await marker.focus()
      await page.keyboard.press('Enter')

      await expect(page.locator('#host aside[aria-label="Inspeção"]')).toContainText('Peça')
      if (!accelerated) await expect(page.locator('#host svg [data-overlay-marker]').first()).toContainText(/Aviso|Crítico/)
    })

    test('with reduced motion the same information is present and nothing animates', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await mountRisk(page)
      await page.locator('#host [data-review-risk] [data-risk-heat-toggle]').check()

      await seekTo(page, 9)

      await expect(page.locator('#host [data-review-risk] [data-risk-heat]')).toContainText('% do limite')
      if (!accelerated) expect(await page.locator('#host svg animate, #host svg animateTransform').count()).toBe(0)
    })
  })
}

test.describe('nesting review — the risk goes away after the edit that resolves it', () => {
  test('moving the part, recomputing and replaying removes the finding and the comparison reports it, in five interactions', async ({ page }) => {
    await mountEditable(page, editableInput(), false, {
      edit: { recompute: { processProfile: processProfile(), costModel: costModel() } },
      risk: { profile: riskProfile(), processProfile: processProfile(), costModel: costModel() },
    })
    const pair = page.locator('#host [data-review-risk] [data-risk-finding]', { hasText: 'Alma fina entre part-1#0 e part-2#0' })
    await expect(pair).toHaveCount(1)
    let interactions = 0

    await page.locator(`${EDIT} [data-edit="toggle"]`).click()
    interactions += 1
    await page.locator(`${EDIT} select[data-edit-part]`).selectOption('part-1#0')
    interactions += 1
    await propose(page, 'move', { dx: 0, dy: 40 })
    interactions += 1
    await page.locator(`${EDIT} [data-edit="confirm"]`).click()
    interactions += 1
    await page.locator(`${EDIT} [data-edit="recompute"]`).click()
    interactions += 1

    await expect(page.locator('#host [data-review-risk] [data-risk-finding]', { hasText: 'Alma fina entre part-1#0 e part-2#0' })).toHaveCount(0)
    await expect(page.locator(`${EDIT} [data-edit-comparison]`)).toContainText('Alma fina: antes 3,00; depois 2,00; diferença -1,00')
    await expect(page.locator('#host [data-review-risk] [data-risk-status]')).toContainText('achados de risco')
    expect(interactions).toBeLessThanOrEqual(5)
  })
})
