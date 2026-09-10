import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const BASE = process.argv[2] || 'http://127.0.0.1:3030'
const outDir = join(process.cwd(), 'tools', 'out', 'home-qa-audit')
mkdirSync(outDir, { recursive: true })

const viewports = [
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'cliff-1100', width: 1100, height: 800 },
]

const sections = [
  { id: 'hero', sel: '#hero, .band--hero' },
  { id: 'chiffres', sel: '#chiffres, .band--chiffres' },
  { id: 'projets', sel: '#projets, .band--projets' },
  { id: 'map', sel: '#map, .band--map' },
  { id: 'streams', sel: '#streams, .band--streams' },
  { id: 'stories', sel: '#stories, .band--stories' },
  { id: 'footer', sel: '.footer' },
]

async function auditPage(page, vp) {
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 45000 })
  await page.waitForTimeout(800)

  const data = await page.evaluate((sections) => {
    const html = document.documentElement
    const body = document.body
    const overflow = Math.max(
      html.scrollWidth - html.clientWidth,
      body.scrollWidth - body.clientWidth,
    )

    const issues = []
    if (overflow > 2) issues.push({ type: 'horizontal-overflow', px: overflow })

    const zoom = getComputedStyle(html).getPropertyValue('--zoom').trim()
    const rootFs = parseFloat(getComputedStyle(html).fontSize)

    const brokenImages = [...document.querySelectorAll('img')].filter((img) => {
      if (!img.complete || img.naturalWidth === 0) return true
      return false
    }).map((img) => ({ src: img.currentSrc || img.src, alt: img.alt, cls: img.className }))

    if (brokenImages.length) {
      issues.push({ type: 'broken-images', count: brokenImages.length, items: brokenImages.slice(0, 10) })
    }

    const heroBtns = [...document.querySelectorAll('.hero__btn')]
    for (const btn of heroBtns) {
      const cs = getComputedStyle(btn)
      const rect = btn.getBoundingClientRect()
      const bg = cs.backgroundColor
      const border = cs.borderColor
      const cls = [...btn.classList].join(' ')
      if (!cls.includes('btn--line-white-orange')) {
        issues.push({ type: 'hero-cta-wrong-class', cls })
      }
      if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        issues.push({ type: 'hero-cta-not-transparent', bg, cls })
      }
    }

    const smallText = []
    for (const el of document.querySelectorAll('.page--home p, .page--home span, .page--home dd, .page--home dt, .page--home a, .page--home button, .page--home h1, .page--home h2, .page--home h3, .footer p, .footer a')) {
      const fs = parseFloat(getComputedStyle(el).fontSize)
      if (fs > 0 && fs < 12 && el.textContent?.trim()) {
        const rect = el.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          smallText.push({ tag: el.tagName, cls: el.className?.slice?.(0, 60), fs, text: el.textContent.trim().slice(0, 40) })
        }
      }
    }

    if (smallText.length) {
      issues.push({ type: 'text-under-12px', count: smallText.length, samples: smallText.slice(0, 8) })
    }

    const outside = []
    for (const band of document.querySelectorAll('.page--home .band')) {
      const bandRect = band.getBoundingClientRect()
      for (const child of band.querySelectorAll(':scope > *')) {
        const cs = getComputedStyle(child)
        if (cs.position === 'absolute' && cs.display === 'none') continue
        const r = child.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue
        const pad = 4
        if (r.left < bandRect.left - pad || r.right > bandRect.right + pad) {
          outside.push({
            band: band.className,
            child: child.className?.slice?.(0, 80) || child.tagName,
            left: Math.round(r.left - bandRect.left),
            right: Math.round(r.right - bandRect.right),
          })
        }
      }
    }

    if (outside.length) {
      issues.push({ type: 'elements-outside-band', count: outside.length, samples: outside.slice(0, 8) })
    }

    const compact = []
    for (const el of document.querySelectorAll('.hero__title span, .hero__body, .kpi__label, .projets__body, .map__body, .card__body, .card__title')) {
      const cs = getComputedStyle(el)
      const lh = parseFloat(cs.lineHeight)
      const fs = parseFloat(cs.fontSize)
      if (fs > 0 && lh / fs < 1.15 && el.textContent?.trim()?.length > 20) {
        compact.push({ cls: el.className, ratio: +(lh / fs).toFixed(2), fs })
      }
    }

    const sectionStatus = sections.map(({ id, sel }) => {
      const el = document.querySelector(sel)
      if (!el) return { id, found: false }
      const r = el.getBoundingClientRect()
      return { id, found: true, height: Math.round(r.height), width: Math.round(r.width) }
    })

    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      zoom,
      rootFs,
      overflow,
      heroBtnCount: heroBtns.length,
      issues,
      sectionStatus,
      compactText: compact.slice(0, 6),
    }
  }, sections)

  for (const { id, sel } of sections) {
    const loc = page.locator(sel).first()
    if (await loc.count()) {
      await loc.scrollIntoViewIfNeeded().catch(() => {})
      await page.waitForTimeout(200)
      await loc.screenshot({ path: join(outDir, `${vp.name}-${id}.png`) }).catch(async () => {
        await page.screenshot({ path: join(outDir, `${vp.name}-${id}-fallback.png`), fullPage: false })
      })
    }
  }

  // Hero CTA hover state (desktop/cliff only)
  if (vp.width >= 1100) {
    const btn = page.locator('.hero__btn').first()
    if (await btn.count()) {
      await btn.scrollIntoViewIfNeeded()
      await btn.hover()
      await page.waitForTimeout(200)
      const hover = await btn.evaluate((el) => {
        const cs = getComputedStyle(el)
        return {
          bg: cs.backgroundColor,
          color: cs.color,
          border: cs.borderColor,
        }
      })
      data.heroHover = hover
      const orange = 'rgb(241, 168, 72)'
      if (hover.bg !== orange) {
        data.issues.push({ type: 'hero-hover-not-orange', hover })
      }
    }
  }

  await page.screenshot({ path: join(outDir, `${vp.name}-full-top.png`), fullPage: false })

  return data
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const report = []

for (const vp of viewports) {
  await page.setViewportSize({ width: vp.width, height: vp.height })
  const result = await auditPage(page, vp)
  report.push({ viewport: vp.name, ...result })
  console.log(JSON.stringify({ viewport: vp.name, overflow: result.overflow, zoom: result.zoom, rootFs: result.rootFs, issueCount: result.issues.length, issues: result.issues }))
}

writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 2))
console.log('Report written to', join(outDir, 'report.json'))
await browser.close()
