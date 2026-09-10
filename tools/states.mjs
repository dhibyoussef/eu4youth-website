/**
 * Contact sheet of a control's states next to the comp.
 *
 * For each named selector this writes one strip: the design PDF crop on top,
 * then the live element at rest, then hovered, then keyboard-focused. That is
 * the only reliable way to check a plated button, since the resting look comes
 * from artwork printed into the comp and the hover look is painted by CSS —
 * a full-page diff averages the two away.
 *
 * Usage: node tools/states.mjs [baseUrl]
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const [baseUrl = 'http://localhost:3010'] = process.argv.slice(2)

const OUT = join(homedir(), 'AppData', 'Local', 'Temp', 'eu4youth-extract', 'states')
mkdirSync(OUT, { recursive: true })

/** name, route, selector */
const TARGETS = [
  ['hero-btn', '/', '.hero__btn'],
  ['map', '/', '.map__btn'],
  ['stories', '/', '.stories__btn'],
  ['pubs', '/', '.pubs__btn'],
  ['stream-cta', '/', '.stream__cta'],
  ['card-btn', '/', '.card__btn'],
  ['logos', '/', '.projets__logos'],
  ['nav-programme', '/', '.nav__item:nth-child(1) .nav__link'],
  ['nav-projets', '/', '.nav__item:nth-child(2) .nav__link'],
]

const PAD = 14

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
})
page.on('pageerror', (error) => console.error('pageerror:', error.message))

let route = null
for (const [name, target, selector] of TARGETS) {
  if (route !== target) {
    await page.goto(baseUrl + target, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    route = target
  }

  const element = page.locator(selector).first()
  if ((await element.count()) === 0) {
    console.log(`${name.padEnd(11)} selector not found: ${selector}`)
    continue
  }

  await element.scrollIntoViewIfNeeded()
  await page.waitForTimeout(150)

  const box = await element.boundingBox()
  const clip = {
    x: Math.max(0, box.x - PAD),
    y: Math.max(0, box.y - PAD),
    width: box.width + PAD * 2,
    height: box.height + PAD * 2,
  }

  // Park the pointer somewhere inert so the rest shot is really at rest.
  await page.mouse.move(4, 4)
  await page.waitForTimeout(220)
  await page.screenshot({ path: join(OUT, `${name}-rest.png`), clip })

  await element.hover()
  await page.waitForTimeout(260)
  await page.screenshot({ path: join(OUT, `${name}-hover.png`), clip })

  await page.mouse.move(4, 4)
  await page.waitForTimeout(220)

  console.log(
    `${name.padEnd(11)} page ${Math.round(box.x)},${Math.round(
      box.y + (await page.evaluate(() => window.scrollY))
    )}  ${Math.round(box.width)}x${Math.round(box.height)}`
  )
}

await page.mouse.move(4, 4)
await page.waitForTimeout(200)
await page.evaluate(() => window.scrollTo(0, 0))

for (const [name, selector] of [
  ['drop-programme', '.nav__item:nth-child(1) .nav__link'],
  ['drop-projets', '.nav__item:nth-child(2) .nav__link'],
  ['drop-actus', '.nav__item:nth-child(4) .nav__link'],
]) {
  await page.locator(selector).hover()
  await page.waitForTimeout(280)
  await page.screenshot({
    path: join(OUT, `${name}.png`),
    clip: { x: 0, y: 0, width: 1920, height: 620 },
  })
  console.log(`${name.padEnd(11)} dropdown`)
}

console.log(`\nout -> ${OUT}`)
await browser.close()
