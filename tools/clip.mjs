/* Full-scale screenshot of one horizontal slice of a page, for looking at a
   single band or a single seam.

   Usage: node tools/clip.mjs <route> <y> <height> [out] [width] [baseUrl]
*/
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const [route = '/', y = '0', height = '1000', out = 'tools/out/clip.png', width = '1920', baseUrl = 'http://127.0.0.1:3010'] =
  process.argv.slice(2)

const target = resolve(out)
mkdirSync(dirname(target), { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: Number(width), height: Math.min(Number(height), 2000) },
})
await page.goto(baseUrl + route, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.evaluate(async () => {
  const step = window.innerHeight
  for (let top = 0; top < document.documentElement.scrollHeight; top += step) {
    window.scrollTo(0, top)
    await new Promise((done) => requestAnimationFrame(() => setTimeout(done, 40)))
  }
})
await page.evaluate((top) => window.scrollTo(0, top), Number(y))
await page.waitForTimeout(250)
await page.screenshot({ path: target, clip: { x: 0, y: 0, width: Number(width), height: Number(height) } })
await browser.close()
console.log(target)
