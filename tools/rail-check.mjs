/**
 * Check that every route's first content rail lands on the centred canvas, and
 * shoot each page's top for a look. Reports the gutter each side of the canvas
 * so a band that is still measured off the window shows up as an odd number.
 *
 * Usage: node tools/rail-check.mjs [baseUrl] [width]
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const [baseUrl = 'http://127.0.0.1:3010', width = '1920'] = process.argv.slice(2)

const ROUTES = [
  '/',
  '/programme/a-propos',
  '/projets/jeuness',
  '/carte',
  '/actualites',
  '/opportunites',
  '/publications',
  '/glossaire',
  '/contact',
]

mkdirSync('tools/out/align', { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: Number(width), height: 1000 } })

for (const route of ROUTES) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)

  const measured = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement)
    const rem = parseFloat(root.fontSize)
    const canvas = 192 * rem
    const offset = Math.max(0, (window.innerWidth - canvas) / 2)
    const left = (selector) => {
      const el = document.querySelector(selector)
      return el ? Math.round(el.getBoundingClientRect().left) : null
    }
    const rightGap = (selector) => {
      const el = document.querySelector(selector)
      return el ? Math.round(window.innerWidth - el.getBoundingClientRect().right) : null
    }
    return {
      rem,
      offset: Math.round(offset),
      navLeft: left('.nav__item:first-child .nav__link'),
      utilsRight: rightGap('.nav__utils'),
      flagsRight: rightGap('.header__flags'),
      h1Left: left('main h1'),
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }
  })

  const slug = route === '/' ? 'home' : route.slice(1).replace(/\//g, '-')
  await page.screenshot({ path: `tools/out/align/page-${slug}.png`, clip: { x: 0, y: 0, width: Number(width), height: 1000 } })
  console.log(
    `${route.padEnd(24)} offset ${String(measured.offset).padStart(4)}` +
      `  nav ${String(measured.navLeft).padStart(4)}` +
      `  utils→ ${String(measured.utilsRight).padStart(4)}` +
      `  flags→ ${String(measured.flagsRight).padStart(4)}` +
      `  h1 ${String(measured.h1Left).padStart(4)}` +
      `  scroll ${measured.scrollWidth}/${measured.innerWidth}`,
  )
}

await browser.close()
