const { chromium } = require('playwright')

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

async function heroBadge(locale, token) {
  const res = await fetch(`http://localhost:8040/api/content/home?locale=${locale}`)
  const data = await res.json()
  return data.blocks?.['hero.badge'] || ''
}

async function main() {
  const token = await loginToken()
  const fr = await heroBadge('fr', token)
  const en = await heroBadge('en', token)
  const ar = await heroBadge('ar', token)

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } })

  for (const locale of ['fr', 'en', 'ar']) {
    await page.goto(`http://localhost:3030/?edit_token=${token}&live_edit=1&locale=${locale}`, {
      waitUntil: 'networkidle',
    })
    await page.waitForSelector('body.cms-editing', { timeout: 20000 })
    const shown = await page.locator('.hero__badge').first().textContent()
    const api = locale === 'fr' ? fr : locale === 'en' ? en : ar
    const ok = shown?.trim().includes(api.trim().slice(0, 20))
    console.log(locale, ok ? 'OK' : 'MISMATCH', 'api:', api.slice(0, 50), '| page:', shown?.trim().slice(0, 50))
  }

  await browser.close()
  const hasAll = fr && en && ar && fr !== en
  console.log('Translations present:', hasAll ? 'yes (FR≠EN)' : 'check needed')
  process.exit(hasAll ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
