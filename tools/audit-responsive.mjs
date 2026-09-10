import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { join } from 'path'

const outDir = join(process.cwd(), 'tools', 'out', 'responsive-audit')
mkdirSync(outDir, { recursive: true })

const viewports = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
]
const urls = [
  { label: 'home', url: 'http://127.0.0.1:3030/' },
  { label: 'apropos', url: 'http://127.0.0.1:3030/programme/a-propos' },
]

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const summary = []

for (const vp of viewports) {
  await page.setViewportSize({ width: vp.width, height: vp.height })
  for (const { label, url } of urls) {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    if (label === 'apropos') {
      const tab = page.getByRole('tab', { name: /INSTITUTIONS/i })
      if (await tab.count()) await tab.click().catch(() => {})
      await page.waitForTimeout(400)
      await page.locator('#partenaires').scrollIntoViewIfNeeded().catch(() => {})
    }

    await page.screenshot({
      path: join(outDir, `${label}-${vp.name}.png`),
      fullPage: false,
    })

    const data = await page.evaluate(() => {
      const html = document.documentElement
      const issues = []
      const overflow = html.scrollWidth - html.clientWidth
      if (overflow > 2) issues.push(`horizontal-overflow:${overflow}px`)

      const zoom = getComputedStyle(html).getPropertyValue('--zoom').trim()
      const rootFs = getComputedStyle(html).fontSize

      const btns = [...document.querySelectorAll('.hero__btn, .ap-hero__actions .btn')].map((b) => ({
        cls: [...b.classList].filter((c) => c.startsWith('btn')).join(' '),
        bg: getComputedStyle(b).backgroundColor,
        w: Math.round(b.getBoundingClientRect().width),
        h: Math.round(b.getBoundingClientRect().height),
      }))

      if (btns.some((b) => b.cls.includes('fill-orange'))) issues.push('hero-has-fill-orange')
      if (btns.some((b) => b.bg === 'rgb(255, 255, 255)')) issues.push('hero-has-white-fill')
      if (btns.length && btns.some((b) => !b.cls.includes('line-white-orange'))) {
        issues.push('hero-wrong-class')
      }
      if (btns.length && btns.some((b) => b.w < 120 && window.innerWidth < 600)) {
        issues.push('hero-btn-too-narrow')
      }

      const h1 = document.querySelector('h1')
      const h1fs = h1 ? getComputedStyle(h1).fontSize : null
      if (h1fs && parseFloat(h1fs) < 18) issues.push(`h1-too-small:${h1fs}`)

      const burgerVisible = (() => {
        const el = document.querySelector('.header__burger')
        return el ? getComputedStyle(el).display !== 'none' : false
      })()

      const navVisible = (() => {
        const el = document.querySelector('.nav')
        return el ? getComputedStyle(el).display !== 'none' : false
      })()

      const plate = document.querySelector('.ap-orgs__plate')
      const marks = document.querySelector('.ap-orgs__marks')

      return {
        zoom,
        rootFs,
        overflow,
        btnCount: btns.length,
        btns,
        issues,
        h1fs,
        burgerVisible,
        navVisible,
        plateVisible: plate ? getComputedStyle(plate).display !== 'none' : null,
        marksVisible: marks ? getComputedStyle(marks).display !== 'none' : null,
        partnersGap: (() => {
          const orgs = document.querySelector('.ap-orgs')
          const avenir = document.querySelector('.ap-avenir')
          if (!orgs || !avenir) return null
          return Math.round(avenir.getBoundingClientRect().top - orgs.getBoundingClientRect().bottom)
        })(),
      }
    })

    const row = { vp: vp.name, page: label, ...data }
    summary.push(row)
    console.log(JSON.stringify(row))
  }
}

const failed = summary.filter((r) => r.issues.length > 0)
console.log('---')
console.log(`Checked ${summary.length} viewports; ${failed.length} with notes`)
await browser.close()
