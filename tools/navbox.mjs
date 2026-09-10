/**
 * Report where the PROJETS dropdown's logo strip sits, in page coordinates.
 *
 * The strip's cells are measured off Accueil.pdf p2 as absolute page positions,
 * but they are positioned against the panel, so the panel's own origin has to be
 * known before they can be converted. Reading it from the live DOM avoids
 * deriving it through the tab and panel geometry and being wrong by whatever the
 * chain rounds away.
 *
 * Usage: node tools/navbox.mjs [baseUrl]
 */

import { chromium } from 'playwright'
import { homedir } from 'node:os'
import { join } from 'node:path'

const [baseUrl = 'http://localhost:3010'] = process.argv.slice(2)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 900 } })
page.on('pageerror', (error) => console.error('pageerror:', error.message))

await page.goto(baseUrl + '/', { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

// The item wrapper has no box of its own — its parts are absolutely positioned —
// so the hover has to land on the link.
await page.locator('.nav__link', { hasText: 'PROJETS' }).first().hover()
await page.waitForTimeout(250)

for (const selector of ['.nav', '.nav__panel', '.nav__logos', '.logos__cell']) {
  const element = page.locator(selector).first()
  if ((await element.count()) === 0) {
    console.log(`${selector.padEnd(16)} absent`)
    continue
  }
  const box = await element.boundingBox()
  console.log(
    `${selector.padEnd(16)} x ${box.x.toFixed(1).padStart(7)}  y ${box.y
      .toFixed(1)
      .padStart(7)}  ${box.width.toFixed(1)} x ${box.height.toFixed(1)}`
  )
}

// The comp's open states are separate pages, so the panel is shot on its own to
// be diffed against them rather than being caught by the full-page shot.
const shot = join(
  homedir(),
  'AppData',
  'Local',
  'Temp',
  'eu4youth-extract',
  'shots',
  'nav-projets.png'
)
await page.screenshot({ path: shot, clip: { x: 0, y: 0, width: 1920, height: 700 } })
console.log(`\n${shot}`)

await browser.close()
