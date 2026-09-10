/** Check FR/EN/AR content blocks exist for key pages and hero slides stay aligned. */
async function login() {
  const login = await fetch('http://localhost:8040/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@eu4youth.org', password: 'eu4youth' }),
  }).then((r) => r.json())
  return login.token
}

async function pageBlocks(page, locale) {
  const res = await fetch(`http://localhost:8040/api/content/${page}?locale=${locale}`)
  return res.json().then((d) => d.blocks || {})
}

async function main() {
  const token = await login()
  if (!token) throw new Error('login failed')

  const pages = ['home', 'actualites', 'publications', 'carte', 'agenda', 'stories', 'opportunites']
  const locales = ['fr', 'en', 'ar']
  const report = []

  for (const page of pages) {
    const row = { page, locales: {}, issues: [] }
    for (const locale of locales) {
      const blocks = await pageBlocks(page, locale)
      row.locales[locale] = {
        keys: Object.keys(blocks).length,
        heroTitle: blocks['hero.title']?.slice(0, 40) || null,
        heroBadge: blocks['hero.badge']?.slice(0, 40) || null,
      }
      if (!Object.keys(blocks).length) row.issues.push(`empty-${locale}`)
    }
    if (page === 'home') {
      const frSlides = JSON.parse((await pageBlocks('home', 'fr'))['hero.slides'] || '[]')
      const enSlides = JSON.parse((await pageBlocks('home', 'en'))['hero.slides'] || '[]')
      const imagesMatch =
        frSlides.length === enSlides.length &&
        frSlides.every((s, i) => s.image === enSlides[i]?.image)
      if (!imagesMatch) row.issues.push('hero-slides-locale-mismatch')
      row.heroSlideCount = frSlides.length
    }
    row.ok = row.issues.length === 0
    report.push(row)
    console.log(row.ok ? 'OK' : 'FAIL', page, row.issues.join(', ') || `keys fr=${row.locales.fr.keys}`)
  }

  const fs = require('fs')
  const path = require('path')
  const out = path.join(__dirname, 'out', 'cms-audit', 'locale-report.json')
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, JSON.stringify(report, null, 2))

  const failed = report.filter((r) => !r.ok)
  process.exit(failed.length ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
