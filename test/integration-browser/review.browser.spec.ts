import { expect, test } from '@playwright/test'
import { partialInput, rejectedInput, smallInput } from './reviewFixtures'

const THREE_URL = '/vendor/three/three.module.js'

const NOTICES = '#host aside[aria-label="Avisos e motivos"]'

test.describe('nesting review — static view', () => {
  test('static review shows identity, notices, sheet switching and the drawing', async ({ page }) => {
    const input = smallInput()
    await page.goto('/')

    await page.evaluate(async (payload) => {
      const host = document.createElement('div')
      host.id = 'host'
      document.body.append(host)
      await globalThis.dxf.mountReview(host, payload)
    }, input)

    await expect(page.locator('#host header dd code').last()).toHaveText('b'.repeat(64))
    await expect(page.locator('#host header')).toContainText('order-1')
    await expect(page.locator(NOTICES)).toContainText('Nenhum aviso.')
    await expect(page.locator('#host svg path[data-part-key="part-1#0"]')).toHaveCount(1)
    await expect(page.locator('#host svg path[data-part-key="part-3#0"]')).toHaveCount(0)

    await page.locator('#host select').selectOption('sheet-2')

    await expect(page.locator('#host svg path[data-part-key="part-3#0"]')).toHaveCount(1)
    await expect(page.locator('#host svg path[data-part-key="part-1#0"]')).toHaveCount(0)
  })

  test('a partial artifact lists its reasons and never draws unplaced items', async ({ page }) => {
    const input = partialInput()
    await page.goto('/')

    await page.evaluate(async (payload) => {
      const host = document.createElement('div')
      host.id = 'host'
      document.body.append(host)
      await globalThis.dxf.mountReview(host, payload)
    }, input)

    await expect(page.locator(`${NOTICES} li`)).toHaveCount(3)
    await expect(page.locator(NOTICES)).toContainText('Não cabe em nenhuma chapa')
    await expect(page.locator('#host svg [data-part-key="part-9#0"]')).toHaveCount(0)
  })

  test('a rejected artifact shows its reasons instead of a blank view', async ({ page }) => {
    const input = rejectedInput()
    await page.goto('/')

    await page.evaluate(async (payload) => {
      const host = document.createElement('div')
      host.id = 'host'
      document.body.append(host)
      await globalThis.dxf.mountReview(host, payload)
    }, input)

    await expect(page.locator('#host section.dxf-review')).toHaveAttribute('data-status', 'unavailable')
    await expect(page.locator(NOTICES)).toContainText('Nenhuma chapa disponível')
    await expect(page.locator(NOTICES)).toContainText('não contém layout')
  })
})

import { referenceInput } from './reviewFixtures'
import type { Page } from '@playwright/test'

const mountWith = async (page: Page, input: unknown, accelerated: boolean): Promise<void> => {
  await page.goto('/')
  await page.addStyleTag({
    content: '#host{width:800px} #host figure{margin:0;width:800px;height:500px} #host [data-review-view]{width:100%;height:100%}',
  })
  await page.addScriptTag({ url: '/dist/dxf-review-three.js' })
  await page.evaluate(async ({ payload, useThree, threeUrl }) => {
    const host = document.createElement('div')
    host.id = 'host'
    host.style.width = '800px'
    host.style.height = '600px'
    document.body.append(host)
    const options: Record<string, unknown> = {}
    if (useThree) {
      const three = await import(threeUrl)
      options.acceleratedRenderer = (view: HTMLElement) =>
        (globalThis as unknown as { dxfReviewThree: { createThreeRenderer(o: unknown): Promise<unknown> } })
          .dxfReviewThree.createThreeRenderer({ container: view, three })
    }
    const review = await globalThis.dxf.mountReview(host, payload, options)
    ;(globalThis as unknown as { review: unknown }).review = review
  }, { payload: input, useThree: accelerated, threeUrl: THREE_URL })
}

test.describe('nesting review — playback', () => {
  test('plays, steps, seeks and never starts by itself in the accelerated renderer', async ({ page }) => {
    await mountWith(page, smallInput(), true)
    const root = page.locator('#host section.dxf-review')
    const slider = page.locator('#host input[type=range]')

    await expect(root).toHaveAttribute('data-renderer', 'accelerated')
    await expect(page.locator('#host canvas')).toHaveCount(1)
    await page.waitForTimeout(400)
    await expect(slider).toHaveValue('0')

    await page.getByRole('button', { name: 'Reproduzir' }).click()
    await expect.poll(async () => Number(await slider.inputValue())).toBeGreaterThan(0)
    await page.getByRole('button', { name: 'Pausar' }).click()
    const paused = await slider.inputValue()
    await page.waitForTimeout(300)
    await expect(slider).toHaveValue(paused)

    await page.locator('#host input[type=number]').fill('1')
    await page.locator('#host input[type=number]').dispatchEvent('change')
    await expect(slider).toHaveValue('0')
    await page.getByRole('button', { name: 'Próxima perfuração' }).click()
    await expect(slider).toHaveValue('1')
    await page.getByRole('button', { name: 'Próxima perfuração' }).click()
    await expect(slider).toHaveValue('6')
    await page.locator('#host input[type=number]').fill('3')
    await page.locator('#host input[type=number]').dispatchEvent('change')
    await expect(slider).toHaveValue('2')
  })

  test('falls back to the static view after the graphics context is lost, keeping the position', async ({ page }) => {
    await mountWith(page, smallInput(), true)
    const slider = page.locator('#host input[type=range]')
    await page.locator('#host input[type=number]').fill('8')
    await page.locator('#host input[type=number]').dispatchEvent('change')
    await expect(slider).toHaveValue('7')
    await page.locator('#host [data-review-view]').focus()
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('#host aside[aria-label="Inspeção"]')).toContainText('Peça part-1#0')

    await page.evaluate(() => {
      const canvas = document.querySelector('#host canvas') as HTMLCanvasElement
      ;(canvas.getContext('webgl2') as WebGL2RenderingContext).getExtension('WEBGL_lose_context')?.loseContext()
    })

    await expect(page.locator('#host section.dxf-review')).toHaveAttribute('data-renderer', 'static')
    await expect(page.locator(NOTICES)).toContainText('GRAPHICS_LOST')
    await expect(page.locator('#host svg[role=img]')).toHaveCount(1)
    await expect(page.locator('#host svg g[data-head]')).toHaveCount(1)
    await expect(page.locator('#host svg path[data-trail="true"]').first()).toBeAttached()
    await expect(page.locator('#host svg path[data-part-key="part-1#0"][data-selected="true"]')).toHaveCount(1)
    await expect(page.locator('#host aside[aria-label="Inspeção"]')).toContainText('Peça part-1#0')
    await expect(slider).toHaveValue('7')
    await page.getByRole('button', { name: 'Reproduzir' }).click()
    await expect.poll(async () => Number(await slider.inputValue())).toBeGreaterThan(7)
    await page.getByRole('button', { name: 'Pausar' }).click()
  })

  test('uses the static renderer with working playback when no accelerated renderer is supplied', async ({ page }) => {
    await mountWith(page, smallInput(), false)
    const slider = page.locator('#host input[type=range]')

    await expect(page.locator('#host section.dxf-review')).toHaveAttribute('data-renderer', 'static')
    await page.getByRole('button', { name: 'Reproduzir' }).click()
    await expect.poll(async () => Number(await slider.inputValue())).toBeGreaterThan(0)
    await expect(page.locator('#host svg path[data-trail="true"]').first()).toBeAttached()
  })

  for (const reduced of ['reduce', 'no-preference'] as const) {
    test(`never autoplays and applies view changes immediately with reduced motion "${reduced}"`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: reduced })
      await mountWith(page, smallInput(), true)
      const slider = page.locator('#host input[type=range]')

      await page.waitForTimeout(500)
      await expect(slider).toHaveValue('0')
      await page.locator('#host input[type=number]').fill('10')
      await page.locator('#host input[type=number]').dispatchEvent('change')
      await expect(slider).toHaveValue('9')
    })
  }

  test('measures opening and seeking of the 500-part reference sheet (SC-002, SC-004)', async ({ page }) => {
    test.setTimeout(180_000)
    const open: number[] = []
    const seek: number[] = []
    let environment = ''
    for (let run = 0; run < 5; run += 1) {
      await page.goto('/')
      await page.addScriptTag({ url: '/dist/dxf-review-three.js' })
      const result = await page.evaluate(async ({ payload, threeUrl }) => {
        const host = document.createElement('div')
        host.style.width = '800px'
        host.style.height = '600px'
        document.body.append(host)
        const three = await import(threeUrl)
        const started = performance.now()
        const review = await globalThis.dxf.mountReview(host, payload, {
          acceleratedRenderer: (view: HTMLElement) =>
            (globalThis as unknown as { dxfReviewThree: { createThreeRenderer(o: unknown): Promise<unknown> } })
              .dxfReviewThree.createThreeRenderer({ container: view, three }),
        })
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
        const opened = performance.now() - started
        const controller = review.controller as { seekToAction(index: number): void }
        const total = review.scene.sheets[0].timeline?.actions.length ?? 0
        const targets = [0, ...Array.from({ length: 20 }, (_, i) => Math.floor(((i + 1) / 21) * total)), total]
        const seeks: number[] = []
        for (const target of targets) {
          const begin = performance.now()
          controller.seekToAction(target)
          await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
          seeks.push(performance.now() - begin)
        }
        const gl = document.createElement('canvas').getContext('webgl2') as WebGL2RenderingContext
        const info = gl.getExtension('WEBGL_debug_renderer_info')
        return {
          opened,
          seeks,
          renderer: info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : 'unknown',
          cores: navigator.hardwareConcurrency,
          agent: navigator.userAgent,
        }
      }, { payload: referenceInput(), threeUrl: THREE_URL })
      open.push(result.opened)
      seek.push(Math.max(...result.seeks))
      environment = `${result.agent}; WebGL: ${result.renderer}; cores: ${result.cores}`
    }
    console.log(`SC-002 open (ms): ${open.map((v) => v.toFixed(0)).join(', ')} | worst ${Math.max(...open).toFixed(0)}`)
    console.log(`SC-004 worst seek per run (ms): ${seek.map((v) => v.toFixed(0)).join(', ')} | worst ${Math.max(...seek).toFixed(0)}`)
    console.log(`Environment: ${environment}`)
    expect(Math.max(...open)).toBeLessThan(2000)
    expect(Math.max(...seek)).toBeLessThan(500)
  })
})

const clientPointOf = async (page: Page, sheetPoint: { x: number; y: number }, accelerated: boolean) => {
  await page.locator('#host figure').scrollIntoViewIfNeeded()
  return page.evaluate(({ point, useThree }) => {
    if (!useThree) {
      const group = document.querySelector('#host svg g[data-sheet-id]') as SVGGElement
      const mapped = new DOMPoint(point.x, point.y).matrixTransform(group.getScreenCTM() as DOMMatrix)
      return { x: mapped.x, y: mapped.y }
    }
    const rect = (document.querySelector('#host canvas') as HTMLCanvasElement).getBoundingClientRect()
    const aspect = rect.height / rect.width
    const halfHeight = Math.max(((100 * 1.08) / 2) * aspect, (100 * 1.08) / 2)
    const halfWidth = halfHeight / aspect
    return {
      x: rect.left + ((point.x - (50 - halfWidth)) / (2 * halfWidth)) * rect.width,
      y: rect.top + (((50 + halfHeight) - point.y) / (2 * halfHeight)) * rect.height,
    }
  }, { point: sheetPoint, useThree: accelerated })
}

for (const accelerated of [false, true]) {
  test.describe(`nesting review — inspection (${accelerated ? 'accelerated' : 'static'} renderer)`, () => {
    test('selecting a part shows its identity, placement and artifact correlation, and can be cleared', async ({ page }) => {
      await mountWith(page, smallInput(), accelerated)
      const target = await clientPointOf(page, { x: 5, y: 18 }, accelerated)

      await page.mouse.click(target.x, target.y)

      const inspector = page.locator('#host aside[aria-label="Inspeção"]')
      await expect(inspector).toContainText('Peça part-1#0')
      await expect(inspector).toContainText('Posição')
      await expect(inspector).toContainText('order-1')
      await expect(inspector).toContainText('Posicionada')
      await expect(page.locator('#host [role=status]')).toContainText('Selecionado: Peça part-1#0')

      await inspector.getByRole('button', { name: 'Limpar seleção' }).click()
      await expect(inspector).toContainText('Nenhuma peça ou ação selecionada.')
    })

    test('selecting a cut line shows the action, its part and its process values', async ({ page }) => {
      await mountWith(page, smallInput(), accelerated)
      const target = await clientPointOf(page, { x: 2.1, y: 12 }, accelerated)

      await page.mouse.click(target.x, target.y)

      const inspector = page.locator('#host aside[aria-label="Inspeção"]')
      await expect(inspector).toContainText('Corte')
      await expect(inspector).toContainText('part-1#0')
      await expect(inspector).toContainText('feed')
      await expect(inspector).toContainText('1200')
    })

    test('clicking the same point again reaches the next overlapping item', async ({ page }) => {
      await mountWith(page, smallInput(), accelerated)
      const target = await clientPointOf(page, { x: 2.1, y: 12 }, accelerated)
      const inspector = page.locator('#host aside[aria-label="Inspeção"] h3')

      await page.mouse.click(target.x, target.y)
      const first = await inspector.textContent()
      await page.mouse.click(target.x, target.y)

      expect(await inspector.textContent()).not.toBe(first)
    })
  })
}

test.describe('nesting review — keyboard only', () => {
  test('every review function works without a pointer, with a written summary and announcements', async ({ page }) => {
    await mountWith(page, smallInput(), false)
    const slider = page.locator('#host input[type=range]')
    const status = page.locator('#host [role=status]')
    const inspector = page.locator('#host aside[aria-label="Inspeção"]')

    await expect(page.locator('#host section[aria-label="Resumo"]')).toContainText('Chapas: 2. Peças: 4.')
    await page.locator('#host [data-review-view]').focus()

    await page.keyboard.press(']')
    await expect(page.locator('#host select')).toHaveValue('sheet-2')
    await expect(status).toHaveText('Chapa sheet-2')
    await page.keyboard.press('[')
    await expect(page.locator('#host select')).toHaveValue('sheet-1')

    await page.keyboard.press('Space')
    await expect(status).toHaveText('Reprodução iniciada')
    await expect.poll(async () => Number(await slider.inputValue())).toBeGreaterThan(0)
    await page.keyboard.press('Space')
    await expect(status).toHaveText('Reprodução pausada')

    await page.keyboard.press('r')
    await expect(slider).toHaveValue('0')
    await page.keyboard.press('n')
    await expect(slider).toHaveValue('1')
    await page.keyboard.press('.')
    await expect(slider).toHaveValue('2')
    await page.keyboard.press('PageDown')
    await expect(slider).toHaveValue('11')
    await page.keyboard.press(',')
    await expect(slider).toHaveValue('10')
    await page.keyboard.press('Home')
    await expect(slider).toHaveValue('0')
    await page.keyboard.press('End')
    await expect(slider).not.toHaveValue('0')
    await expect(status).toContainText('Ação')

    await page.keyboard.press('ArrowRight')
    await expect(inspector).toContainText('Peça part-1#0')
    await expect(status).toHaveText('Selecionado: Peça part-1#0')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await expect(inspector).toContainText('Ação 2')
    await page.keyboard.press('Enter')
    await expect(slider).toHaveValue('1')
    await page.keyboard.press('Escape')
    await expect(inspector).toContainText('Nenhuma peça ou ação selecionada.')
    await expect(status).toHaveText('Seleção removida')

    await page.keyboard.press('>')
    await expect(page.locator('#host output')).toHaveText('×2')
    await page.keyboard.press('+')
    await page.keyboard.press('Shift+ArrowRight')
    await page.keyboard.press('0')
    await expect(page.locator('#host svg')).toHaveAttribute('viewBox', /^-4 -4 /)
  })

  test('the go-to-action field and every control are reachable with Tab and labeled', async ({ page }) => {
    await mountWith(page, smallInput(), false)
    const labels = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#host button, #host input, #host select')).map(
        (element) => element.getAttribute('aria-label') ?? element.textContent ?? element.closest('label')?.textContent ?? '',
      ))

    expect(labels.every((label) => label.trim().length > 0)).toBe(true)
    expect(labels).toEqual(expect.arrayContaining(['Reproduzir', 'Reiniciar', 'Próxima perfuração', 'Ir para a ação']))
    await page.getByRole('combobox').focus()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: 'Reproduzir' })).toBeFocused()
  })

  test('review-produced text is in Brazilian Portuguese', async ({ page }) => {
    await mountWith(page, smallInput(), false)

    await expect(page.locator('#host')).toContainText('Identificação do artefato')
    await expect(page.locator('#host')).toContainText('Atalhos de teclado')
    await expect(page.locator('#host')).toContainText('Avisos e motivos')
    await expect(page.locator('#host')).not.toContainText('Identification')
  })
})
