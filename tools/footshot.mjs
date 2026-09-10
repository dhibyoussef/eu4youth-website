/**
 * Shoot the footer on its own, at rest and with one control hovered.
 *
 * The footer only appears after a whole page of scrolling, so checking it by eye means
 * scrolling past everything else every time. This scrolls to it, waits for its images, and
 * captures just that band — plus a second shot with a social tile and a project logo hovered,
 * because the whole point of un-flattening it is that those now respond.
 *
 * Usage: node tools/footshot.mjs [width] [path]
 */

import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'

const [width = '1440', path = '/programme/a-propos'] = process.argv.slice(2)
const out = 'tools/out'
await mkdir(out, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: Number(width), height: 900 },
  deviceScaleFactor: 1,
})
await page.goto(`http://localhost:3010${path}?t=${Date.now()}`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

const footer = page.locator('footer.footer')
await footer.scrollIntoViewIfNeeded()
await page.waitForTimeout(400)
await page.evaluate(async () => {
  await Promise.all(
    [...document.querySelectorAll('footer img')].map((img) =>
      img.complete ? null : new Promise((r) => img.addEventListener('load', r, { once: true }))
    )
  )
})

await footer.screenshot({ path: `${out}/footer-${width}.png` })

await page.locator('.footer__social a').nth(1).hover()
await page.locator('footer .logos__cell').nth(3).hover()
await page.waitForTimeout(320)
await footer.screenshot({ path: `${out}/footer-${width}-hover.png` })

const report = await page.evaluate(() => {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
  const d = (v) => Math.round((v / rem) * 10)
  const band = document.querySelector('footer.footer').getBoundingClientRect()
  const lines = [`footer ${d(band.width)} x ${d(band.height)} design px`]
  for (const sel of ['.footer__home img', '.footer__funders', '.footer__social', '.logos']) {
    const node = document.querySelector(sel)
    if (!node) {
      lines.push(`${sel} -- missing`)
      continue
    }
    const b = node.getBoundingClientRect()
    lines.push(
      `${sel.padEnd(22)} x ${d(b.left - band.left)}..${d(b.right - band.left)}  y ${d(
        b.top - band.top
      )}..${d(b.bottom - band.top)}`
    )
  }
  const clipped = d(
    Math.max(
      ...[...document.querySelectorAll('footer .logos__cell')].map((n) =>
        n.getBoundingClientRect().bottom
      )
    ) - band.bottom
  )
  lines.push(`logo strip past the band's foot: ${clipped} design px`)
  return lines.join('\n')
})

console.log(report)
await browser.close()
