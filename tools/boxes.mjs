/**
 * Print the rendered box of each given selector in design px.
 *
 * The comp's measurements are in design px and the page renders at a scale, so comparing the
 * two by eye off a screenshot is guesswork — and screenshots get resampled before anyone
 * looks at them, which makes it worse. This converts back to the comp's units so a number
 * from the PDF and a number from the DOM can be compared directly.
 *
 * Usage: node tools/boxes.mjs "sel one" "sel two" ...
 */

import { chromium } from 'playwright'

const selectors = process.argv.slice(2)
if (!selectors.length) {
  console.error('give at least one selector')
  process.exit(1)
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1000 }, deviceScaleFactor: 1 })
await page.goto(`http://localhost:3010/programme/a-propos?t=${Date.now()}`, {
  waitUntil: 'networkidle',
})
await page.evaluate(() => document.fonts.ready)

const out = await page.evaluate((sels) => {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
  const d = (v) => Math.round((v / rem) * 10)
  const pageTop = document.querySelector('.page--apropos').getBoundingClientRect().top
  const lines = []

  for (const sel of sels) {
    const nodes = document.querySelectorAll(sel)
    if (!nodes.length) {
      lines.push(`${sel}  -- no match`)
      continue
    }
    nodes.forEach((node, i) => {
      const b = node.getBoundingClientRect()
      const cs = getComputedStyle(node)
      const label = nodes.length > 1 ? `${sel} [${i}]` : sel
      lines.push(
        `${label.slice(0, 44).padEnd(44)} x ${String(d(b.left)).padStart(5)}..${String(
          d(b.right)
        ).padStart(5)}  y ${String(d(b.top - pageTop)).padStart(6)}..${String(
          d(b.bottom - pageTop)
        ).padStart(6)}  w ${String(d(b.width)).padStart(5)} h ${String(d(b.height)).padStart(5)}`
      )
      lines.push(
        `${''.padEnd(44)} font ${cs.fontSize}/${cs.lineHeight}  content-w ${d(
          node.clientWidth -
            parseFloat(cs.paddingLeft) -
            parseFloat(cs.paddingRight)
        )}  display ${cs.display}`
      )
    })
  }
  return lines.join('\n')
}, selectors)

console.log(out)
await browser.close()
