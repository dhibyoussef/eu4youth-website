/**
 * Report horizontal overflow and the elements causing it.
 *
 * A page that is wider than its window gets a horizontal scrollbar and reads as broken
 * whatever else is right, and the culprit is never the element you are looking at — it is
 * some descendant whose fixed width or padding pushes past the edge. This walks every
 * element and reports the ones that cross the viewport's right edge, nearest ancestor
 * first, so the outermost cause shows up rather than every child it drags along.
 *
 * Usage: node tools/overflow.mjs [width] [path]
 */

import { chromium } from 'playwright'

const [width = '1024', path = '/programme/a-propos'] = process.argv.slice(2)

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: Number(width), height: 900 },
  deviceScaleFactor: 1,
})
await page.goto(`http://localhost:3010${path}?t=${Date.now()}`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

const report = await page.evaluate(() => {
  const root = document.documentElement
  const view = root.clientWidth
  const lines = [
    `viewport ${view}   scrollWidth ${root.scrollWidth}   overflow ${root.scrollWidth - view}`,
    `rem ${getComputedStyle(root).fontSize}   canvas ${
      192 * parseFloat(getComputedStyle(root).fontSize)
    }px`,
    '',
  ]

  const guilty = []
  for (const node of document.querySelectorAll('body *')) {
    const box = node.getBoundingClientRect()
    if (box.width === 0 || box.height === 0) continue
    const over = Math.round(box.right - view)
    const under = Math.round(box.left)
    if (over <= 1 && under >= -1) continue
    guilty.push({ node, over, under, box })
  }

  // Drop anything whose parent is already listed: only the outermost cause is useful.
  const listed = new Set(guilty.map((g) => g.node))
  const outer = guilty.filter((g) => {
    for (let p = g.node.parentElement; p; p = p.parentElement) if (listed.has(p)) return false
    return true
  })

  for (const g of outer.slice(0, 14)) {
    const name =
      g.node.tagName.toLowerCase() +
      (g.node.className && typeof g.node.className === 'string'
        ? '.' + g.node.className.trim().split(/\s+/).join('.')
        : '')
    lines.push(
      `${name.slice(0, 58).padEnd(58)} left=${Math.round(g.box.left)} right=${Math.round(
        g.box.right
      )} w=${Math.round(g.box.width)}`
    )
  }
  if (!outer.length) lines.push('nothing crosses either edge')
  return lines.join('\n')
})

console.log(report)
await browser.close()
