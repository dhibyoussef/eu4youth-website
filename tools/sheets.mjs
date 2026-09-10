/**
 * Open each of the a-propos overlays and photograph it.
 *
 * The three cards on comp pages 2-4 only exist once something is clicked, so a full-page
 * shot of the route never contains them and cannot show whether they are right. Each is
 * opened from the control the comp opens it from, which also proves that control works.
 *
 * Usage: node tools/sheets.mjs [width] [baseUrl]
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const [width = '1440', baseUrl = 'http://localhost:3010'] = process.argv.slice(2)

const OUT = join(homedir(), 'AppData', 'Local', 'Temp', 'eu4youth-extract', 'sheets')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  // Tall enough that the vision plate (1816) and chart (1156) are not forced to scroll
  // by the sheet's max-height clamp — otherwise the shoot reports a cropped card.
  viewport: { width: Number(width), height: 2000 },
  deviceScaleFactor: 1,
})
page.on('pageerror', (error) => console.error('pageerror:', error.message))
page.on('console', (message) => {
  if (message.type() === 'error') console.error('console:', message.text())
})

await page.goto(`${baseUrl}/programme/a-propos?t=${Date.now()}`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(500)

/** Open one overlay, shoot it, and leave with escape so the next one starts clean. */
async function shoot(name, open) {
  await open()
  await page.waitForTimeout(420)

  const sheet = page.locator('.sheet__card')
  if ((await sheet.count()) === 0) {
    console.log(`${name.padEnd(10)} DID NOT OPEN`)
    return
  }
  await sheet.screenshot({ path: join(OUT, `${name}.png`) })
  await page.screenshot({ path: join(OUT, `${name}-over.png`) })

  const box = await sheet.evaluate((node) => {
    const rect = node.getBoundingClientRect()
    const clipped = node.scrollHeight - Math.ceil(rect.height)
    return { w: Math.round(rect.width), h: Math.round(rect.height), clipped }
  })
  console.log(
    `${name.padEnd(10)} ${box.w}x${box.h}` +
      (box.clipped > 2 ? `  scrolls ${box.clipped}px` : '  fits')
  )

  await page.keyboard.press('Escape')
  await page.waitForTimeout(250)
  if ((await page.locator('.sheet').count()) > 0) console.log(`${name.padEnd(10)} ESCAPE IGNORED`)
}

await shoot('projet', async () => {
  const logos = page.locator('.ap-projets__logos .ap-logo')
  await logos.nth(2).scrollIntoViewIfNeeded() // Jeun'ESS, the one the comp details
  await logos.nth(2).click()
})

// Every logo is backed by a project brief now; prove all six open a fitted fiche rather than
// testing only the one state printed in the comp.
const projectNames = ['irada4youth', 'swafy', 'jeuness', 'fe3ila', 'maghroumin', 'go4youth']
for (let index = 0; index < projectNames.length; index += 1) {
  await shoot(`fiche-${projectNames[index]}`, async () => {
    const logos = page.locator('.ap-projets__logos .ap-logo')
    await logos.nth(index).scrollIntoViewIfNeeded()
    await logos.nth(index).click()
  })
}

await shoot('vision', async () => {
  const link = page.locator('.ap-vision .readmore__toggle')
  await link.scrollIntoViewIfNeeded()
  await link.click()
})

await shoot('chart', async () => {
  const kpi = page.locator('.ap-kpi__open')
  await kpi.scrollIntoViewIfNeeded()
  await kpi.click()
})

await shoot('fiche-map', async () => {
  const more = page.locator('.ap-map__more')
  await more.scrollIntoViewIfNeeded()
  await more.click()
})

// The territoires card in its own right: the marks have to change the map.
const map = page.locator('.ap-map')
await map.scrollIntoViewIfNeeded()
await page.waitForTimeout(250)
await map.screenshot({ path: join(OUT, 'map-jeuness.png') })
await page.locator('.ap-pick').nth(3).click()
await page.waitForTimeout(300)
await map.screenshot({ path: join(OUT, 'map-other.png') })

console.log(`\nout -> ${OUT}`)
await browser.close()
