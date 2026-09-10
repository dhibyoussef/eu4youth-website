/**
 * Report the rendered box of each logo in a band's logo row, in design px.
 *
 * The row is a set of unrelated marks — a wordmark, a rounded app icon, a stack of figures,
 * Arabic calligraphy — and sizing them all by one height makes the ones with tight artwork
 * look small and the ones with padding in the file look huge. This prints what each one
 * actually occupies so the row can be evened out against the comp.
 *
 * Usage: node tools/logorow.mjs [selector]
 */

import { chromium } from 'playwright'

const selector = process.argv[2] ?? '.ap-projets__logos'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1000 }, deviceScaleFactor: 1 })
await page.goto(`http://localhost:3010/programme/a-propos?t=${Date.now()}`, {
  waitUntil: 'networkidle',
})
await page.evaluate(() => document.fonts.ready)

const out = await page.evaluate((sel) => {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
  const px = (v) => Math.round((v / rem) * 10) // rendered px -> design px
  const row = document.querySelector(sel)
  if (!row) return `no ${sel}`

  const box = row.getBoundingClientRect()
  const lines = [
    `${sel}   w ${px(box.width)}  h ${px(box.height)}   (design px)`,
    `align-items ${getComputedStyle(row).alignItems}   gap ${getComputedStyle(row).columnGap}`,
    '',
  ]
  for (const img of row.querySelectorAll('img')) {
    const b = img.getBoundingClientRect()
    const name = (img.getAttribute('src') ?? '').split('/').pop()
    lines.push(
      `${name.padEnd(30)} w ${String(px(b.width)).padStart(4)}  h ${String(px(b.height)).padStart(
        4
      )}   top ${String(px(b.top - box.top)).padStart(4)}  natural ${img.naturalWidth}x${
        img.naturalHeight
      }`
    )
  }
  return lines.join('\n')
}, selector)

console.log(out)
await browser.close()
