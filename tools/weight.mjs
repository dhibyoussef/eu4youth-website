/**
 * Find which weight of the display face the comp is actually set in.
 *
 * The PDF names the font `Changa-Regular`, but Changa ships as a variable face with a
 * 200-800 axis and the comp's titles are visibly heavier than the build's 400. Rather than
 * trust the name, this renders one title across the axis and reports how much ink each
 * weight lays down, so the comp's own coverage picks the answer.
 *
 * Usage: node tools/weight.mjs "UNE VISION COMMUNE" 115
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const [text = 'UNE VISION COMMUNE', size = '115'] = process.argv.slice(2)

const OUT = join(homedir(), 'AppData', 'Local', 'Temp', 'eu4youth-extract', 'weight')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 400 } })
await page.goto('http://localhost:3010/', { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

const rows = await page.evaluate(
  async ({ text, size }) => {
    const probe = document.createElement('span')
    probe.style.cssText =
      `position:fixed;left:0;top:0;white-space:nowrap;font-family:Changa;font-size:${size}px;` +
      'line-height:1;color:#000;background:#fff;'
    probe.textContent = text
    document.body.append(probe)

    const out = []
    for (const weight of [200, 300, 400, 500, 600, 700, 800]) {
      probe.style.fontWeight = String(weight)
      await document.fonts.ready
      const box = probe.getBoundingClientRect()
      out.push({ weight, width: Math.round(box.width * 100) / 100 })
    }
    probe.remove()
    return out
  },
  { text, size: Number(size) }
)

for (const row of rows) console.log(`weight ${row.weight}  advance ${row.width}px`)

await browser.close()
