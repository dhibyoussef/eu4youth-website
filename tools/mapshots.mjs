/**
 * Photograph the territoires card once per project.
 *
 * The map used to be a bitmap with one project's regions already lit, so this is the check
 * that choosing a mark now changes the shapes and not just the names floating over them.
 *
 * Usage: node tools/mapshots.mjs [width] [baseUrl]
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const [width = '1440', baseUrl = 'http://localhost:3010'] = process.argv.slice(2)

const OUT = join(homedir(), 'AppData', 'Local', 'Temp', 'eu4youth-extract', 'maps')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: Number(width), height: 1400 },
  deviceScaleFactor: 1,
})
page.on('pageerror', (error) => console.error('pageerror:', error.message))
page.on('console', (message) => {
  if (message.type() === 'error') console.error('console:', message.text())
})

await page.goto(`${baseUrl}/programme/a-propos?t=${Date.now()}`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

const map = page.locator('.ap-map')
await map.scrollIntoViewIfNeeded()
await page.waitForTimeout(400)

const names = ['irada4youth', 'swafy', 'jeuness', 'fe3ila', 'maghroumin', 'go4youth']
for (let index = 0; index < names.length; index += 1) {
  await page.locator('.ap-pick').nth(index).click()
  await page.waitForTimeout(320)
  await map.screenshot({ path: join(OUT, `map-${names[index]}.png`) })

  const state = await page.evaluate(() => ({
    lit: document.querySelectorAll('.ap-map__gov--on').length,
    total: document.querySelectorAll('.ap-map__gov').length,
    labels: [...document.querySelectorAll('.ap-map__label')].map((n) => n.textContent),
    readout: document.querySelector('.ap-map__readout p')?.textContent,
    clipped: (() => {
      const p = document.querySelector('.ap-map__readout p')
      return p ? p.scrollWidth - p.clientWidth : 0
    })(),
  }))
  console.log(
    `${names[index].padEnd(11)} lit ${String(state.lit).padStart(2)}/${state.total}` +
      `  labels ${state.labels.length}` +
      (state.clipped > 1 ? `  READOUT CLIPPED ${state.clipped}px` : '  readout fits')
  )
  console.log(`            ${state.readout}`)
  if (state.labels.length) console.log(`            ${state.labels.join(' · ')}`)
}

console.log(`\nout -> ${OUT}`)
await browser.close()
