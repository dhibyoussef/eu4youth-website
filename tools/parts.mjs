/**
 * Report the box of every selector given, in comp px relative to the first one's top.
 *
 * The band diff says a band is 50 too tall; this says which child inside it holds the 50, which
 * is the difference between guessing at padding and reading it.
 *
 * Usage: node tools/parts.mjs SELECTOR[,SELECTOR...] [route] [width]
 */

import { chromium } from 'playwright'

const [list, route = '/programme/a-propos', width = '1920'] = process.argv.slice(2)
const selectors = list.split(',')

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: Number(width), height: 1200 } })
await page.goto(`http://localhost:3010${route}?t=${Date.now()}`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(300)

const rows = await page.evaluate((sels) => {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
  const comp = (v) => Math.round((v / rem) * 100) / 10
  let origin = null
  return sels.map((sel) => {
    const el = document.querySelector(sel)
    if (!el) return { sel, missing: true }
    const r = el.getBoundingClientRect()
    const top = r.top + window.scrollY
    if (origin === null) origin = top
    return {
      sel,
      top: comp(top - origin),
      bottom: comp(top - origin + r.height),
      w: comp(r.width),
      h: comp(r.height),
    }
  })
}, selectors)

for (const r of rows) {
  if (r.missing) {
    console.log(`${r.sel.padEnd(38)}  MISSING`)
    continue
  }
  console.log(
    `${r.sel.padEnd(38)}  y ${String(r.top).padStart(8)}..${String(r.bottom).padStart(8)}` +
      `   ${String(r.w).padStart(8)} x ${String(r.h).padStart(7)}`,
  )
}

await browser.close()
