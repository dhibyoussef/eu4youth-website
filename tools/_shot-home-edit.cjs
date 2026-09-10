const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const OUT = path.join(__dirname, 'out', 'home-edit-audit')
const BASE = 'http://localhost:3030'

async function loginToken() {
  const login = await fetch('http://localhost:8040/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@eu4youth.org', password: 'eu4youth' }),
  }).then((r) => r.json())
  const edit = await fetch('http://localhost:8040/api/admin/edit-session', {
    method: 'POST',
    headers: { Authorization: `Bearer ${login.token}`, 'Content-Type': 'application/json' },
    body: '{}',
  }).then((r) => r.json())
  return edit.token
}

function overlap(a, b) {
  const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
  const y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))
  return x * y
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const token = await loginToken()
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
  await page.goto(`${BASE}/?edit_token=${token}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('body.cms-editing', { timeout: 15000 })

  const sections = [
    { id: 'hero', name: 'hero' },
    { id: 'map', name: 'map' },
    { id: 'streams', name: 'streams' },
    { id: 'stories', name: 'stories' },
    { id: 'publications', name: 'publications' },
    { id: 'newsletter', name: 'newsletter' },
  ]

  const report = []

  for (const section of sections) {
    const el = page.locator(`[data-cms-section="${section.id}"]`)
    if (!(await el.count())) continue
    await el.scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)
    await el.screenshot({ path: path.join(OUT, `${section.name}.png`) })

    const issues = await page.evaluate((sectionId) => {
      const root = document.querySelector(`[data-cms-section="${sectionId}"]`)
      if (!root) return []
      const found = []
      const pencils = root.querySelectorAll('.cms-pencil')
      pencils.forEach((pencil) => {
        const pr = pencil.getBoundingClientRect()
        const host =
          pencil.closest('.home-btn-edit') ||
          pencil.closest('a, button, .cms-editable--text, .news__field-edit') ||
          pencil.parentElement
        if (!host) return
        const hr = host.getBoundingClientRect()
        const ix = Math.max(0, Math.min(pr.right, hr.right) - Math.max(pr.left, hr.left))
        const iy = Math.max(0, Math.min(pr.bottom, hr.bottom) - Math.max(pr.top, hr.top))
        const area = ix * iy
        const pencilArea = Math.max(1, pr.width * pr.height)
        if (area / pencilArea > 0.35) {
          found.push({
            host: host.className,
            overlapPct: Math.round((area / pencilArea) * 100),
          })
        }
      })
      const mapImg = root.querySelector('.map__art img, .map__art .cms-editable__media')
      const bandArt = root.querySelector('.band__art img, .band__art .cms-editable__media')
      const collage = root.querySelector('.news__collage-wrap')
      if (sectionId === 'map' && mapImg) {
        const r = mapImg.getBoundingClientRect()
        if (r.width < 80 || r.height < 80) found.push({ missing: 'map image too small', w: r.width, h: r.height })
      }
      if (sectionId === 'publications' && bandArt) {
        const r = bandArt.getBoundingClientRect()
        if (r.width < 80 || r.height < 80) found.push({ missing: 'publications art too small', w: r.width, h: r.height })
      }
      if (sectionId === 'newsletter' && collage) {
        const bg = getComputedStyle(collage).backgroundImage
        if (!bg || bg === 'none') found.push({ missing: 'newsletter collage background' })
      }
      return found
    }, section.id)

    report.push({ section: section.name, issues, pencils: await page.locator(`[data-cms-section="${section.id}"] .cms-pencil`).count() })
  }

  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
