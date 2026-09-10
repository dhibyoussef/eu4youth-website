/** Where the chart's parts actually land, since its title and its bar labels collide. */

import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
await page.goto(`http://localhost:3010/programme/a-propos?t=${Date.now()}`, {
  waitUntil: 'networkidle',
})
await page.evaluate(() => document.fonts.ready)
await page.locator('.ap-kpi__open').scrollIntoViewIfNeeded()
await page.locator('.ap-kpi__open').click()
await page.waitForTimeout(400)

console.log(
  await page.evaluate(() => {
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
    const report = (selector) => {
      const node = document.querySelector(selector)
      if (!node) return `${selector}: missing`
      const b = node.getBoundingClientRect()
      const s = getComputedStyle(node)
      return `${selector.padEnd(16)} y ${Math.round(b.top)}..${Math.round(b.bottom)}  h ${Math.round(
        b.height
      )}  mt ${s.marginTop}  mb ${s.marginBottom}`
    }
    return [
      `1rem = ${rem.toFixed(2)}px`,
      report('.sheet__card'),
      report('.chart'),
      report('.chart__head'),
      report('.chart__grid'),
      report('.chart__bars'),
      report('.chart__bars li'),
      report('.chart__label'),
      report('.chart__title'),
    ].join('\n')
  })
)

await browser.close()
