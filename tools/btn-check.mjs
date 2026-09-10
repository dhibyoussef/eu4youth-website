/**
 * Reports controls whose label has no room inside the plate.
 *
 * The design system's `.btn` sets colour and type but leaves size to the usage,
 * which is right for the comp-positioned buttons — they are given the plate's own
 * width and height — and wrong for the pages assembled outside the comps, where a
 * `.btn` with no page rule of its own came out as a box drawn tight around the
 * letters. Anything under 10 design px of side padding, or whose label is wider
 * than its box, is listed with the route and the classes it carries.
 */
import { chromium } from 'playwright'
import { ROUTES } from './routes.mjs'

const base = process.argv[2] ?? 'http://127.0.0.1:3010'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
let findings = 0

for (const route of ROUTES) {
  await page.goto(base + route, { waitUntil: 'networkidle' })
  const rows = await page.evaluate(() => {
    const out = []
    for (const el of document.querySelectorAll('a, button')) {
      const box = el.getBoundingClientRect()
      if (box.width === 0 || box.height === 0) continue
      const cs = getComputedStyle(el)
      const framed =
        cs.borderLeftWidth !== '0px' || cs.backgroundColor !== 'rgba(0, 0, 0, 0)'
      if (!framed) continue
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
      const tight = padX < 10
      const spills = el.scrollWidth - el.clientWidth > 1
      if (!tight && !spills) continue
      out.push({
        text: (el.textContent ?? '').trim().slice(0, 40),
        cls: el.className.toString().slice(0, 60),
        padX: Math.round(padX),
        spill: el.scrollWidth - el.clientWidth,
      })
    }
    return out
  })
  if (rows.length === 0) continue
  findings += rows.length
  console.log(`\n${route}`)
  for (const r of rows) {
    console.log(
      `  padX=${r.padX} spill=${r.spill} "${r.text}" [${r.cls}]`,
    )
  }
}

console.log(`\n${findings} tight or spilling controls`)
await browser.close()
