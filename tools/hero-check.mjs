import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const out = resolve('tools/out/hero-fix')
mkdirSync(out, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

const routes = [
  ['/actualites', 'actualites', '.news-hero'],
  ['/opportunites', 'opportunites', '.op-hero'],
  ['/glossaire', 'glossaire', '.gloss-hero'],
  ['/contact', 'contact', '.contact-hero'],
  ['/programme/a-propos', 'apropos', '.ap-hero'],
]

for (const [route, name, selector] of routes) {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto(`http://127.0.0.1:3011${route}`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.locator(selector).first().screenshot({
    path: resolve(out, `${name}-hero-desktop.png`),
  })

  const colors = await page.evaluate((sel) => {
    const el = document.querySelector(sel)
    const style = getComputedStyle(el)
    return {
      background: style.backgroundColor,
      color: style.color,
      minHeight: style.minHeight,
      className: el.className,
    }
  }, selector)
  console.log(name, JSON.stringify(colors))

  await page.setViewportSize({ width: 390, height: 844 })
  await page.reload({ waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.locator(selector).first().screenshot({
    path: resolve(out, `${name}-hero-mobile.png`),
  })
}

await page.setViewportSize({ width: 390, height: 844 })
await page.goto('http://127.0.0.1:3011/programme/a-propos', {
  waitUntil: 'networkidle',
})
await page.evaluate(() => document.fonts.ready)
const territories = await page.evaluate(() => {
  const band = document.querySelector('.ap-territoires')
  const map = document.querySelector('.ap-map')
  const bandBox = band.getBoundingClientRect()
  const mapBox = map.getBoundingClientRect()
  return {
    bandWidth: Math.round(bandBox.width),
    mapWidth: Math.round(mapBox.width),
    overflow: Math.round(document.documentElement.scrollWidth - window.innerWidth),
    columns: getComputedStyle(band).gridTemplateColumns,
  }
})
console.log('apropos-territoires-mobile', JSON.stringify(territories))
const overflowers = await page.evaluate(() =>
  [...document.querySelectorAll('main *')]
    .map((element) => {
      const box = element.getBoundingClientRect()
      return {
        tag: element.tagName.toLowerCase(),
        className: element.className?.toString() ?? '',
        parentClass: element.parentElement?.className?.toString() ?? '',
        left: Math.round(box.left),
        right: Math.round(box.right),
      }
    })
    .filter((item) => item.left < -2 || item.right > window.innerWidth + 2)
    .slice(0, 20),
)
console.log('apropos-overflowers-mobile', JSON.stringify(overflowers))
await page.locator('.ap-territoires').screenshot({
  path: resolve(out, 'apropos-territoires-mobile.png'),
})

await browser.close()
