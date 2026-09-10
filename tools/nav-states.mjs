/**
 * Shoot every open header state at a set of desktop widths, and report each
 * panel's box in comp px so it can be checked against Accueil.pdf p2-p4.
 *
 * Usage: node tools/nav-states.mjs [baseUrl] [width...]
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const [baseUrl = 'http://127.0.0.1:3022', ...widthArgs] = process.argv.slice(2)
const widths = widthArgs.length ? widthArgs.map(Number) : [1920, 1440, 1100]

mkdirSync('tools/out/align', { recursive: true })

const LABELS = ['PROGRAMME', 'PROJETS', 'ACTUALITÉS', 'MÉDIAS']

const browser = await chromium.launch()

for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  await page.goto(`${baseUrl}/?t=${Date.now()}`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)

  for (const label of LABELS) {
    await page.locator('.nav__link', { hasText: label }).first().hover()
    await page.waitForTimeout(260)

    const box = await page.evaluate(() => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
      const panel = document.querySelector('.nav__panel')
      if (!panel) return null
      const rect = panel.getBoundingClientRect()
      const comp = (value) => Math.round((value / rem) * 10)
      return {
        px: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) },
        comp: { w: comp(rect.width), h: comp(rect.height) },
        overflowsRight: rect.right > window.innerWidth + 1,
        overflowsLeft: rect.left < -1,
      }
    })

    console.log(`${width}  ${label.padEnd(12)} ${JSON.stringify(box)}`)
    const slug = label.toLowerCase().replace(/[^a-z]+/g, '')
    await page.screenshot({
      path: `tools/out/align/${width}-${slug}.png`,
      clip: { x: 0, y: 0, width, height: Math.min(900, 700) },
    })
  }

  await page.close()
}

await browser.close()
