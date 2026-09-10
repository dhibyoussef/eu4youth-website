/**
 * Full-page screenshot of a route at the 1920 design width.
 *
 * Usage: node tools/shoot.mjs <route> <outName> [baseUrl]
 *   node tools/shoot.mjs / home.png
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const [route = '/', outName = 'shot.png', baseUrl = 'http://localhost:3010'] =
  process.argv.slice(2)

const OUT = join(homedir(), 'AppData', 'Local', 'Temp', 'eu4youth-extract', 'shots')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
})

// A blank capture almost always means a render error, so surface those.
page.on('console', (message) => {
  if (message.type() === 'error') console.error('console:', message.text())
})
page.on('pageerror', (error) => console.error('pageerror:', error.message))

await page.goto(baseUrl + route, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

// Scroll through so every lazy raster is decoded before capture.
await page.evaluate(async () => {
  const step = window.innerHeight
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y)
    await new Promise((resolve) => requestAnimationFrame(resolve))
  }
  window.scrollTo(0, 0)
})
await page.waitForTimeout(400)

const height = await page.evaluate(() => document.documentElement.scrollHeight)
const target = join(OUT, outName)
await page.screenshot({ path: target, fullPage: true })

console.log(`${target}  1920x${height}`)
await browser.close()
