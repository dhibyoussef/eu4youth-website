/* Photographs the three places the client called out — the homepage hero, the card
   overlays and the vision band — and reports whether each one now fits its window:
   the hero's paragraph clear of its buttons, and every overlay whole without a scroll.

   Run against a short window as well as a laptop one, since the overlays only ever
   scrolled on the short one. */
import { chromium } from 'playwright'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'

const OUT = join(homedir(), 'AppData', 'Local', 'Temp', 'eu4youth-extract', 'audit')
mkdirSync(OUT, { recursive: true })

const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1440, height: 810 },
  { width: 1280, height: 680 },
]

const browser = await chromium.launch()

for (const viewport of VIEWPORTS) {
  const page = await browser.newPage({ viewport })
  await page.goto('http://localhost:3010/', { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(400)

  const hero = await page.evaluate(() => {
    const box = (sel) => {
      const el = document.querySelector(sel)
      const r = el.getBoundingClientRect()
      return { top: Math.round(r.top), bottom: Math.round(r.bottom) }
    }
    const body = box('.hero__body')
    const btn = box('.hero__btn')
    const primary = document.querySelector('.hero__btn')
    const paint = getComputedStyle(primary)
    return {
      clearance: Math.round(btn.top - body.bottom),
      restFill: paint.backgroundColor,
      restInk: paint.color,
    }
  })

  await page.locator('.hero__btn').first().hover()
  await page.waitForTimeout(300)
  const hover = await page.evaluate(() => {
    const paint = getComputedStyle(document.querySelector('.hero__btn'))
    return { fill: paint.backgroundColor, ink: paint.color }
  })
  await page.screenshot({ path: join(OUT, `hero-${viewport.width}.png`) })
  console.log(`hero ${viewport.width}x${viewport.height}:`, JSON.stringify({ ...hero, hover }))
  await page.close()
}

for (const viewport of VIEWPORTS) {
  const page = await browser.newPage({ viewport })
  await page.goto('http://localhost:3010/programme/a-propos', { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(400)

  if (viewport.width === 1440) {
    await page.locator('.ap-vision').scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    await page.locator('.ap-vision').screenshot({ path: join(OUT, 'vision-band.png') })
  }

  /* Every overlay the page can open: the six projects, the vision and the chart. */
  const logos = await page.locator('.ap-projets__logos .ap-logo').count()
  const openers = [
    ...Array.from({ length: logos }, (_, i) => [`projet-${i}`, '.ap-projets__logos .ap-logo', i]),
    ['vision', '.ap-vision .readmore__toggle', 0],
    ['pourquoi', '.ap-why__more', 0],
    ['chart', '.ap-kpi__open', 0],
  ]

  for (const [name, selector, index] of openers) {
    await page.locator(selector).nth(index).click()
    await page.waitForTimeout(400)
    const fit = await page.evaluate(() => {
      const card = document.querySelector('.sheet__card')
      const r = card.getBoundingClientRect()
      const sheet = document.querySelector('.sheet')
      return {
        zoom: Number(getComputedStyle(card).getPropertyValue('--fit')).toFixed(2),
        onScreen: `${Math.round(r.width)}x${Math.round(r.height)}`,
        cardScrolls: card.scrollHeight > card.clientHeight + 1,
        sheetScrolls: sheet.scrollHeight > sheet.clientHeight + 1,
        clippedTop: Math.round(r.top),
        clippedBottom: Math.round(window.innerHeight - r.bottom),
      }
    })
    const bad = fit.cardScrolls || fit.sheetScrolls || fit.clippedTop < 0 || fit.clippedBottom < 0
    console.log(`${viewport.height}px ${name}:`, JSON.stringify(fit), bad ? 'SCROLLS' : 'fits')
    if (viewport.width === 1440 && (name === 'projet-0' || name === 'vision')) {
      await page.screenshot({ path: join(OUT, `sheet-${name}.png`) })
    }
    await page.keyboard.press('Escape')
    await page.waitForTimeout(220)
  }
  await page.close()
}

await browser.close()
console.log('shots in', OUT)
