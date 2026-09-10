/* Cuts every route into screen-sized tiles so a whole page can be looked at
   rather than sampled. Tiles are shot at half scale: a 1920 screen becomes a
   960px image, which is small enough to read a page at a time and still shows
   overlaps, clipped art, broken art and misplaced blocks.

   Usage: node tools/review-shoot.mjs [baseUrl] [route ...]
          node tools/review-shoot.mjs http://127.0.0.1:3010 /carte /contact
   With no routes it shoots all of them. Output: tools/out/review/<slug>/NN.png
*/
import { chromium } from 'playwright'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ROUTES } from './routes.mjs'

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3010'
const outputDir = resolve('tools/out/review')

const routes = process.argv.length > 3 ? process.argv.slice(3) : ROUTES
const VIEW = { width: 1920, height: 1200 }

const slugOf = (route) =>
  route === '/' ? 'home' : route.slice(1).replaceAll('/', '--').replace(/[^a-zA-Z0-9_-]+/g, '-')

mkdirSync(outputDir, { recursive: true })
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: VIEW, deviceScaleFactor: 0.5 })
const manifest = []

for (const route of routes) {
  const slug = slugOf(route)
  const dir = resolve(outputDir, slug)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })

  const page = await context.newPage()
  await page.goto(baseUrl + route, { waitUntil: 'networkidle', timeout: 30_000 })
  await page.evaluate(() => document.fonts.ready)
  // Anything that animates in on scroll has to be settled before tiling, or the
  // tiles below the fold come back empty.
  await page.evaluate(async () => {
    const step = window.innerHeight
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((done) => requestAnimationFrame(() => setTimeout(done, 60)))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(300)

  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  const tiles = Math.max(1, Math.ceil(height / VIEW.height))

  for (let index = 0; index < tiles; index += 1) {
    const y = index * VIEW.height
    await page.evaluate((top) => window.scrollTo(0, top), y)
    await page.waitForTimeout(120)
    await page.screenshot({ path: resolve(dir, `${String(index + 1).padStart(2, '0')}.png`) })
  }

  manifest.push({ route, slug, height, tiles })
  console.log(`${route.padEnd(70)} ${height}px  ${tiles} tile(s)`)
  await page.close()
}

await context.close()
await browser.close()
writeFileSync(resolve(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log(`\nTiles: ${outputDir}`)
