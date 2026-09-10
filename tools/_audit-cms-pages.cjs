const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const BASE = 'http://localhost:3030'
const OUT = path.join(__dirname, 'out', 'cms-audit')

const PAGES = [
  { path: '/', name: 'home', sections: ['hero', 'chiffres', 'projets', 'map', 'streams', 'stories', 'publications', 'newsletter'] },
  { path: '/programme/a-propos', name: 'a-propos', sections: ['hero', 'pourquoi', 'vision', 'objectifs', 'comment', 'projets', 'territoires', 'impact', 'partners', 'avenir'] },
  { path: '/programme/objectifs', name: 'objectifs', sections: ['hero', 'objectives', 'action', 'projets'] },
  { path: '/programme/financement', name: 'financement', sections: ['hero', 'facts', 'projects', 'purpose', 'structure', 'cta'] },
  { path: '/programme/gouvernance', name: 'gouvernance', sections: ['hero', 'model', 'map', 'eu', 'framework', 'institutions'] },
  { path: '/eu-en-tunisie', name: 'eu-en-tunisie', sections: ['hero', 'intro', 'themes', 'explore'] },
  { path: '/carte', name: 'carte', sections: ['hero', 'filters', 'map', 'results'] },
  { path: '/actualites', name: 'actualites', sections: ['hero', 'browser'] },
  { path: '/publications', name: 'publications', sections: ['hero', 'browser'] },
  { path: '/opportunites', name: 'opportunites', sections: ['hero', 'browser'] },
  { path: '/stories', name: 'stories', sections: ['hero', 'archive', 'slots', 'projects'] },
  { path: '/agenda', name: 'agenda', sections: ['hero', 'browser'] },
  { path: '/coin-media', name: 'coin-media', sections: ['hero', 'access', 'news', 'videos', 'resources', 'press'] },
  { path: '/projets', name: 'projets', sections: ['hero', 'filters', 'grid', 'cta'] },
  { path: '/contact', name: 'contact', sections: ['hero', 'form'] },
]

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

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  const token = await loginToken()
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
  const report = []

  for (const entry of PAGES) {
    const url = `${BASE}${entry.path}?edit_token=${token}&live_edit=1`
    const item = { page: entry.name, path: entry.path, ok: true, issues: [], errors: [] }
    try {
      const pageErrors = []
      page.on('pageerror', (error) => pageErrors.push(String(error.message || error)))
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
      await page.waitForSelector('body.cms-editing', { timeout: 25000 })
      page.removeAllListeners('pageerror')
      if (pageErrors.length) item.errors = pageErrors

      const bodyLen = await page.evaluate(() => document.body.innerText.trim().length)
      if (bodyLen < 120) item.issues.push('blank-or-empty-page')

      for (const section of entry.sections) {
        const sel = `[data-cms-section="${section}"]`
        if (!(await page.locator(sel).count())) {
          item.issues.push(`missing-section:${section}`)
          continue
        }
        await page.locator(sel).first().scrollIntoViewIfNeeded()
        await page.waitForTimeout(250)
      }

      await page.screenshot({ path: path.join(OUT, `${entry.name}.png`), fullPage: true })

      const triggers = await page.locator('.cms-list-trigger').count()
      const pencils = await page.locator('.cms-pencil').count()
      item.triggers = triggers
      item.pencils = pencils

      if (entry.name === 'home') {
        const hint = await page.locator('.hero-carousel__edit-hint').textContent().catch(() => '')
        const manage = await page.locator('.hero-carousel__list .cms-list-trigger').count()
        if (!manage) item.issues.push('hero-missing-gerer-images')
        item.heroHint = hint?.trim()
      }
    } catch (error) {
      item.ok = false
      item.issues.push(String(error.message || error))
    }
    item.ok = item.issues.length === 0
    report.push(item)
    console.log(`${item.ok ? 'OK' : 'FAIL'} ${entry.name}`, item.issues.join(', ') || '')
  }

  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  const failed = report.filter((row) => !row.ok)
  process.exit(failed.length ? 1 : 0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
