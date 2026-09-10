/**
 * Photograph the whole a-propos page and record where each band landed.
 *
 * The page is a flow layout, so a band's top is wherever the bands above it ended, not
 * where the comp put it. Recording the offsets lets the comparison cut the screenshot at
 * the same seams the comp is cut at.
 *
 * Usage: node tools/apropos_shoot.mjs [width] [baseUrl]
 */

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const [width = '1920', baseUrl = 'http://localhost:3010'] = process.argv.slice(2)

const OUT = join(homedir(), 'AppData', 'Local', 'Temp', 'eu4youth-extract', 'apropos')
mkdirSync(OUT, { recursive: true })

const BANDS = [
  ['hero', '.ap-hero'],
  ['pourquoi', '.ap-why'],
  ['vision', '.ap-vision'],
  ['objectifs', '.ap-objectifs'],
  ['comment', '.ap-comment'],
  ['projets', '.ap-projets'],
  ['territoires', '.ap-territoires'],
  ['impact', '.ap-impact'],
  ['partenaires', '.ap-partners'],
  ['avenir', '.ap-avenir'],
]

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: Number(width), height: 1080 },
  deviceScaleFactor: 1,
})
page.on('pageerror', (error) => console.error('pageerror:', error.message))

await page.goto(`${baseUrl}/programme/a-propos?t=${Date.now()}`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

// Walk the page so every lazy image decodes before the full-page shot.
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 900) {
    window.scrollTo(0, y)
    await new Promise((resolve) => setTimeout(resolve, 60))
  }
  window.scrollTo(0, 0)
})
await page.waitForTimeout(600)

// The zoom the page is set to, since every measurement below is in device pixels and the
// comp's are in its own 1920 units.
const rem = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize))
console.log(`1rem = ${rem.toFixed(2)}px  (comp scale ${(rem / 10).toFixed(3)})`)

const lines = [`scale ${(rem / 10).toFixed(4)} 0`]
for (const [name, selector] of BANDS) {
  const element = page.locator(selector).first()
  if ((await element.count()) === 0) {
    console.log(`${name.padEnd(14)} MISSING`)
    continue
  }
  const box = await element.evaluate((node) => {
    const rect = node.getBoundingClientRect()
    return { top: Math.round(rect.top + window.scrollY), height: Math.round(rect.height) }
  })
  lines.push(`${name} ${box.top} ${box.top + box.height}`)
}
writeFileSync(join(OUT, 'offsets.txt'), lines.join('\n'), 'utf-8')

await page.screenshot({ path: join(OUT, 'page.png'), fullPage: true })
console.log(`\nout -> ${OUT}`)
await browser.close()
